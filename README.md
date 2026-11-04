# Clients für Ablago

**Deutsch** · [English](README.en.md)

Programme, die **außerhalb von Ablago** laufen und mit Ablago sprechen: Apps, Erweiterungen und Anbindungen an andere Systeme. [Ablago](https://github.com/motom001/dms) selbst ist die selbst gehostete Dokumentenablage für zu Hause und kleine Betriebe.

> **Du brauchst keinen dieser Clients.** Ablago ist vollständig im Browser bedienbar. Clients sind ein Zusatz, zum Beispiel für das Teilen-Menü am Handy oder eine Lampe, die bei neuer Post leuchtet.

## Welche Clients es gibt und geben soll

Jeder Client liegt in einem **eigenen Ordner direkt unter der Wurzel**. Ein Ordner entsteht erst mit dem ersten Pull Request für diesen Client.

| Bereich | Ordner | Was es ist | Stand |
| --- | --- | --- | --- |
| Hausautomatisierung | [`homey/`](homey/) | App „Ablago“ für Homey Pro: neue Post, Zu erledigen und Fälliges als Werte und Flow-Karten | Version 1.1.0, Homey App Store folgt ([#2](https://github.com/motom001/dms-clients/issues/2)) |
| Hausautomatisierung | `homeassistant/` | Integration für Home Assistant (über HACS): dieselben Zahlen als Sensoren | später ([#3](https://github.com/motom001/dms-clients/issues/3)) |
| Handy und Tablet | `ios/`, `android/` (oder gemeinsam `app/`) | Apps für iPhone, iPad und Android: Scannen, Teilen-Menü, Mitteilungen, Face ID | Konzept ([motom001/dms#340](https://github.com/motom001/dms/issues/340)) |
| Büro | `office/` | Add-ins für Word, Excel und Outlook: Dokument oder E-Mail in Ablago ablegen | Idee (aus [motom001/dms#340](https://github.com/motom001/dms/issues/340)) |
| Büro | `thunderbird/` | Erweiterung für Thunderbird: E-Mail mit Anhängen als Post ablegen | Idee |
| Browser | `browser/` | Erweiterung für Firefox, Chrome und Edge: aktuelle Seite oder Rechnung als Post ablegen | Idee |
| Handy ohne App | `kurzbefehle/` | Apple-Kurzbefehle („Scan an Ablago“, Siri) und Vorlagen für Android-Teilen | Idee |
| Beispiele | `beispiele/` | Anleitungen und kleine Skripte für Node-RED, ioBroker, openHAB, `curl` und Python | Idee |

**Bewusst nicht geplant:** eine eigene Desktop-App (das WebDAV-Laufwerk und der Browser decken das ab), Anbindungen an Cloud-Systeme, die ein aus dem Internet erreichbares Ablago voraussetzen (Google Home, Alexa, SmartThings), und Apple Home/HomeKit (dafür gibt es den Weg über Home Assistant).

Was ein Client in Ablago braucht, etwa den schlanken Zähler-Endpunkt mit dem Schlüssel „nur Zähler“ ([motom001/dms#625](https://github.com/motom001/dms/issues/625)) oder den Webhook ([motom001/dms#627](https://github.com/motom001/dms/issues/627)), entsteht im Repository [motom001/dms](https://github.com/motom001/dms).

## Grundsätze für alle Clients

- **Nur die öffentliche API v1** von Ablago ([API-Beschreibung](https://help.ablago.app/admin/aktuell/api/)). Kein Client braucht Zugang zur Datenbank oder zu Dateien von Ablago.
- **So wenig Rechte wie möglich:** Ein Client verlangt die engste Schlüssel-Stufe, die reicht, und sagt in seinem README, welche das ist.
- **Keine Telemetrie:** Ein Client sendet nichts an Dritte, auch nicht anonym. Er spricht nur mit Ablago unter der Adresse, die du einträgst.
- **Keine Inhalte, wo Zahlen reichen:** Anbindungen an Hausautomatisierung bekommen Zahlen, keine Titel, Absender oder Dokumente.
- **Daten bleiben in Ablago:** Ein Client speichert höchstens, was er für die Anzeige braucht, und sagt, wo.

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

**Versionen:** Jeder Client hat eigene Versionsnummern, unabhängig von Ablago. Ein Release bekommt einen Tag mit Ordnernamen, z. B. `homey-v1.1.0`. Tag und Release entstehen nach dem Merge von selbst, sobald eine neue Version auf `main` steht; der Text kommt aus der `CHANGELOG.md` des Clients. Alle Releases stehen unter [Releases](https://github.com/motom001/dms-clients/releases).

## Mitmachen

Fehler und Wünsche zu einem Client meldest du über die Vorlagen unter [Issues](https://github.com/motom001/dms-clients/issues/new/choose). Fehler in Ablago selbst gehören ins Repository [motom001/dms](https://github.com/motom001/dms/issues/new/choose). Wie ein Beitrag abläuft, steht in [CONTRIBUTING.md](CONTRIBUTING.md), den Fahrplan erklärt [ROADMAP.md](ROADMAP.md).

## Lizenz

[Apache-2.0](LICENSE), siehe auch [NOTICE](NOTICE). Für den Umgang miteinander gilt unser [Verhaltenskodex](CODE_OF_CONDUCT.md).
