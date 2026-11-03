'use strict';

const Homey = require('homey');
const { DmsFehler, DmsVerbindung } = require('../../lib/dms');
const { Zaehlerabfrage } = require('../../lib/abfrage');
const { WERTE, geraetewerte, abstandMs } = require('../../lib/auswertung');

/**
 * Gerät „Ablago“: fragt die Zahlen im eingestellten Abstand ab (mit If-None-Match), zeigt sie als Werte und löst die
 * Flow-Karten aus. Fehler stehen als Grund „nicht verfügbar“ am Gerät. Der Schlüssel steht nur in den
 * Einstellungen des Geräts (Feld vom Typ Passwort) und nie im Protokoll.
 */
module.exports = class DmsDevice extends Homey.Device {
  async onInit() {
    this.lauf = 0;
    this.fehlercode = null;
    for (const cap of Object.values(WERTE)) {
      if (!this.hasCapability(cap)) await this.addCapability(cap);
    }
    this.starte(this.getSettings());
  }

  async onSettings({ newSettings, changedKeys }) {
    if (changedKeys.includes('adresse') || changedKeys.includes('schluessel')) {
      // Verbindungstest vor dem Speichern; ein Fehler bricht das Speichern mit verständlichem Text ab.
      const zugang = await this.driver.teste(newSettings.adresse, newSettings.schluessel);
      newSettings = { ...newSettings, adresse: zugang.adresse, schluessel: zugang.schluessel };
    }
    if (changedKeys.some((k) => ['adresse', 'schluessel', 'intervall'].includes(k))) {
      this.homey.setTimeout(() => this.starte(newSettings), 0);
    }
  }

  async onUninit() { this.stoppe(); }

  async onDeleted() { this.stoppe(); }

  stoppe() {
    this.lauf += 1;
    if (this.abfrage) this.abfrage.stop();
    this.abfrage = null;
  }

  /** Vorwerte aus den gespeicherten Werten des Geräts: So löst nach einem Neustart aus, was inzwischen kam. */
  vorwerte() {
    const z = {};
    for (const [feld, cap] of Object.entries(WERTE)) z[feld] = this.getCapabilityValue(cap);
    return z;
  }

  /** (Neu) starten: Stufe prüfen, dann regelmäßig abfragen. */
  async starte(einstellungen) {
    this.stoppe();
    const lauf = this.lauf;
    let verbindung;
    try {
      verbindung = new DmsVerbindung({ adresse: einstellungen.adresse, schluessel: einstellungen.schluessel, version: this.homey.manifest.version });
    } catch (e) {
      await this.zeigeFehler(e);
      return;
    }
    this.stufeGeprueft = false;
    if (!(await this.pruefeStufe(verbindung)) || lauf !== this.lauf) return;
    this.abfrage = new Zaehlerabfrage({
      verbindung,
      abstandMs: abstandMs(einstellungen.intervall),
      vorher: this.vorwerte(),
      werte: (zahlen) => this.zeigeWerte(zahlen),
      ausloeser: (a) => this.loeseAus(a),
      ok: () => this.allesOk(verbindung),
      fehler: (e) => this.zeigeFehler(e),
      setTimeout: (f, ms) => this.homey.setTimeout(f, ms),
      clearTimeout: (t) => this.homey.clearTimeout(t),
    });
    this.abfrage.start();
  }

  /**
   * Nur „nur Zähler“ und „nur lesen“ sind erlaubt. Ist das DMS gerade nicht erreichbar, prüft die App die Stufe
   * nach dem ersten erfolgreichen Abruf.
   * @returns {Promise<boolean>} false, wenn die Stufe nicht passt
   */
  async pruefeStufe(verbindung) {
    let stufe;
    try {
      stufe = await verbindung.stufe();
    } catch {
      return true;
    }
    this.stufeGeprueft = true;
    if (stufe === 'zaehler') {
      await this.unsetWarning().catch(() => {});
      return true;
    }
    if (stufe === 'lesen') {
      await this.setWarning(this.homey.__('hinweis.stufe_lesen')).catch(() => {});
      return true;
    }
    this.stoppe();
    await this.zeigeFehler(new DmsFehler('falsche_stufe', `Stufe ${stufe}`));
    return false;
  }

  async allesOk(verbindung) {
    if (!this.stufeGeprueft) await this.pruefeStufe(verbindung);
    if (this.fehlercode !== null) {
      this.fehlercode = null;
      await this.setAvailable().catch(() => {});
    }
  }

  async zeigeWerte(zahlen) {
    for (const [cap, wert] of Object.entries(geraetewerte(zahlen))) {
      if (this.getCapabilityValue(cap) !== wert) await this.setCapabilityValue(cap, wert).catch((e) => this.error(`Wert ${cap}: ${e.message}`));
    }
  }

  async loeseAus(a) {
    if (a.karte === 'neue_post') await this.driver.karteNeuePost.trigger(this, a.tokens, {});
    else await this.driver.karteFaellig.trigger(this, a.tokens, { art: a.art });
  }

  async zeigeFehler(e) {
    const code = e instanceof DmsFehler ? e.code : 'unerwartet';
    // Ins Protokoll nur Code und technischer Hinweis – nie Adresse mit Schlüssel oder der Schlüssel selbst.
    if (code !== this.fehlercode) this.log(`Abruf fehlgeschlagen: ${e instanceof DmsFehler ? e.message : code}`);
    if (!(e instanceof DmsFehler)) this.error(e && e.stack ? e.stack : String(e));
    if (code === this.fehlercode) return;
    this.fehlercode = code;
    await this.setUnavailable(this.homey.__(`fehler.${code}`)).catch(() => {});
  }
};
