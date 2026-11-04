'use strict';

/**
 * Verbindung zu Ablago über die öffentliche API v1 – ohne Homey-Laufzeit, damit sie sich mit `node --test` prüfen lässt.
 *
 * Genutzt werden nur zwei Endpunkte:
 * - `GET /api/v1/ich/zaehler` (ab DMS 0.148.0): nur Zahlen, mit ETag; mit `If-None-Match` und gleichem Stand kommt
 *   `304` ohne Inhalt.
 * - `GET /api/v1/ich`: nur beim Einrichten und beim Start, um die Stufe des Schlüssels zu prüfen. Ein Schlüssel
 *   „nur Zähler“ bekommt dort `403` – das ist die erwartete Antwort.
 *
 * Fehler kommen als {@link DmsFehler} mit einem festen `code`; die Texte dazu stehen in `locales/*.json` unter `fehler.<code>`.
 */

const ZAEHLER_PFAD = '/api/v1/ich/zaehler';
const ICH_PFAD = '/api/v1/ich';
const ZEITLIMIT_MS = 15000;
const PRAEFIX = 'dms_';
/**
 * Felder der Antwort von GET /api/v1/ich/zaehler, die die App braucht (OpenAPI-Schema `Zaehlerstand`).
 * Andere Felder (z. B. `anstehend`, das mit dms #725 wegfällt) liest die App nicht – sie läuft mit und ohne sie.
 */
const ZAHLEN = ['neuePost', 'zuErledigen', 'ueberfaellig'];

/** @typedef {'nicht_erreichbar'|'zertifikat'|'schluessel_ungueltig'|'falsche_stufe'|'wartung'|'kein_dms'|'umleitung'|'adresse_ungueltig'|'schluessel_format'|'unerwartet'} Fehlercode */

class DmsFehler extends Error {
  /**
   * @param {Fehlercode} code
   * @param {string} [hinweis] technischer Hinweis fürs Protokoll (nie der Schlüssel)
   * @param {{ status?: number, wiederholenNach?: number }} [mehr]
   */
  constructor(code, hinweis, mehr = {}) {
    super(hinweis ? `${code}: ${hinweis}` : code);
    this.name = 'DmsFehler';
    this.code = code;
    this.status = mehr.status;
    this.wiederholenNach = mehr.wiederholenNach;
  }
}

/**
 * Bringt die eingegebene Adresse in eine feste Form: mit http(s)://, ohne Schrägstrich am Ende und ohne einen
 * versehentlich mitkopierten API-Pfad. Ein Pfad davor (DMS hinter einem Reverse-Proxy unter /dms) bleibt.
 * @param {unknown} eingabe
 * @returns {string}
 */
function normalisiereAdresse(eingabe) {
  let text = String(eingabe ?? '').trim();
  if (!text) throw new DmsFehler('adresse_ungueltig', 'leer');
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) throw new DmsFehler('adresse_ungueltig', 'ohne http:// oder https://');
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new DmsFehler('adresse_ungueltig', 'keine URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new DmsFehler('adresse_ungueltig', `Schema ${url.protocol}`);
  if (url.username || url.password) throw new DmsFehler('adresse_ungueltig', 'Zugangsdaten in der Adresse');
  let pfad = url.pathname.replace(/\/+$/, '');
  pfad = pfad.replace(/\/api(\/v1(\/ich(\/zaehler)?)?)?$/, '');
  return `${url.protocol}//${url.host}${pfad}`;
}

/**
 * @param {unknown} eingabe
 * @returns {string}
 */
function pruefeSchluesselFormat(eingabe) {
  const s = String(eingabe ?? '').trim();
  if (!s.startsWith(PRAEFIX) || s.length < PRAEFIX.length + 8 || /\s/.test(s)) throw new DmsFehler('schluessel_format');
  return s;
}

/** Netzwerkfehler von fetch (undici) auf einen Code abbilden. */
function netzFehler(e) {
  const ursache = /** @type {{ code?: string, cause?: { code?: string } }} */ (e && e.cause) || {};
  const code = ursache.code || (ursache.cause && ursache.cause.code) || '';
  if (e && (e.name === 'TimeoutError' || e.name === 'AbortError')) return new DmsFehler('nicht_erreichbar', 'Zeitüberschreitung');
  if (/CERT|SSL|TLS|SELF_SIGNED|UNABLE_TO_VERIFY|ALTNAME/i.test(code)) return new DmsFehler('zertifikat', code);
  return new DmsFehler('nicht_erreichbar', code || (e && e.message) || 'unbekannt');
}

/**
 * Fehlerantwort des DMS (Status außer 200/304) auf einen Code abbilden.
 * @param {number} status
 * @param {{ get(name: string): string | null }} koepfe
 * @param {boolean} istJson
 */
function antwortFehler(status, koepfe, istJson) {
  if (status === 401) return new DmsFehler('schluessel_ungueltig', '401', { status });
  // Weiterleitung (z. B. von http:// auf https://): nicht folgen, damit der Schlüssel nicht woanders hingeht.
  if (status >= 300 && status < 400) return new DmsFehler('umleitung', `${status} nach ${koepfe.get('location') || '?'}`, { status });
  if (status === 403) return new DmsFehler('falsche_stufe', '403', { status });
  if (status === 503) {
    const sek = Number(koepfe.get('retry-after'));
    return new DmsFehler('wartung', '503', { status, wiederholenNach: Number.isFinite(sek) && sek > 0 ? sek : undefined });
  }
  // 404 ohne JSON: unter der Adresse läuft etwas anderes oder ein DMS vor 0.148.0.
  if (status === 404 || !istJson) return new DmsFehler('kein_dms', String(status), { status });
  if (status >= 500) return new DmsFehler('nicht_erreichbar', String(status), { status });
  return new DmsFehler('unerwartet', String(status), { status });
}

/**
 * Prüft die Antwort von GET /api/v1/ich/zaehler und gibt nur die bekannten Felder zurück.
 * @param {unknown} body
 * @returns {{ neuePost: number, zuErledigen: number, ueberfaellig: number, stand: number, geaendert: string }}
 */
function leseZaehlerstand(body) {
  if (!body || typeof body !== 'object') throw new DmsFehler('kein_dms', 'keine Zahlen');
  const b = /** @type {Record<string, unknown>} */ (body);
  for (const k of [...ZAHLEN, 'stand']) {
    if (!Number.isInteger(b[k]) || /** @type {number} */ (b[k]) < 0) throw new DmsFehler('kein_dms', `Feld ${k} fehlt`);
  }
  return {
    neuePost: /** @type {number} */ (b.neuePost),
    zuErledigen: /** @type {number} */ (b.zuErledigen),
    ueberfaellig: /** @type {number} */ (b.ueberfaellig),
    stand: /** @type {number} */ (b.stand),
    geaendert: typeof b.geaendert === 'string' ? b.geaendert : '',
  };
}

class DmsVerbindung {
  /**
   * @param {{ adresse: string, schluessel: string, fetch?: typeof fetch, zeitlimitMs?: number, version?: string }} o
   */
  constructor(o) {
    this.adresse = normalisiereAdresse(o.adresse);
    this.schluessel = pruefeSchluesselFormat(o.schluessel);
    this.fetch = o.fetch || globalThis.fetch;
    if (typeof this.fetch !== 'function') throw new Error('fetch fehlt (Node.js 18 oder neuer nötig)');
    this.zeitlimitMs = o.zeitlimitMs || ZEITLIMIT_MS;
    this.agent = `ablago-homey/${o.version || '0'}`;
  }

  /**
   * @param {string} pfad
   * @param {Record<string, string>} [mehr]
   */
  async hole(pfad, mehr = {}) {
    try {
      return await this.fetch(this.adresse + pfad, {
        method: 'GET',
        headers: { accept: 'application/json', authorization: `Bearer ${this.schluessel}`, 'user-agent': this.agent, ...mehr },
        redirect: 'manual',
        signal: AbortSignal.timeout(this.zeitlimitMs),
      });
    } catch (e) {
      throw netzFehler(e);
    }
  }

  /**
   * Fragt die Zahlen ab. Mit `etag` (vom letzten Abruf) antwortet das DMS bei gleichem Stand mit 304 ohne Inhalt.
   * @param {string} [etag]
   * @returns {Promise<{ geaendert: false, etag: string } | { geaendert: true, etag: string, zahlen: ReturnType<typeof leseZaehlerstand> }>}
   */
  async zaehler(etag) {
    const r = await this.hole(ZAEHLER_PFAD, etag ? { 'if-none-match': etag } : {});
    if (r.status === 304) {
      await r.body?.cancel?.().catch(() => {});
      return { geaendert: false, etag: r.headers.get('etag') || etag || '' };
    }
    const istJson = /application\/json/i.test(r.headers.get('content-type') || '');
    if (r.status !== 200) {
      await r.body?.cancel?.().catch(() => {});
      throw antwortFehler(r.status, r.headers, istJson);
    }
    if (!istJson) throw new DmsFehler('kein_dms', 'keine JSON-Antwort');
    let body;
    try {
      body = await r.json();
    } catch {
      throw new DmsFehler('kein_dms', 'JSON nicht lesbar');
    }
    return { geaendert: true, etag: r.headers.get('etag') || '', zahlen: leseZaehlerstand(body) };
  }

  /**
   * Stufe des Schlüssels: „nur Zähler“ bekommt an /api/v1/ich 403, die anderen Stufen sehen dort ihr Recht.
   * Die übrigen Angaben der Antwort (Benutzer) liest die App nicht.
   * @returns {Promise<'zaehler'|'lesen'|'schreiben'|'unbekannt'>}
   */
  async stufe() {
    const r = await this.hole(ICH_PFAD);
    if (r.status === 403) {
      await r.body?.cancel?.().catch(() => {});
      return 'zaehler';
    }
    const istJson = /application\/json/i.test(r.headers.get('content-type') || '');
    if (r.status !== 200) {
      await r.body?.cancel?.().catch(() => {});
      throw antwortFehler(r.status, r.headers, istJson);
    }
    let body;
    try {
      body = await r.json();
    } catch {
      throw new DmsFehler('kein_dms', 'JSON nicht lesbar');
    }
    const recht = body && body.schluessel && body.schluessel.recht;
    return recht === 'lesen' || recht === 'schreiben' || recht === 'zaehler' ? recht : 'unbekannt';
  }

  /**
   * Verbindungstest beim Einrichten und beim Ändern der Einstellungen: Zahlen abrufen und Stufe prüfen.
   * Erlaubt sind „nur Zähler“ (empfohlen) und „nur lesen“; „lesen und schreiben“ lehnt die App ab.
   */
  async pruefe() {
    const ergebnis = await this.zaehler();
    const stufe = await this.stufe();
    if (stufe !== 'zaehler' && stufe !== 'lesen') throw new DmsFehler('falsche_stufe', `Stufe ${stufe}`);
    return { stufe, etag: ergebnis.etag, zahlen: /** @type {{ zahlen: ReturnType<typeof leseZaehlerstand> }} */ (ergebnis).zahlen };
  }
}

module.exports = {
  DmsFehler, DmsVerbindung, normalisiereAdresse, pruefeSchluesselFormat, leseZaehlerstand, ZAEHLER_PFAD, ICH_PFAD, ZAHLEN,
};
