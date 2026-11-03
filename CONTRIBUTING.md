# Zu einem Client beitragen

**Deutsch** · [English](CONTRIBUTING.en.md)

**Issues und Pull Requests sind auf Deutsch oder Englisch willkommen.** Bei Abweichungen zwischen deutscher und englischer Fassung gilt die deutsche.

1. **Issue anlegen** – als User Story: „Als … möchte ich …, damit …“, mit Akzeptanzkriterien. Für einen **Fehler oder Wunsch zu einem Client** nimm die passende Vorlage und wähle dort den Client aus. Für einen **neuen Client** gibt es eine eigene Vorlage.
2. **Freigabe abwarten.** Umgesetzt wird nur, was das Label `freigegeben` trägt; das vergibt allein der Maintainer.
3. **Forken und bauen** im Ordner des Clients. Ein neuer Client bekommt einen eigenen Ordner direkt unter der Wurzel mit `README.md` und `CHANGELOG.md`.
4. **Pull Request** mit `Closes #…`. Jeder Commit trägt ein `Signed-off-by:` (`git commit -s`). Damit bestätigst du nach dem [Developer Certificate of Origin](https://developercertificate.org/), dass du den Beitrag unter der [Apache-2.0](LICENSE) einbringen darfst.

## Regeln für Clients

- **Nur die API v1** des DMS. Fehlt dort etwas, beschreibe es als Wunsch im Repository [motom001/dms](https://github.com/motom001/dms/issues/new/choose) – Clients bauen keine Umwege.
- **Engste Schlüssel-Stufe:** Das README des Clients nennt, welche Stufe des API-Schlüssels er braucht und warum.
- **Keine Telemetrie, keine Werbung, keine Verbindungen zu Dritten**, auch nicht für Absturzberichte. Ausnahme ist nur, was die Plattform selbst zwingend verlangt (etwa ein App Store); das steht dann im README.
- **Geheimnisse sicher ablegen:** API-Schlüssel nur im sicheren Speicher der Plattform (Schlüsselbund, verschlüsselte Einstellungen), nie in Protokollen.
- **Neue Abhängigkeiten nur mit Begründung** im Pull Request: wozu, warum nicht mit Bordmitteln, Lizenz (verträglich mit Apache-2.0), Pflegezustand.
- **Keine echten Daten:** In Beispielen, Tests und Bildschirmfotos nur erfundene Namen (Lena, Jonas …), reservierte Domains wie `dms.example.org` oder `dms.home.arpa` und Dokumentations-IP-Adressen (`192.0.2.x`).
- **Version und Änderungen:** Version des Clients erhöhen und `CHANGELOG.md` ergänzen. Ein Release bekommt einen Tag `<ordner>-v<version>`.

Fragen gern im Issue. Wie die Arbeit am DMS selbst läuft, steht im [Entwicklerhandbuch](https://motom001.github.io/dms/entwickler/aktuell/).

Für den Umgang miteinander gilt unser [Verhaltenskodex](CODE_OF_CONDUCT.md).
