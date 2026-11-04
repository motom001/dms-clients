'use strict';

/** Stimmen Manifest, Texte und Logik zusammen? (ohne Homey-Werkzeuge) */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');
const app = require('../app.json');
const pkg = require('../package.json');
const de = require('../locales/de.json');
const en = require('../locales/en.json');
const { WERTE } = require('../lib/auswertung');

const wurzel = path.join(__dirname, '..');
const quelltext = ['lib/dms.js', 'lib/abfrage.js', 'lib/auswertung.js', 'drivers/dms/device.js', 'drivers/dms/driver.js', 'app.js']
  .map((f) => fs.readFileSync(path.join(wurzel, f), 'utf8')).join('\n');

describe('Manifest', () => {
  it('nur Homey Pro, gleiche Version wie package.json', () => {
    assert.deepEqual(app.platforms, ['local']);
    assert.deepEqual(app.drivers[0].platforms, ['local']);
    assert.equal(app.version, pkg.version);
    assert.ok(fs.readFileSync(path.join(wurzel, 'CHANGELOG.md'), 'utf8').includes(`## ${app.version}`), 'CHANGELOG hat die Version');
    const homeyLog = JSON.parse(fs.readFileSync(path.join(wurzel, '.homeychangelog.json'), 'utf8'));
    assert.ok(homeyLog[app.version] && homeyLog[app.version].en && homeyLog[app.version].de, '.homeychangelog.json hat die Version');
  });

  it('jede Zahl hat eine eigene Capability mit deutschem und englischem Titel', () => {
    assert.deepEqual(app.drivers[0].capabilities.sort(), Object.values(WERTE).sort());
    for (const cap of Object.values(WERTE)) {
      const c = app.capabilities[cap];
      assert.ok(c.title.de && c.title.en, cap);
      assert.equal(c.type, 'number');
      assert.equal(c.setable, false);
      assert.ok(fs.existsSync(path.join(wurzel, c.icon)), c.icon);
    }
  });

  it('Flow-Karten und Tokens passen zur Auswertung', () => {
    const ids = (liste) => (liste || []).map((k) => k.id).sort();
    assert.deepEqual(ids(app.flow.triggers), ['neue_aufgabe', 'neue_post', 'ueberfaellig']);
    assert.deepEqual(ids(app.flow.conditions), ['neue_post_vorhanden']);
    const tokens = (id) => app.flow.triggers.find((k) => k.id === id).tokens.map((t) => t.name).sort();
    assert.deepEqual(tokens('neue_post'), ['dazu', 'neue_post']);
    assert.deepEqual(tokens('neue_aufgabe'), ['dazu', 'zu_erledigen']);
    assert.deepEqual(tokens('ueberfaellig'), ['dazu', 'ueberfaellig']);
    for (const k of app.flow.triggers) assert.deepEqual(k.args.map((a) => a.name), ['device'], `${k.id}: keine Auswahl`);
    for (const k of [...app.flow.triggers, ...app.flow.conditions]) assert.ok(k.title.de && k.title.en, k.id);
  });

  it('alle Fehlercodes haben Texte auf Deutsch und Englisch', () => {
    const codes = [...quelltext.matchAll(/DmsFehler\('([a-z_]+)'/g)].map((m) => m[1]);
    codes.push('unerwartet');
    for (const c of new Set(codes)) {
      assert.ok(de.fehler[c], `de: ${c}`);
      assert.ok(en.fehler[c], `en: ${c}`);
    }
    assert.deepEqual(Object.keys(de).sort(), Object.keys(en).sort());
    assert.deepEqual(Object.keys(de.fehler).sort(), Object.keys(en.fehler).sort());
    assert.match(de.fehler.falsche_stufe, /nur Zähler/);
  });

  it('keine Emoji und keine Verbindungen außer zu Ablago', () => {
    const texte = [JSON.stringify(app), JSON.stringify(de), JSON.stringify(en), quelltext];
    for (const t of texte) assert.doesNotMatch(t, /\p{Extended_Pictographic}/u);
    const adressen = [...quelltext.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]);
    for (const a of adressen) assert.match(a, /dms\.home\.arpa|example\.org|192\.0\.2\.|\$\{/, a);
  });
});

describe('Einheitlich in allen Clients', () => {
  const texte = [JSON.stringify(app), JSON.stringify(de), JSON.stringify(en)].join('\n');

  it('App-ID nach dem Schema app.ablago.clients.<client>, Name Ablago', () => {
    assert.equal(app.id, 'app.ablago.clients.homey');
    assert.equal(pkg.name, app.id);
    assert.deepEqual(app.name, { en: 'Ablago', de: 'Ablago' });
  });

  it('die drei Zahlen heißen wie in allen Clients', () => {
    const titel = Object.values(WERTE).map((c) => app.capabilities[c].title.de);
    assert.deepEqual(titel, ['Neue Post', 'Zu erledigen', 'Überfällig']);
    // „Anstehend“ gibt es in Ablago nicht mehr (dms #725), auch kein eigenes 7-Tage-Fenster.
    assert.doesNotMatch(texte, /in 7 Tagen|within 7 days|in 7 days|[Aa]nstehend|bald fällig|due soon|Frist wird fällig|ohne Für/);
  });

  it('Wege so, wie man klickt: Mein Konto → Sicherheit → API-Schlüssel, nie Profil', () => {
    assert.doesNotMatch(texte, /Profil\s*[>→]/);
    assert.match(de.fehler.schluessel_ungueltig, /Mein Konto → Sicherheit → API-Schlüssel/);
    const hinweis = app.drivers[0].settings.flatMap((g) => g.children).find((c) => c.id === 'schluessel').hint;
    assert.match(hinweis.de, /Klick oben rechts auf deinen Namen → Mein Konto → Sicherheit → API-Schlüssel/);
    assert.match(hinweis.en, /"Mein Konto" \(my account\)/);
  });

  it('Stufen immer in Anführungszeichen', () => {
    const deTexte = [JSON.stringify(de), JSON.stringify(app.drivers[0])].join('\n');
    assert.doesNotMatch(deTexte, /(?<![„"])nur Zähler/, 'de: „nur Zähler“');
    for (const m of JSON.stringify(en).matchAll(/(.)nur Zähler/g)) assert.equal(m[1], '"', 'en: "nur Zähler"');
  });
});
