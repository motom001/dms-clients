# Zu einem Client beitragen

**Deutsch** · [English](CONTRIBUTING.en.md)

**Issues und Pull Requests sind auf Deutsch oder Englisch willkommen.** Bei Abweichungen zwischen deutscher und englischer Fassung gilt die deutsche.

1. **Issue anlegen** – als User Story: „Als … möchte ich …, damit …“, mit Akzeptanzkriterien. Für einen **Fehler oder Wunsch zu einem Client** nimm die passende Vorlage und wähle dort den Client aus. Für einen **neuen Client** gibt es eine eigene Vorlage.
2. **Freigabe abwarten.** Umgesetzt wird nur, was das Label `freigegeben` trägt; das vergibt allein der Maintainer.
3. **Forken und bauen** im Ordner des Clients. Ein neuer Client bekommt einen eigenen Ordner direkt unter der Wurzel mit `README.md` und `CHANGELOG.md`. Was alle Clients teilen und keine eigene Version hat (z. B. Anwendungsfälle), liegt in `gemeinsam/` – dort genügt `README.md`.
4. **Pull Request** mit `Closes #…`. Jeder Commit trägt ein `Signed-off-by:` (`git commit -s`). Damit bestätigst du nach dem [Developer Certificate of Origin](https://developercertificate.org/), dass du den Beitrag unter der [Apache-2.0](LICENSE) einbringen darfst.

## Regeln für Clients

- **Nur die API v1** von Ablago. Fehlt dort etwas, beschreibe es als Wunsch im Repository [motom001/dms](https://github.com/motom001/dms/issues/new/choose) – Clients bauen keine Umwege.
- **Engste Schlüssel-Stufe:** Das README des Clients nennt, welche Stufe des API-Schlüssels er braucht und warum.
- **Keine Telemetrie, keine Werbung, keine Verbindungen zu Dritten**, auch nicht für Absturzberichte. Ausnahme ist nur, was die Plattform selbst zwingend verlangt (etwa ein App Store); das steht dann im README.
- **Geheimnisse sicher ablegen:** API-Schlüssel nur im sicheren Speicher der Plattform (Schlüsselbund, verschlüsselte Einstellungen), nie in Protokollen.
- **Neue Abhängigkeiten nur mit Begründung** im Pull Request: wozu, warum nicht mit Bordmitteln, Lizenz (verträglich mit Apache-2.0), Pflegezustand.
- **Keine echten Daten:** In Beispielen, Tests und Bildschirmfotos nur erfundene Namen (Lena, Jonas …), reservierte Domains wie `dms.example.org` oder `dms.home.arpa` und Dokumentations-IP-Adressen (`192.0.2.x`).
- **Version und Änderungen:** Version des Clients erhöhen (in `package.json`, sonst in einer Datei `VERSION` im Ordner, Format `X.Y.Z`) und in `CHANGELOG.md` einen Abschnitt `## X.Y.Z` ergänzen. Nach dem Merge legt der Workflow „Release“ den Tag `<ordner>-v<version>` und das Release mit diesem Abschnitt als Text an – von Hand ist nichts zu tun. Fehlt der Abschnitt, meldet das schon die Prüfung im Pull Request. Veröffentlichen in fremden Stores (Homey App Store …) macht der Maintainer.

## Gleich in allen Clients

Alle Clients sollen aussehen und sich bedienen wie Ablago selbst und wie die anderen Clients.

- **Name:** Das Programm heißt **Ablago** (ein Wort, nur das A groß). „DMS“ nur, wo die Programmart gemeint ist. Interne Kennungen (`dms_…`, Ordner, API-Pfade) bleiben.
- **App-ID:** `app.ablago.clients.<client>`, z. B. `app.ablago.clients.homey`. Sie ist nach der ersten Veröffentlichung nicht mehr änderbar.
- **Begriffe aus dem [Glossar](https://help.ablago.app/benutzer/aktuell/begriffe/)**, in der Schreibweise der Oberfläche, Du-Form, kurze Sätze. Die drei Zahlen des Zähler-Endpunkts heißen in jedem Client gleich:

  | Zahl | Name | Beschreibung |
  | --- | --- | --- |
  | `neuePost` | Neue Post | Post im Stand Neu, für dich oder für alle |
  | `zuErledigen` | Zu erledigen | Mappen mit offenen Aufgaben für dich – auch Fristen und Erinnerungen, sobald sie mit ihrem Vorlauf fällig werden |
  | `ueberfaellig` | Überfällig | offene Fristen, Erinnerungen und Aufgaben mit Datum vor heute |

  Auslöser heißen „Neue Post angekommen“, „Neue Aufgabe zu erledigen“, „Etwas ist überfällig“. „Anstehend“ gibt es in Ablago nicht mehr ([dms#725](https://github.com/motom001/dms/issues/725)); `anstehend` nicht lesen, kein eigenes Zeitfenster wie „in 7 Tagen“. Unbekannte Felder der Antwort übergehen.
- **Wege so, wie man klickt:** „Klick oben rechts auf deinen Namen → Mein Konto → Sicherheit → API-Schlüssel“, danach kurz „Mein Konto → Sicherheit → API-Schlüssel“. Immer „→“, nie „>“, nie „Profil →“.
- **Stufen** immer in Anführungszeichen: „nur Zähler“, „nur lesen“, „lesen und schreiben“.
- **Englisch:** Solange Ablago nur Deutsch spricht, stehen Begriffe der Oberfläche auf Deutsch in Anführungszeichen, beim ersten Vorkommen mit Übersetzung in Klammern: "nur Zähler" (counts only).
- **Symbole aus [Lucide](https://lucide.dev), dieselben Formen wie in der Oberfläche von Ablago** (`web/src/Symbol.tsx` im Repository `dms`, ISC-Lizenz; nur die Formen kopieren, Lizenzhinweis in `NOTICE`). Neue Post `inbox`, Zu erledigen `list-checks`, Überfällig `triangle-alert`. Lässt eine Plattform nur ihren eigenen Satz zu, das nächstliegende Symbol.
- **Logo und Farben** nur aus dem Ordner `marke/` im Repository [dms-website](https://github.com/motom001/dms-website). Das App-Symbol ist immer das Logo, nie ein eigenes Zeichen.
- **Einrichten:** Adresse und API-Schlüssel, engste Stufe vorschlagen und begründen, die Verbindung sofort prüfen (auch beim Ändern und Reparieren), je Person ein Schlüssel.
- **Meldungen** sagen, warum etwas nicht geht und was zu tun ist, mit dem Weg dorthin; nie den Schlüssel.
- **Was wo steht:** Alles, was nur diesen Client betrifft, steht in seinem README (mit Abschnitt „Datenschutz“: keine Telemetrie, nur was nötig ist, wo was liegt). Das Handbuch von Ablago beschreibt nur das Allgemeine und verweist auf das README.

Fragen gern im Issue. Wie die Arbeit an Ablago selbst läuft, steht im [Entwicklerhandbuch](https://help.ablago.app/entwickler/aktuell/).

Für den Umgang miteinander gilt unser [Verhaltenskodex](CODE_OF_CONDUCT.md).
