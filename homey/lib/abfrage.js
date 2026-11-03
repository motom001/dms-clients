'use strict';

const { ausloeser, vollstaendig } = require('./auswertung');

/**
 * Regelmäßige Abfrage der Zahlen mit If-None-Match. Reine Logik: Zeitgeber und Rückmeldungen kommen von außen
 * (im Gerät von Homey, in den Tests von `node:test`).
 *
 * Ablauf je Runde: Abruf mit dem ETag der letzten Antwort → bei 304 nichts weiter, bei 200 neue Werte melden und
 * Auslöser für jeden Anstieg. Fehler werden gemeldet; die nächste Runde kommt trotzdem nach dem Abstand.
 * Nennt Ablago im Wartungsmodus eine Wartezeit (`Retry-After`), kommt die nächste Runde nach dieser Zeit,
 * höchstens aber nach dem eingestellten Abstand.
 */
class Zaehlerabfrage {
  /**
   * @param {{
   *   verbindung: { zaehler(etag?: string): Promise<any> },
   *   abstandMs: number,
   *   vorher?: import('./auswertung').Zahlen | null,
   *   werte?: (zahlen: import('./auswertung').Zahlen) => unknown,
   *   ausloeser?: (a: import('./auswertung').Ausloeser) => unknown,
   *   ok?: () => unknown,
   *   fehler?: (e: Error) => unknown,
   *   setTimeout?: (f: () => void, ms: number) => unknown,
   *   clearTimeout?: (t: any) => void,
   * }} o
   */
  constructor(o) {
    this.o = o;
    this.etag = '';
    this.vorher = vollstaendig(o.vorher) || null;
    this.zeitgeber = null;
    this.laeuft = false;
    this.aktiv = false;
    this.setTimeout = o.setTimeout || setTimeout;
    this.clearTimeout = o.clearTimeout || clearTimeout;
  }

  /** Startet sofort mit einem Abruf und danach im Abstand. */
  start() {
    this.aktiv = true;
    return this.runde();
  }

  stop() {
    this.aktiv = false;
    if (this.zeitgeber) this.clearTimeout(this.zeitgeber);
    this.zeitgeber = null;
  }

  /** @param {number} [ms] Wartezeit bis zur nächsten Runde, sonst der eingestellte Abstand */
  planen(ms = this.o.abstandMs) {
    if (!this.aktiv) return;
    if (this.zeitgeber) this.clearTimeout(this.zeitgeber);
    this.zeitgeber = this.setTimeout(() => { this.zeitgeber = null; this.runde(); }, ms);
  }

  /** Ein Abruf. Läuft schon einer, passiert nichts (keine Überholer bei langsamen Antworten). */
  async runde() {
    if (this.laeuft) return;
    this.laeuft = true;
    let warten = this.o.abstandMs;
    try {
      const r = await this.o.verbindung.zaehler(this.etag || undefined);
      this.etag = r.etag || this.etag;
      if (r.geaendert) {
        const liste = ausloeser(this.vorher, r.zahlen);
        this.vorher = r.zahlen;
        await this.o.werte?.(r.zahlen);
        for (const a of liste) await this.o.ausloeser?.(a);
      }
      await this.o.ok?.();
    } catch (e) {
      const sek = e && /** @type {{ wiederholenNach?: number }} */ (e).wiederholenNach;
      if (sek && sek > 0) warten = Math.min(this.o.abstandMs, sek * 1000);
      await this.o.fehler?.(/** @type {Error} */ (e));
    } finally {
      this.laeuft = false;
      this.planen(warten);
    }
  }
}

module.exports = { Zaehlerabfrage };
