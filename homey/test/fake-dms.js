'use strict';

/**
 * Kleiner Nachbau des DMS-Zähler-Endpunkts (DMS 0.148.0, motom001/dms#625) für die Tests:
 * GET /api/v1/ich/zaehler mit ETag `"z<stand>-<abdruck>"`, 304 bei passendem If-None-Match (auch Listen, W/ und *),
 * GET /api/v1/ich mit 403 für Schlüssel „nur Zähler“, 401 für unbekannte oder abgelaufene Schlüssel,
 * 503 mit Retry-After im Wartungsmodus. Nur erfundene Daten.
 */

const http = require('node:http');
const crypto = require('node:crypto');

const SCHLUESSEL = {
  dms_zaehlerLenaTestschluessel: { recht: 'zaehler', benutzer: 'Lena' },
  dms_lesenLenaTestschluessel00: { recht: 'lesen', benutzer: 'Lena' },
  dms_schreibenJonasTestschluessel: { recht: 'schreiben', benutzer: 'Jonas' },
  dms_abgelaufenPetraTestschluessel: { recht: 'zaehler', benutzer: 'Petra', abgelaufen: true },
};

function passtEtag(kopf, etag) {
  if (!kopf) return false;
  return kopf.split(',').map((x) => x.trim().replace(/^W\//, '')).some((x) => x === '*' || x === etag);
}

function json(res, status, body, koepfe = {}) {
  const text = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(text), ...koepfe });
  res.end(text);
}

/**
 * @param {{ pfad?: string }} [o] Pfad davor, z. B. „/dms“ hinter einem Reverse-Proxy
 */
async function starteFakeDms(o = {}) {
  const vor = o.pfad || '';
  const zustand = {
    zahlen: { neuePost: 0, zuErledigen: 0, anstehend: 0, ueberfaellig: 0 },
    stand: 0,
    abdruck: '',
    geaendert: new Date('2026-11-03T07:00:00.000Z').toISOString(),
    wartung: false,
    anfragen: [],
    antworten: [],
  };
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const auth = req.headers.authorization || '';
    zustand.anfragen.push({ pfad: url.pathname, ifNoneMatch: req.headers['if-none-match'], auth });
    const ende = res.end.bind(res);
    res.end = (...a) => { zustand.antworten.push({ pfad: url.pathname, status: res.statusCode, laenge: a[0] ? Buffer.byteLength(a[0]) : 0 }); return ende(...a); };

    if (url.pathname === `${vor}/umleitung/api/v1/ich/zaehler`) { res.writeHead(301, { location: 'https://dms.home.arpa/api/v1/ich/zaehler' }); res.end(); return; }
    if (!url.pathname.startsWith(`${vor}/api/`)) { res.writeHead(404, { 'content-type': 'text/html' }); res.end('<h1>Nicht gefunden</h1>'); return; }
    const pfad = url.pathname.slice(vor.length);
    if (zustand.wartung) { json(res, 503, { fehler: 'Wartung' }, { 'retry-after': '120' }); return; }
    const m = /^Bearer\s+(\S+)$/i.exec(auth);
    if (!m) { json(res, 401, { fehler: 'Bitte anmelden.' }); return; }
    if (!m[1].startsWith('dms_')) { json(res, 401, { fehler: 'Unbekanntes Schlüsselformat. Erwartet: Authorization: Bearer dms_…' }); return; }
    const s = SCHLUESSEL[m[1]];
    if (!s) { json(res, 401, { fehler: 'Dieser API-Schlüssel ist ungültig oder wurde gelöscht.' }); return; }
    if (s.abgelaufen) { json(res, 401, { fehler: 'Dieser API-Schlüssel ist am 2026-10-01 abgelaufen.' }); return; }
    if (req.method === 'GET' && pfad === '/api/v1/ich/zaehler') {
      const abdruck = crypto.createHash('sha256').update(JSON.stringify(zustand.zahlen)).digest('base64url').slice(0, 22);
      if (abdruck !== zustand.abdruck) { zustand.stand += 1; zustand.abdruck = abdruck; zustand.geaendert = new Date().toISOString(); }
      const etag = `"z${zustand.stand}-${abdruck}"`;
      const koepfe = { etag, 'cache-control': 'private, no-cache' };
      if (passtEtag(req.headers['if-none-match'], etag)) { res.writeHead(304, koepfe); res.end(); return; }
      json(res, 200, { ...zustand.zahlen, stand: zustand.stand, geaendert: zustand.geaendert }, koepfe);
      return;
    }
    if (s.recht === 'zaehler') { json(res, 403, { fehler: 'Dieser API-Schlüssel darf nur die Zahlen abrufen (GET /api/v1/ich/zaehler).' }); return; }
    if (req.method === 'GET' && pfad === '/api/v1/ich') {
      json(res, 200, { benutzer: { id: '00000000-0000-4000-8000-0000000000aa', name: s.benutzer }, schluessel: { name: 'Homey', recht: s.recht, passwoerter: false, ablauf: null } });
      return;
    }
    json(res, 404, { fehler: 'Diese Schnittstelle gibt es nicht.' });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  return {
    adresse: `http://127.0.0.1:${port}${vor}`,
    port,
    zustand,
    setze(z) { Object.assign(zustand.zahlen, z); },
    stopp: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); }),
  };
}

module.exports = { starteFakeDms, SCHLUESSEL };
