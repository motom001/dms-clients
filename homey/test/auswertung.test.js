'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { ausloeser, geraetewerte, abstandMs } = require('../lib/auswertung');

const z = (neuePost, zuErledigen, anstehend, ueberfaellig) => ({ neuePost, zuErledigen, anstehend, ueberfaellig });

describe('Auswertung der Zahlen', () => {
  it('ordnet die Zahlen den Werten des Geräts zu', () => {
    assert.deepEqual(geraetewerte(z(2, 5, 3, 1)), { dms_neue_post: 2, dms_zu_erledigen: 5, dms_fristen_7_tage: 3, dms_ueberfaellig: 1 });
  });

  it('löst beim ersten Abruf nichts aus', () => {
    assert.deepEqual(ausloeser(null, z(2, 5, 3, 1)), []);
    assert.deepEqual(ausloeser({ neuePost: null, zuErledigen: 1 }, z(2, 5, 3, 1)), []);
  });

  it('„Neue Post angekommen“ nur bei einem Anstieg', () => {
    assert.deepEqual(ausloeser(z(1, 0, 0, 0), z(3, 0, 0, 0)), [{ karte: 'neue_post', tokens: { neue_post: 3, dazu: 2 } }]);
    assert.deepEqual(ausloeser(z(3, 0, 0, 0), z(1, 0, 0, 0)), [], 'gelesen oder zugeordnet');
    assert.deepEqual(ausloeser(z(1, 0, 0, 0), z(1, 4, 0, 0)), [], 'nur Zu erledigen geändert');
  });

  it('„Frist wird fällig“ für anstehend und überfällig getrennt', () => {
    assert.deepEqual(ausloeser(z(0, 0, 1, 0), z(0, 0, 2, 0)), [{ karte: 'frist_faellig', art: 'anstehend', tokens: { fristen_7_tage: 2, ueberfaellig: 0 } }]);
    // Eine Frist rutscht von „anstehend“ nach „überfällig“.
    assert.deepEqual(ausloeser(z(0, 0, 2, 0), z(0, 0, 1, 1)), [{ karte: 'frist_faellig', art: 'ueberfaellig', tokens: { fristen_7_tage: 1, ueberfaellig: 1 } }]);
    assert.equal(ausloeser(z(0, 0, 0, 0), z(1, 0, 1, 1)).length, 3);
  });

  it('begrenzt den Abfrage-Abstand auf 1 Minute bis 1 Tag, Vorgabe 5 Minuten', () => {
    assert.equal(abstandMs(5), 300000);
    assert.equal(abstandMs(0), 60000);
    assert.equal(abstandMs(100000), 1440 * 60000);
    assert.equal(abstandMs('x'), 300000);
    assert.equal(abstandMs(undefined), 300000);
  });
});
