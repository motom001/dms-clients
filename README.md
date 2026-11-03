# DMS Clients

**Deutsch** · [English](README.en.md)

Programme, die **außerhalb des DMS** laufen und mit ihm sprechen: Apps, Erweiterungen und Anbindungen an andere Systeme. Das [DMS](https://github.com/motom001/dms) selbst ist das selbst gehostete Dokumentenmanagement für Haushalte und Familien.

> **Du brauchst keinen dieser Clients.** Das DMS ist vollständig im Browser bedienbar. Clients sind ein Zusatz, zum Beispiel für das Teilen-Menü am Handy oder eine Lampe, die bei neuer Post leuchtet.

## Welche Clients es gibt und geben soll

Jeder Client liegt in einem **eigenen Ordner direkt unter der Wurzel**. Ein Ordner entsteht erst mit dem ersten Pull Request für diesen Client.

| Bereich | Ordner | Was es ist | Stand |
| --- | --- | --- | --- |
| Hausautomatisierung | `homey/` | App für Homey Pro: neue Post, Aufgaben und Fristen als Werte und Flow-Karten | geplant ([#2](https://github.com/motom001/dms-clients/issues/2)) |
| Hausautomatisierung | `homeassistant/` | Integration für Home Assistant (über HACS): dieselben Zahlen als Sensoren | später ([#3](https://github.com/motom001/dms-clients/issues/3)) |
| Handy und Tablet | `ios/`, `android/` (oder gemeinsam `app/`) | Apps für iPhone, iPad und Android: Scannen, Teilen-Menü, Mitteilungen, Face ID | Konzept ([motom001/dms#340](https://github.com/motom001/dms/issues/340)) |
| Büro | `office/` | Add-ins für Word, Excel und Outlook: Dokument oder E-Mail ins DMS ablegen | Idee (aus [motom001/dms#340](https://github.com/motom001/dms/issues/340)) |
| Büro | `thunderbird/` | Erweiterung für Thunderbird: E-Mail mit Anhängen als Post ablegen | Idee |
| Browser | `browser/` | Erweiterung für Firefox, Chrome und Edge: aktuelle Seite oder Rechnung als Post ablegen | Idee |
| Handy ohne App | `kurzbefehle/` | Apple-Kurzbefehle („Scan ans DMS“, Siri) und Vorlagen für Android-Teilen | Idee |
| Beispiele | `beispiele/` | Anleitungen und kleine Skripte für Node-RED, ioBroker, openHAB, `curl` und Python | Idee |

**Bewusst nicht geplant:** eine eigene Desktop-App (das WebDAV-Laufwerk und der Browser decken das ab), Anbindungen an Cloud-Systeme, die ein aus dem Internet erreichbares DMS voraussetzen (Google Home, Alexa, SmartThings), und Apple Home/HomeKit (dafür gibt es den Weg über Home Assistant).

Was ein Client im DMS braucht, etwa den schlanken Zähler-Endpunkt mit dem Schlüssel „nur Zähler“ ([motom001/dms#625](https://github.com/motom001/dms/issues/625)) oder den Webhook ([motom001/dms#627](https://github.com/motom001/dms/issues/627)), entsteht im Repository [motom001/dms](https://github.com/motom001/dms).

## Grundsätze für alle Clients

- **Nur die öffentliche API v1** des DMS ([API-Beschreibung](https://motom001.github.io/dms/admin/aktuell/api/)). Kein Client braucht Zugang zur Datenbank oder zu Dateien des DMS.
- **So wenig Rechte wie möglich:** Ein Client verlangt die engste Schlüssel-Stufe, die reicht, und sagt in seinem README, welche das ist.
- **Keine Telemetrie:** Ein Client sendet nichts an Dritte, auch nicht anonym. Er spricht nur mit dem DMS, dessen Adresse du einträgst.
- **Keine Inhalte, wo Zahlen reichen:** Anbindungen an Hausautomatisierung bekommen Zahlen, keine Titel, Absender oder Dokumente.
- **Daten bleiben im DMS:** Ein Client speichert höchstens, was er für die Anzeige braucht, und sagt, wo.

## Aufbau

```
<client>/              ein Ordner je Client, z. B. homey/
  README.md            was der Client kann, welche Schlüssel-Stufe, Installation (de, gern auch README.en.md)
  CHANGELOG.md         Änderungen je Version
  …                    Quellcode, Tests, Build nach den Regeln der jeweiligen Plattform
.github/               Vorlagen für Issues und Pull Requests, Workflows
CONTRIBUTING.md        wie ein Beitrag hierher kommt
ROADMAP.md             wie du den Fahrplan liest
SECURITY.md            Sicherheitslücken vertraulich melden
```

**Versionen:** Jeder Client hat eigene Versionsnummern, unabhängig vom DMS. Ein Release bekommt einen Tag mit Ordnernamen, z. B. `homey-v1.0.0`.

## Mitmachen

Fehler und Wünsche zu einem Client meldest du über die Vorlagen unter [Issues](https://github.com/motom001/dms-clients/issues/new/choose). Fehler im DMS selbst gehören ins Repository [motom001/dms](https://github.com/motom001/dms/issues/new/choose). Wie ein Beitrag abläuft, steht in [CONTRIBUTING.md](CONTRIBUTING.md), den Fahrplan erklärt [ROADMAP.md](ROADMAP.md).

## Lizenz

[Apache-2.0](LICENSE), siehe auch [NOTICE](NOTICE). Für den Umgang miteinander gilt unser [Verhaltenskodex](CODE_OF_CONDUCT.md).
