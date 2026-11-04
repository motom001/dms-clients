'use strict';

/**
 * Auswertung der Zahlen: welche Werte das Gerät zeigt und welche Flow-Auslöser feuern.
 * Reine Funktionen ohne Homey-Laufzeit.
 *
 * Ausgelöst wird bei einem Anstieg gegenüber dem zuletzt bekannten Wert:
 * - „Neue Post angekommen“, wenn `neuePost` größer wird,
 * - „Neue Aufgabe zu erledigen“, wenn `zuErledigen` größer wird – auch, wenn eine Frist mit ihrem Vorlauf fällig wird
 *   (Ablago legt sie dann unter „Zu erledigen“ ab; ein eigenes Zeitfenster braucht die App nicht, dms #725),
 * - „Etwas ist überfällig“, wenn `ueberfaellig` größer wird.
 * Ohne bekannten Vorwert (erster Abruf nach dem Einrichten) löst nichts aus.
 * `stand` vergleicht die App nicht auf „größer“: Nach einer Wiederherstellung von Ablago kann er zurückgehen.
 */

/** Zuordnung der Zahlen von Ablago zu den Werten (Capabilities) des Geräts. */
const WERTE = {
  neuePost: 'dms_neue_post',
  zuErledigen: 'dms_zu_erledigen',
  ueberfaellig: 'dms_ueberfaellig',
};

/** Werte früherer Versionen, die das Gerät beim Start entfernt (1.1.x: „Fällig in 7 Tagen“). */
const ENTFALLEN = ['dms_faellig_7_tage'];

/** @typedef {{ neuePost: number, zuErledigen: number, ueberfaellig: number }} Zahlen */
/**
 * @typedef {{ karte: 'neue_post', tokens: { neue_post: number, dazu: number } }
 *   | { karte: 'neue_aufgabe', tokens: { zu_erledigen: number, dazu: number } }
 *   | { karte: 'ueberfaellig', tokens: { ueberfaellig: number, dazu: number } }} Ausloeser
 */

/**
 * @param {Partial<Record<keyof Zahlen, unknown>> | null | undefined} z
 * @returns {Zahlen | null}
 */
function vollstaendig(z) {
  if (!z) return null;
  for (const k of Object.keys(WERTE)) {
    if (!Number.isInteger(z[/** @type {keyof Zahlen} */ (k)])) return null;
  }
  return /** @type {Zahlen} */ (z);
}

/**
 * @param {Zahlen | null} alt zuletzt bekannte Zahlen (oder null)
 * @param {Zahlen} neu
 * @returns {Ausloeser[]}
 */
function ausloeser(alt, neu) {
  const vorher = vollstaendig(alt);
  if (!vorher) return [];
  /** @type {Ausloeser[]} */
  const liste = [];
  if (neu.neuePost > vorher.neuePost) {
    liste.push({ karte: 'neue_post', tokens: { neue_post: neu.neuePost, dazu: neu.neuePost - vorher.neuePost } });
  }
  if (neu.zuErledigen > vorher.zuErledigen) {
    liste.push({ karte: 'neue_aufgabe', tokens: { zu_erledigen: neu.zuErledigen, dazu: neu.zuErledigen - vorher.zuErledigen } });
  }
  if (neu.ueberfaellig > vorher.ueberfaellig) {
    liste.push({ karte: 'ueberfaellig', tokens: { ueberfaellig: neu.ueberfaellig, dazu: neu.ueberfaellig - vorher.ueberfaellig } });
  }
  return liste;
}

/**
 * Werte für das Gerät: Capability-Id → Zahl.
 * @param {Zahlen} z
 * @returns {Record<string, number>}
 */
function geraetewerte(z) {
  /** @type {Record<string, number>} */
  const w = {};
  for (const [feld, cap] of Object.entries(WERTE)) w[cap] = z[/** @type {keyof Zahlen} */ (feld)];
  return w;
}

/**
 * Abfrage-Abstand in Millisekunden aus der Einstellung (Minuten), begrenzt auf 1 bis 1440 Minuten.
 * @param {unknown} minuten
 */
function abstandMs(minuten) {
  const m = Number(minuten);
  const sicher = Number.isFinite(m) ? Math.min(1440, Math.max(1, Math.round(m))) : 5;
  return sicher * 60 * 1000;
}

module.exports = { WERTE, ENTFALLEN, ausloeser, geraetewerte, vollstaendig, abstandMs };
