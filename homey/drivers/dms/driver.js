'use strict';

const crypto = require('node:crypto');
const Homey = require('homey');
const { DmsFehler, DmsVerbindung } = require('../../lib/dms');
const { WERTE } = require('../../lib/auswertung');

/**
 * Treiber „Ablago“: Einrichten mit Adresse und Schlüssel (Verbindungstest beim Anlegen), Reparieren mit neuen
 * Zugangsdaten und die Flow-Karten.
 */
module.exports = class DmsDriver extends Homey.Driver {
  async onInit() {
    this.karten = {
      neue_post: this.homey.flow.getDeviceTriggerCard('neue_post'),
      neue_aufgabe: this.homey.flow.getDeviceTriggerCard('neue_aufgabe'),
      ueberfaellig: this.homey.flow.getDeviceTriggerCard('ueberfaellig'),
    };
    this.homey.flow.getConditionCard('neue_post_vorhanden')
      .registerRunListener(async (args) => (args.device.getCapabilityValue(WERTE.neuePost) || 0) > 0);
  }

  /** Text zu einem Fehler in der Sprache des Homey. */
  meldung(e) {
    const code = e instanceof DmsFehler ? e.code : 'unerwartet';
    return this.homey.__(`fehler.${code}`);
  }

  /**
   * Verbindungstest: Adresse und Schlüssel prüfen, Zahlen abrufen, Stufe prüfen.
   * Wirft einen Fehler mit verständlichem Text; Homey zeigt ihn im Einrichten an.
   * @returns {Promise<{ adresse: string, schluessel: string, stufe: string }>}
   */
  async teste(adresse, schluessel) {
    try {
      const v = new DmsVerbindung({ adresse, schluessel, version: this.homey.manifest.version });
      const { stufe } = await v.pruefe();
      return { adresse: v.adresse, schluessel: v.schluessel, stufe };
    } catch (e) {
      this.log(`Verbindungstest fehlgeschlagen: ${e instanceof DmsFehler ? e.message : 'unerwartet'}`);
      throw new Error(this.meldung(e));
    }
  }

  async onPair(session) {
    let zugang = null;
    session.setHandler('login', async ({ username, password }) => {
      zugang = await this.teste(username, password);
      return true;
    });
    session.setHandler('list_devices', async () => {
      if (!zugang) return [];
      return [{
        name: 'Ablago',
        // Das DMS nennt einem Schlüssel „nur Zähler“ keinen Benutzer; eine zufällige Kennung erlaubt mehrere Geräte
        // (eines je Person) und gibt nichts über den Schlüssel preis.
        data: { id: crypto.randomUUID() },
        settings: { adresse: zugang.adresse, schluessel: zugang.schluessel, intervall: 5 },
      }];
    });
  }

  async onRepair(session, device) {
    session.setHandler('login', async ({ username, password }) => {
      const zugang = await this.teste(username, password);
      await device.setSettings({ adresse: zugang.adresse, schluessel: zugang.schluessel });
      device.starte(device.getSettings());
      return true;
    });
  }
};
