'use strict';

const assert = require('node:assert/strict');
const net = require('node:net');
const { after, before, describe, it } = require('node:test');
const { DmsFehler, DmsVerbindung, normalisiereAdresse, pruefeSchluesselFormat, leseZaehlerstand } = require('../lib/dms');
const { starteFakeDms } = require('./fake-dms');

const ZAEHLER = 'dms_zaehlerLenaTestschluessel';
const LESEN = 'dms_lesenLenaTestschluessel00';
const SCHREIBEN = 'dms_schreibenJonasTestschluessel';
const ABGELAUFEN = 'dms_abgelaufenPetraTestschluessel';

const code = (c) => (e) => e instanceof DmsFehler && e.code === c;

describe('Adresse und Schlüssel prüfen', () => {
  it('bringt Adressen in eine feste Form', () => {
    assert.equal(normalisiereAdresse(' https://dms.home.arpa/ '), 'https://dms.home.arpa');
    assert.equal(normalisiereAdresse('http://192.0.2.10:8080'), 'http://192.0.2.10:8080');
    assert.equal(normalisiereAdresse('https://dms.home.arpa/api/v1/ich/zaehler'), 'https://dms.home.arpa');
    assert.equal(normalisiereAdresse('https://nas.example.org/dms/api/v1/'), 'https://nas.example.org/dms');
  });

  it('lehnt Adressen ohne http(s) ab', () => {
    for (const a of ['', 'dms.home.arpa', 'ftp://dms.home.arpa', 'https://lena:geheim@dms.home.arpa']) {
      assert.throws(() => normalisiereAdresse(a), code('adresse_ungueltig'), a);
    }
  });

  it('erkennt Schlüssel, die nicht wie ein API-Schlüssel des DMS aussehen', () => {
    assert.equal(pruefeSchluesselFormat(` ${ZAEHLER} `), ZAEHLER);
    for (const s of ['', 'geheim', 'dms_', 'dms_kurz', 'dms_mit leerzeichen']) assert.throws(() => pruefeSchluesselFormat(s), code('schluessel_format'), s);
  });

  it('liest nur die bekannten Zahlen', () => {
    const erwartet = { neuePost: 2, zuErledigen: 5, ueberfaellig: 1, stand: 42, geaendert: '2026-11-03T07:15:00.000Z' };
    // Ablago bis 0.18x liefert noch `anstehend`, danach nicht mehr (dms #725): beides geht, unbekannte Felder fallen weg.
    assert.deepEqual(leseZaehlerstand({ ...erwartet, anstehend: 3, extra: 'x' }), erwartet);
    assert.deepEqual(leseZaehlerstand(erwartet), erwartet);
    assert.deepEqual(leseZaehlerstand({ ...erwartet, anstehend: 'kaputt' }), erwartet, '`anstehend` wird gar nicht gelesen');
    assert.throws(() => leseZaehlerstand({ neuePost: 2 }), code('kein_dms'));
    assert.throws(() => leseZaehlerstand({ neuePost: -1, zuErledigen: 0, ueberfaellig: 0, stand: 1 }), code('kein_dms'));
    assert.throws(() => leseZaehlerstand(null), code('kein_dms'));
  });
});

describe('Abruf gegen einen nachgebauten DMS-Server', () => {
  let dms;
  before(async () => { dms = await starteFakeDms(); });
  after(async () => { await dms.stopp(); });

  it('liefert die Zahlen wie das DMS und schickt den Schlüssel als Bearer', async () => {
    dms.setze({ neuePost: 2, zuErledigen: 5, anstehend: 3, ueberfaellig: 1 });
    const v = new DmsVerbindung({ adresse: dms.adresse, schluessel: ZAEHLER });
    const r = await v.zaehler();
    assert.equal(r.geaendert, true);
    assert.deepEqual({ ...r.zahlen, stand: 0, geaendert: '' }, { neuePost: 2, zuErledigen: 5, ueberfaellig: 1, stand: 0, geaendert: '' });
    assert.match(r.etag, /^"z\d+-[\w-]+"$/);
    const letzte = dms.zustand.anfragen.at(-1);
    assert.equal(letzte.pfad, '/api/v1/ich/zaehler');
    assert.equal(letzte.auth, `Bearer ${ZAEHLER}`);
  });

  it('überträgt bei unverändertem Stand keine Daten (304 mit If-None-Match)', async () => {
    const v = new DmsVerbindung({ adresse: dms.adresse, schluessel: ZAEHLER });
    const a = await v.zaehler();
    const b = await v.zaehler(a.etag);
    assert.deepEqual(b, { geaendert: false, etag: a.etag });
    assert.equal(dms.zustand.anfragen.at(-1).ifNoneMatch, a.etag);
    const antwort = dms.zustand.antworten.at(-1);
    assert.equal(antwort.status, 304);
    assert.equal(antwort.laenge, 0);
    // Nach einer Änderung kommt wieder alles.
    dms.setze({ neuePost: 3 });
    const c = await v.zaehler(a.etag);
    assert.equal(c.geaendert, true);
    assert.notEqual(c.etag, a.etag);
    assert.equal(c.zahlen.neuePost, 3);
  });

  it('arbeitet auch unter einem Pfad hinter einem Reverse-Proxy', async () => {
    const unter = await starteFakeDms({ pfad: '/dms' });
    try {
      const r = await new DmsVerbindung({ adresse: `${unter.adresse}/`, schluessel: ZAEHLER }).zaehler();
      assert.equal(r.geaendert, true);
    } finally {
      await unter.stopp();
    }
  });

  it('erkennt die Stufe des Schlüssels', async () => {
    assert.equal(await new DmsVerbindung({ adresse: dms.adresse, schluessel: ZAEHLER }).stufe(), 'zaehler');
    assert.equal(await new DmsVerbindung({ adresse: dms.adresse, schluessel: LESEN }).stufe(), 'lesen');
    assert.equal(await new DmsVerbindung({ adresse: dms.adresse, schluessel: SCHREIBEN }).stufe(), 'schreiben');
  });

  it('Verbindungstest: „nur Zähler“ und „nur lesen“ gehen, „lesen und schreiben“ nicht', async () => {
    const ok = await new DmsVerbindung({ adresse: dms.adresse, schluessel: ZAEHLER }).pruefe();
    assert.equal(ok.stufe, 'zaehler');
    assert.equal(typeof ok.zahlen.neuePost, 'number');
    assert.equal((await new DmsVerbindung({ adresse: dms.adresse, schluessel: LESEN }).pruefe()).stufe, 'lesen');
    await assert.rejects(new DmsVerbindung({ adresse: dms.adresse, schluessel: SCHREIBEN }).pruefe(), code('falsche_stufe'));
  });

  it('Schlüssel ungültig oder abgelaufen: 401', async () => {
    await assert.rejects(new DmsVerbindung({ adresse: dms.adresse, schluessel: 'dms_gibtEsNichtTestschluessel' }).zaehler(), code('schluessel_ungueltig'));
    await assert.rejects(new DmsVerbindung({ adresse: dms.adresse, schluessel: ABGELAUFEN }).pruefe(), code('schluessel_ungueltig'));
  });

  it('Wartungsmodus: 503 mit Wartezeit', async () => {
    dms.zustand.wartung = true;
    try {
      await assert.rejects(new DmsVerbindung({ adresse: dms.adresse, schluessel: ZAEHLER }).zaehler(), (e) => e.code === 'wartung' && e.wiederholenNach === 120);
    } finally {
      dms.zustand.wartung = false;
    }
  });

  it('falsche Adresse: kein DMS oder Weiterleitung', async () => {
    await assert.rejects(new DmsVerbindung({ adresse: `${dms.adresse}/irgendwas`, schluessel: ZAEHLER }).zaehler(), code('kein_dms'));
    await assert.rejects(new DmsVerbindung({ adresse: `${dms.adresse}/umleitung`, schluessel: ZAEHLER }).zaehler(), code('umleitung'));
  });
});

describe('DMS nicht erreichbar', () => {
  it('geschlossener Port', async () => {
    const frei = await new Promise((r) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => r(port)); }); });
    await assert.rejects(new DmsVerbindung({ adresse: `http://127.0.0.1:${frei}`, schluessel: ZAEHLER }).zaehler(), code('nicht_erreichbar'));
  });

  it('keine Antwort innerhalb des Zeitlimits', async () => {
    const offen = [];
    const s = net.createServer((c) => { offen.push(c); });
    await new Promise((r) => s.listen(0, '127.0.0.1', r));
    try {
      await assert.rejects(new DmsVerbindung({ adresse: `http://127.0.0.1:${s.address().port}`, schluessel: ZAEHLER, zeitlimitMs: 200 }).zaehler(), code('nicht_erreichbar'));
    } finally {
      for (const c of offen) c.destroy();
      await new Promise((r) => s.close(r));
    }
  });

  it('Zertifikat nicht vertrauenswürdig', async () => {
    const e = new TypeError('fetch failed');
    e.cause = { code: 'SELF_SIGNED_CERT_IN_CHAIN' };
    const v = new DmsVerbindung({ adresse: 'https://dms.home.arpa', schluessel: ZAEHLER, fetch: async () => { throw e; } });
    await assert.rejects(v.zaehler(), code('zertifikat'));
  });
});
