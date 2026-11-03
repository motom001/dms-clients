'use strict';

/**
 * Prüft die App wie `homey app validate --level publish`, aber ohne Homey-CLI und ohne Anmeldung:
 * Das CLI nutzt dafür dieselbe Bibliothek (homey-lib). Aufruf: npm run validieren
 */

const path = require('node:path');
const { App } = require('homey-lib');

const stufe = process.argv[2] || 'publish';
new App(path.join(__dirname, '..')).validate({ level: stufe })
  .then(() => { console.log(`App ist gültig (Stufe ${stufe}).`); })
  .catch((e) => { console.error(`App ist nicht gültig (Stufe ${stufe}):\n${e.message}`); process.exitCode = 1; });
