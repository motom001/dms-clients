'use strict';

/**
 * Rauchtest für Treiber und Gerät mit einem kleinen Ersatz für das Modul `homey` – ohne Homey-Laufzeit.
 * Prüft das Zusammenspiel: Einrichten mit Verbindungstest, Werte, Auslöser, Bedingung und Fehlertexte.
 */

const assert = require('node:assert/strict');
const Module = require('node:module');
const { after, before, describe, it } = require('node:test');
const de = require('../locales/de.json');
const manifest = require('../app.json');
const { starteFakeDms } = require('./fake-dms');

const ausgeloest = [];
const zeitgeber = new Set();

function text(key) {
  return key.split('.').reduce((o, k) => (o ? o[k] : undefined), de) || key;
}

function karte(id) {
  return {
    id,
    lauscher: null,
    registerRunListener(f) { this.lauscher = f; return this; },
    async trigger(geraet, tokens, state) {
      // Wie Homey: der Lauscher entscheidet je Flow anhand seiner Argumente.
      ausgeloest.push({ id, tokens, state, passt: (args) => (this.lauscher ? this.lauscher({ device: geraet, ...args }, state) : true) });
    },
  };
}

const karten = {};
const homey = {
  manifest,
  __: text,
  flow: {
    getDeviceTriggerCard: (id) => { karten[id] = karten[id] || karte(id); return karten[id]; },
    getConditionCard: (id) => { karten[id] = karten[id] || karte(id); return karten[id]; },
  },
  setTimeout: (f, ms) => { const t = setTimeout(f, ms); zeitgeber.add(t); return t; },
  clearTimeout: (t) => { clearTimeout(t); zeitgeber.delete(t); },
};

class Basis {
  constructor() { this.homey = homey; }
  log() {}
  error() {}
}

class Geraet extends Basis {
  constructor(driver, settings) {
    super();
    this.driver = driver;
    this.settings = { ...settings };
    this.werte = {};
    this.caps = new Set();
    this.verfuegbar = true;
    this.grund = null;
    this.warnung = null;
  }
  getSettings() { return { ...this.settings }; }
  async setSettings(s) { Object.assign(this.settings, s); }
  hasCapability(c) { return this.caps.has(c); }
  async addCapability(c) { this.caps.add(c); this.werte[c] = null; }
  async removeCapability(c) { this.caps.delete(c); delete this.werte[c]; }
  getCapabilityValue(c) { return this.werte[c] ?? null; }
  async setCapabilityValue(c, w) { this.werte[c] = w; }
  async setUnavailable(m) { this.verfuegbar = false; this.grund = m; }
  async setAvailable() { this.verfuegbar = true; this.grund = null; }
  async setWarning(m) { this.warnung = m; }
  async unsetWarning() { this.warnung = null; }
}

const laden = Module._load;
Module._load = function (anfrage, ...rest) {
  if (anfrage === 'homey') return { App: Basis, Driver: Basis, Device: Geraet };
  return laden.call(this, anfrage, ...rest);
};
const DmsDriver = require('../drivers/dms/driver');
const DmsDevice = require('../drivers/dms/device');
const DmsApp = require('../app');

async function bis(bedingung, ms = 3000) {
  const ende = Date.now() + ms;
  while (!bedingung()) {
    if (Date.now() > ende) throw new Error('Zeitüberschreitung');
    await new Promise((r) => setTimeout(r, 10));
  }
}

function sitzung() {
  const h = {};
  return { h, setHandler(n, f) { h[n] = f; return this; } };
}

describe('Treiber und Gerät (mit Ersatz für Homey)', () => {
  let dms;
  let driver;
  before(async () => {
    dms = await starteFakeDms();
    await new DmsApp().onInit();
    driver = new DmsDriver();
    await driver.onInit();
  });
  after(async () => {
    for (const t of zeitgeber) clearTimeout(t);
    Module._load = laden;
    await dms.stopp();
  });

  it('Einrichten: Verbindungstest mit verständlichen Fehlern, dann genau ein Gerät', async () => {
    const s = sitzung();
    await driver.onPair(s);
    await assert.rejects(s.h.login({ username: 'dms.home.arpa', password: 'dms_zaehlerLenaTestschluessel' }), { message: de.fehler.adresse_ungueltig });
    await assert.rejects(s.h.login({ username: dms.adresse, password: 'dms_gibtEsNichtTestschluessel' }), { message: de.fehler.schluessel_ungueltig });
    await assert.rejects(s.h.login({ username: dms.adresse, password: 'dms_schreibenJonasTestschluessel' }), { message: de.fehler.falsche_stufe });
    await assert.rejects(s.h.login({ username: 'http://127.0.0.1:1', password: 'dms_zaehlerLenaTestschluessel' }), { message: de.fehler.nicht_erreichbar });
    assert.equal(await s.h.login({ username: `${dms.adresse}/`, password: 'dms_zaehlerLenaTestschluessel' }), true);
    const liste = await s.h.list_devices();
    assert.equal(liste.length, 1);
    assert.equal(liste[0].name, 'Ablago');
    assert.deepEqual(liste[0].settings, { adresse: dms.adresse, schluessel: 'dms_zaehlerLenaTestschluessel', intervall: 5 });
    assert.match(liste[0].data.id, /^[0-9a-f-]{36}$/);
    assert.ok(!JSON.stringify(liste[0].data).includes('dms_'), 'Schlüssel nicht in den Gerätedaten');
  });

  it('Gerät: Werte wie im DMS, Auslöser bei neuer Post, Bedingung, Fehler und Erholung', async () => {
    // Ablago bis 0.18x liefert noch `anstehend`; die App liest es nicht.
    dms.setze({ neuePost: 0, zuErledigen: 2, anstehend: 1, ueberfaellig: 0 });
    const g = new DmsDevice(driver, { adresse: dms.adresse, schluessel: 'dms_zaehlerLenaTestschluessel', intervall: 5 });
    await g.onInit();
    await bis(() => g.getCapabilityValue('dms_zu_erledigen') === 2);
    assert.deepEqual(g.werte, { dms_neue_post: 0, dms_zu_erledigen: 2, dms_ueberfaellig: 0 });
    assert.equal(g.warnung, null);
    assert.equal(await karten.neue_post_vorhanden.lauscher({ device: g }), false);

    dms.setze({ neuePost: 1, zuErledigen: 3, anstehend: 0, ueberfaellig: 1 });
    await g.abfrage.runde();
    assert.equal(g.getCapabilityValue('dms_neue_post'), 1);
    assert.equal(await karten.neue_post_vorhanden.lauscher({ device: g }), true);
    const post = ausgeloest.find((a) => a.id === 'neue_post');
    assert.deepEqual(post.tokens, { neue_post: 1, dazu: 1 });
    assert.deepEqual(ausgeloest.find((a) => a.id === 'neue_aufgabe').tokens, { zu_erledigen: 3, dazu: 1 });
    assert.deepEqual(ausgeloest.find((a) => a.id === 'ueberfaellig').tokens, { ueberfaellig: 1, dazu: 1 });

    // Unverändert: 304, keine neuen Auslöser.
    const vorher = ausgeloest.length;
    await g.abfrage.runde();
    assert.equal(dms.zustand.antworten.at(-1).status, 304);
    assert.equal(ausgeloest.length, vorher);

    dms.zustand.wartung = true;
    await g.abfrage.runde();
    assert.equal(g.verfuegbar, false);
    assert.equal(g.grund, de.fehler.wartung);
    dms.zustand.wartung = false;
    await g.abfrage.runde();
    assert.equal(g.verfuegbar, true);

    // Einstellungen: falscher Schlüssel wird vor dem Speichern abgelehnt.
    await assert.rejects(g.onSettings({ oldSettings: g.getSettings(), newSettings: { ...g.getSettings(), schluessel: 'dms_schreibenJonasTestschluessel' }, changedKeys: ['schluessel'] }), { message: de.fehler.falsche_stufe });
    await g.onDeleted();
    assert.equal(g.abfrage, null);
  });

  it('Ablago ohne „anstehend“ (dms #725): Einrichten geht, Gerät aus 1.1.x verliert „Fällig in 7 Tagen“ sauber', async () => {
    dms.zustand.mitAnstehend = false;
    try {
      dms.setze({ neuePost: 0, zuErledigen: 1, ueberfaellig: 0 });
      const s = sitzung();
      await driver.onPair(s);
      assert.equal(await s.h.login({ username: dms.adresse, password: 'dms_zaehlerLenaTestschluessel' }), true);

      // Gerät aus 1.1.x mit dem alten Wert und gespeicherten Zahlen.
      const g = new DmsDevice(driver, { adresse: dms.adresse, schluessel: 'dms_zaehlerLenaTestschluessel', intervall: 5 });
      for (const [c, w] of Object.entries({ dms_neue_post: 0, dms_zu_erledigen: 1, dms_faellig_7_tage: 2, dms_ueberfaellig: 0 })) {
        g.caps.add(c);
        g.werte[c] = w;
      }
      await g.onInit();
      assert.equal(g.hasCapability('dms_faellig_7_tage'), false);
      dms.setze({ neuePost: 0, zuErledigen: 2, ueberfaellig: 0 });
      await bis(() => g.getCapabilityValue('dms_zu_erledigen') === 2);
      assert.equal(g.verfuegbar, true);
      assert.deepEqual(g.werte, { dms_neue_post: 0, dms_zu_erledigen: 2, dms_ueberfaellig: 0 });
      assert.deepEqual(ausgeloest.at(-1), { ...ausgeloest.at(-1), id: 'neue_aufgabe', tokens: { zu_erledigen: 2, dazu: 1 } });
      await g.onDeleted();
    } finally {
      dms.zustand.mitAnstehend = true;
    }
  });

  it('Schlüssel „nur lesen“ geht mit Hinweis, „lesen und schreiben“ macht das Gerät nicht verfügbar', async () => {
    const lesen = new DmsDevice(driver, { adresse: dms.adresse, schluessel: 'dms_lesenLenaTestschluessel00', intervall: 5 });
    await lesen.onInit();
    await bis(() => lesen.getCapabilityValue('dms_neue_post') !== null);
    assert.equal(lesen.warnung, de.hinweis.stufe_lesen);
    await lesen.onDeleted();

    const schreiben = new DmsDevice(driver, { adresse: dms.adresse, schluessel: 'dms_schreibenJonasTestschluessel', intervall: 5 });
    await schreiben.onInit();
    await bis(() => schreiben.verfuegbar === false);
    assert.equal(schreiben.grund, de.fehler.falsche_stufe);
    assert.equal(schreiben.abfrage, null);
    assert.equal(schreiben.getCapabilityValue('dms_neue_post'), null, 'keine Zahlen mit falscher Stufe');
  });

  it('Reparieren setzt neue Zugangsdaten nach dem Verbindungstest', async () => {
    const g = new DmsDevice(driver, { adresse: dms.adresse, schluessel: 'dms_abgelaufenPetraTestschluessel', intervall: 5 });
    await g.onInit();
    await bis(() => g.verfuegbar === false);
    assert.equal(g.grund, de.fehler.schluessel_ungueltig);
    const s = sitzung();
    await driver.onRepair(s, g);
    assert.equal(await s.h.login({ username: dms.adresse, password: 'dms_zaehlerLenaTestschluessel' }), true);
    assert.equal(g.settings.schluessel, 'dms_zaehlerLenaTestschluessel');
    await bis(() => g.verfuegbar === true);
    await g.onDeleted();
  });
});
