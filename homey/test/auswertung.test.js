'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { ausloeser, geraetewerte, abstandMs } = require('../lib/auswertung');

const z = (neuePost, zuErledigen, ueberfaellig) => ({ neuePost, zuErledigen, ueberfaellig });

describe('Auswertung der Zahlen', () => {
  it('ordnet die Zahlen den Werten des Geräts zu', () => {
    assert.deepEqual(geraetewerte(z(2, 5, 1)), { dms_neue_post: 2, dms_zu_erledigen: 5, dms_ueberfaellig: 1 });
  });

  it('löst beim ersten Abruf nichts aus', () => {
    assert.deepEqual(ausloeser(null, z(2, 5, 3, 1)), []);
    assert.deepEqual(ausloeser({ neuePost: null, zuErledigen: 1 }, z(2, 5, 3, 1)), []);
  });

  it('„Neue Post angekommen“ nur bei einem Anstieg', () => {
    assert.deepEqual(ausloeser(z(1, 0, 0), z(3, 0, 0)), [{ karte: 'neue_post', tokens: { neue_post: 3, dazu: 2 } }]);
    assert.deepEqual(ausloeser(z(3, 0, 0), z(1, 0, 0)), [], 'gelesen oder zugeordnet');
  });

  it('„Neue Aufgabe zu erledigen“, wenn Zu erledigen steigt', () => {
    assert.deepEqual(ausloeser(z(0, 2, 0), z(0, 3, 0)), [{ karte: 'neue_aufgabe', tokens: { zu_erledigen: 3, dazu: 1 } }]);
    assert.deepEqual(ausloeser(z(0, 3, 0), z(0, 1, 0)), [], 'erledigt');
  });

  it('„Etwas ist überfällig“, wenn Überfällig steigt', () => {
    assert.deepEqual(ausloeser(z(0, 0, 1), z(0, 0, 3)), [{ karte: 'ueberfaellig', tokens: { ueberfaellig: 3, dazu: 2 } }]);
    assert.deepEqual(ausloeser(z(0, 0, 3), z(0, 0, 2)), [], 'erledigt');
    assert.deepEqual(ausloeser(z(0, 0, 0), z(1, 1, 1)).map((a) => a.karte), ['neue_post', 'neue_aufgabe', 'ueberfaellig']);
  });

  it('ohne vollständige Vorwerte (auch Vorwerte aus 1.1.x mit „anstehend“) richtig', () => {
    assert.deepEqual(ausloeser(null, z(1, 1, 1)), []);
    assert.deepEqual(ausloeser({ neuePost: 1, zuErledigen: null, ueberfaellig: 0 }, z(2, 1, 1)), []);
    assert.deepEqual(ausloeser({ neuePost: 1, zuErledigen: 0, anstehend: 4, ueberfaellig: 0 }, z(2, 0, 0)).map((a) => a.karte), ['neue_post']);
  });

  it('begrenzt den Abfrage-Abstand auf 1 Minute bis 1 Tag, Vorgabe 5 Minuten', () => {
    assert.equal(abstandMs(5), 300000);
    assert.equal(abstandMs(0), 60000);
    assert.equal(abstandMs(100000), 1440 * 60000);
    assert.equal(abstandMs('x'), 300000);
    assert.equal(abstandMs(undefined), 300000);
  });
});
