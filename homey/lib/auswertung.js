'use strict';

/**
 * Auswertung der Zahlen: welche Werte das Gerät zeigt und welche Flow-Auslöser feuern.
 * Reine Funktionen ohne Homey-Laufzeit.
 *
 * Ausgelöst wird bei einem Anstieg gegenüber dem zuletzt bekannten Wert:
 * - „Neue Post angekommen“, wenn `neuePost` größer wird,
 * - „Etwas wird bald fällig“ (Art `anstehend`), wenn `anstehend` (Wert „Fällig in 7 Tagen“: heute bis in 7 Tagen)
 *   größer wird – auch, wenn jemand etwas Neues mit Datum in diesem Zeitraum anlegt –,
 *   und „… ist überfällig“ (Art `ueberfaellig`), wenn `ueberfaellig` größer wird.
 * Ohne bekannten Vorwert (erster Abruf nach dem Einrichten) löst nichts aus.
 * `stand` vergleicht die App nicht auf „größer“: Nach einer Wiederherstellung des DMS kann er zurückgehen.
 */

/** Zuordnung der Zahlen des DMS zu den Werten (Capabilities) des Geräts. */
const WERTE = {
  neuePost: 'dms_neue_post',
  zuErledigen: 'dms_zu_erledigen',
  anstehend: 'dms_faellig_7_tage',
  ueberfaellig: 'dms_ueberfaellig',
};

/** @typedef {{ neuePost: number, zuErledigen: number, anstehend: number, ueberfaellig: number }} Zahlen */
/** @typedef {{ karte: 'neue_post', tokens: { neue_post: number, dazu: number } } | { karte: 'bald_faellig', art: 'anstehend'|'ueberfaellig', tokens: { faellig_7_tage: number, ueberfaellig: number } }} Ausloeser */

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
  const faelligTokens = { faellig_7_tage: neu.anstehend, ueberfaellig: neu.ueberfaellig };
  if (neu.anstehend > vorher.anstehend) liste.push({ karte: 'bald_faellig', art: 'anstehend', tokens: faelligTokens });
  if (neu.ueberfaellig > vorher.ueberfaellig) liste.push({ karte: 'bald_faellig', art: 'ueberfaellig', tokens: faelligTokens });
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

module.exports = { WERTE, ausloeser, geraetewerte, vollstaendig, abstandMs };
