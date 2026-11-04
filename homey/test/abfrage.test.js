'use strict';

const assert = require('node:assert/strict');
const { after, before, describe, it } = require('node:test');
const { DmsVerbindung } = require('../lib/dms');
const { Zaehlerabfrage } = require('../lib/abfrage');
const { starteFakeDms } = require('./fake-dms');

/** Zeitgeber, den der Test von Hand weiterschaltet: eine Runde = ein Abfrage-Abstand. */
function handuhr() {
  let naechste = null;
  return {
    setTimeout: (f, ms) => { naechste = { f, ms }; return naechste; },
    clearTimeout: (t) => { if (naechste === t) naechste = null; },
    get abstand() { return naechste && naechste.ms; },
    async weiter(abfrage) { const n = naechste; naechste = null; assert.ok(n, 'nächste Runde geplant'); n.f(); while (abfrage.laeuft) await new Promise((r) => setImmediate(r)); },
  };
}

describe('Regelmäßige Abfrage', () => {
  let dms;
  before(async () => { dms = await starteFakeDms(); });
  after(async () => { await dms.stopp(); });

  it('meldet Werte, löst nach neuer Post innerhalb eines Abstands aus und fragt sonst mit If-None-Match', async () => {
    dms.setze({ neuePost: 0, zuErledigen: 1, ueberfaellig: 0 });
    const uhr = handuhr();
    const werte = [];
    const ausgeloest = [];
    let fehler = 0;
    const a = new Zaehlerabfrage({
      verbindung: new DmsVerbindung({ adresse: dms.adresse, schluessel: 'dms_zaehlerLenaTestschluessel' }),
      abstandMs: 5 * 60000,
      werte: (z) => werte.push({ ...z }),
      ausloeser: (x) => ausgeloest.push(x),
      fehler: () => { fehler += 1; },
      setTimeout: uhr.setTimeout,
      clearTimeout: uhr.clearTimeout,
    });
    await a.start();
    assert.equal(werte.length, 1);
    assert.equal(werte[0].zuErledigen, 1);
    assert.equal(ausgeloest.length, 0, 'erster Abruf löst nichts aus');
    assert.equal(uhr.abstand, 300000);

    await uhr.weiter(a);
    assert.equal(dms.zustand.antworten.at(-1).status, 304);
    assert.equal(werte.length, 1, 'bei 304 keine neuen Werte');

    dms.setze({ neuePost: 1, zuErledigen: 0 }); // Aufgabe erledigt: löst nichts aus
    await uhr.weiter(a);
    assert.equal(werte.length, 2);
    assert.deepEqual(ausgeloest, [{ karte: 'neue_post', tokens: { neue_post: 1, dazu: 1 } }]);

    await uhr.weiter(a);
    assert.equal(ausgeloest.length, 1, 'kein zweites Mal für dieselbe Post');
    assert.equal(fehler, 0);
    a.stop();
    assert.equal(uhr.abstand, null);
  });

  it('löst nach einem Neustart für Post aus, die in der Zwischenzeit kam (Vorwerte vom Gerät)', async () => {
    dms.setze({ neuePost: 4, zuErledigen: 1, ueberfaellig: 0 });
    const uhr = handuhr();
    const ausgeloest = [];
    const a = new Zaehlerabfrage({
      verbindung: new DmsVerbindung({ adresse: dms.adresse, schluessel: 'dms_lesenLenaTestschluessel00' }),
      abstandMs: 60000,
      vorher: { neuePost: 3, zuErledigen: 0, ueberfaellig: 0 },
      ausloeser: (x) => ausgeloest.push(x),
      setTimeout: uhr.setTimeout,
      clearTimeout: uhr.clearTimeout,
    });
    await a.start();
    a.stop();
    assert.deepEqual(ausgeloest.map((x) => x.karte), ['neue_post', 'neue_aufgabe']);
  });

  it('meldet Fehler und versucht es im nächsten Abstand wieder', async () => {
    const uhr = handuhr();
    const fehler = [];
    let ok = 0;
    const a = new Zaehlerabfrage({
      verbindung: new DmsVerbindung({ adresse: dms.adresse, schluessel: 'dms_zaehlerLenaTestschluessel' }),
      abstandMs: 60000,
      ok: () => { ok += 1; },
      fehler: (e) => fehler.push(e.code),
      setTimeout: uhr.setTimeout,
      clearTimeout: uhr.clearTimeout,
    });
    dms.zustand.wartung = true;
    await a.start();
    assert.deepEqual(fehler, ['wartung']);
    dms.zustand.wartung = false;
    await uhr.weiter(a);
    assert.equal(ok, 1, 'wieder in Ordnung');
    a.stop();
  });

  it('wartet im Wartungsmodus nur so lange, wie Ablago sagt (Retry-After), höchstens einen Abstand', async () => {
    const uhr = handuhr();
    const fehler = [];
    const a = new Zaehlerabfrage({
      verbindung: new DmsVerbindung({ adresse: dms.adresse, schluessel: 'dms_zaehlerLenaTestschluessel' }),
      abstandMs: 5 * 60000,
      fehler: (e) => fehler.push(e.code),
      setTimeout: uhr.setTimeout,
      clearTimeout: uhr.clearTimeout,
    });
    dms.zustand.wartung = true;
    try {
      await a.start();
      assert.deepEqual(fehler, ['wartung']);
      assert.equal(uhr.abstand, 120000, 'nach Retry-After (120 s) statt nach 5 Minuten');
      await uhr.weiter(a);
      assert.equal(uhr.abstand, 120000);
    } finally {
      dms.zustand.wartung = false;
    }
    await uhr.weiter(a);
    assert.equal(uhr.abstand, 300000, 'danach wieder der eingestellte Abstand');
    a.stop();
  });

  it('wartet nie länger als den eingestellten Abstand, auch wenn Retry-After länger ist', async () => {
    const uhr = handuhr();
    const a = new Zaehlerabfrage({
      verbindung: new DmsVerbindung({ adresse: dms.adresse, schluessel: 'dms_zaehlerLenaTestschluessel' }),
      abstandMs: 60000,
      setTimeout: uhr.setTimeout,
      clearTimeout: uhr.clearTimeout,
    });
    dms.zustand.wartung = true;
    try {
      await a.start();
      assert.equal(uhr.abstand, 60000);
    } finally {
      dms.zustand.wartung = false;
      a.stop();
    }
  });
});
