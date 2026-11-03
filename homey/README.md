# DMS für Homey Pro

**Deutsch** · [English](README.en.md)

App für **Homey Pro**: Neue Post, Aufgaben und Fristen aus deinem selbst gehosteten [DMS](https://github.com/motom001/dms) als Werte am Gerät und als Flow-Karten. So kann zum Beispiel eine Lampe leuchten, wenn neue Post da ist, oder eine Mitteilung kommen, wenn eine Frist ansteht – ohne dass jemand das DMS öffnet.

![Zusammenspiel: Homey fragt das DMS ab und löst Flows aus (erfundene Werte)](bilder/ablauf.svg)

## Voraussetzungen

- **Homey Pro** mit Homey ab Version 12.4.0. **Homey Cloud geht nicht:** Sie läuft im Internet und erreicht ein DMS in deinem Heimnetz nicht.
- **DMS ab Version 0.148.0** (Zähler-Endpunkt, [motom001/dms#625](https://github.com/motom001/dms/issues/625)).
- Homey muss das DMS im Heimnetz erreichen, z. B. unter `https://dms.home.arpa` oder `http://192.0.2.10:8080`.

## Welcher Schlüssel? „nur Zähler“

Die App braucht einen **API-Schlüssel der Stufe „nur Zähler“**. Den legst du im DMS unter **Profil → Sicherheit → API-Schlüssel** an.

- **Warum diese Stufe:** Ein Schlüssel „nur Zähler“ ruft nur `GET /api/v1/ich/zaehler` auf und bekommt dort nur Zahlen – keine Titel, Absender, Namen oder Dokumente. Alles andere beantwortet das DMS mit `403`. Geht der Schlüssel verloren (etwa mit einer Sicherung des Homey), erfährt jemand höchstens, wie viel Post und Aufgaben du hast.
- **„nur lesen“** funktioniert auch; das Gerät zeigt dann den Hinweis, dass „nur Zähler“ genügt.
- **„lesen und schreiben“** lehnt die App ab („Nimm einen Schlüssel ‚nur Zähler‘“). Sie braucht keine Schreibrechte.
- Die Zahlen gelten für den **Benutzer des Schlüssels** und in seinen Rechten. Für mehrere Personen legst du je Person einen Schlüssel und ein eigenes Gerät „DMS“ an.

## Einrichten

1. Im DMS als die Person anmelden, deren Zahlen Homey zeigen soll, und unter **Profil → Sicherheit → API-Schlüssel** einen Schlüssel mit der Stufe **„nur Zähler“** anlegen, z. B. „Homey“. Den Schlüssel gleich kopieren – er ist nur einmal ganz zu sehen.
2. In der Homey-App **Gerät hinzufügen → DMS** wählen.
3. **Adresse des DMS** und **API-Schlüssel** eintragen. Homey prüft die Verbindung sofort: Erst wenn Zahlen kommen und die Stufe passt, geht es weiter.
4. Gerät „DMS“ hinzufügen und bei Bedarf umbenennen, z. B. „DMS Lena“.

![Einrichten mit Adresse und Schlüssel (schematisch, erfundene Werte)](bilder/einrichten.svg)

Adresse, Schlüssel und Abfrage-Abstand änderst du später in den **Einstellungen des Geräts**; auch dort prüft Homey die Verbindung vor dem Speichern. Ist der Schlüssel abgelaufen, geht auch **Reparieren**.

## Werte und Flow-Karten

| Wert am Gerät | Zahl im DMS (`GET /api/v1/ich/zaehler`) |
| --- | --- |
| **Neue Post** | `neuePost`: Post im Stand *Neu* für dich oder ohne *Für* |
| **Zu erledigen** | `zuErledigen`: Mappen mit offenen Aufgaben für dich |
| **Fristen in 7 Tagen** | `anstehend`: Fristen, Erinnerungen und Aufgaben mit Datum von heute bis in 7 Tagen |
| **Überfällig** | `ueberfaellig`: offene Fristen, Erinnerungen und Aufgaben mit Datum vor heute |

| Flow-Karte | Art | Wann |
| --- | --- | --- |
| **Neue Post angekommen** | Auslöser | Die Zahl der neuen Post steigt. Tokens: *Neue Post insgesamt*, *Neu dazugekommen* |
| **Eine Frist steht in den nächsten 7 Tagen an / ist überfällig** | Auslöser | „Fristen in 7 Tagen“ bzw. „Überfällig“ steigt. Tokens: *Fristen in 7 Tagen*, *Überfällig* |
| **Es liegt neue Post vor** | Bedingung | „Neue Post“ ist größer als 0 (auch umkehrbar: *keine* neue Post) |

Alle vier Werte stehen außerdem als Tokens in Flows und in Insights (Verlauf) zur Verfügung.

## Abfrage

Homey fragt das DMS im **Abfrage-Abstand** (Vorgabe 5 Minuten, einstellbar von 1 Minute bis 1 Tag). Dabei schickt die App das `ETag` des letzten Abrufs als `If-None-Match`. Hat sich nichts geändert, antwortet das DMS mit `304 Not Modified` **ohne Inhalt** – es werden keine Zahlen übertragen. Ein Auslöser kommt also spätestens einen Abfrage-Abstand nach der neuen Post.

Beim ersten Abruf nach dem Einrichten löst nichts aus. Nach einem Neustart des Homey vergleicht die App mit den zuletzt gespeicherten Werten: Post, die in der Zwischenzeit kam, löst dann einmal aus.

**Später:** Sobald das DMS einen Webhook hat ([motom001/dms#627](https://github.com/motom001/dms/issues/627)), kann die App optional sofort auslösen, statt auf die nächste Abfrage zu warten.

## Fehlermeldungen

Bei einem Fehler zeigt das Gerät „nicht verfügbar“ mit dem Grund; beim Einrichten erscheint derselbe Text. Sobald ein Abruf wieder klappt, ist das Gerät von selbst wieder verfügbar.

| Meldung | Was tun |
| --- | --- |
| **Das DMS ist nicht erreichbar.** | Adresse prüfen, läuft das DMS, ist es im Heimnetz erreichbar? |
| **Der API-Schlüssel ist ungültig, gelöscht oder abgelaufen.** | Im DMS einen neuen Schlüssel „nur Zähler“ anlegen und eintragen (Einstellungen oder Reparieren). |
| **Dieser API-Schlüssel hat die falsche Stufe. Nimm einen Schlüssel „nur Zähler“.** | Der Schlüssel darf schreiben (oder hat eine unbekannte Stufe). Neuen Schlüssel „nur Zähler“ anlegen. |
| Homey vertraut dem Zertifikat nicht. | Adresse mit gültigem Zertifikat nehmen oder, nur im eigenen Heimnetz, die `http://`-Adresse des DMS. |
| Unter dieser Adresse antwortet kein DMS ab 0.148.0. | Adresse und Version des DMS prüfen. |
| Das DMS ist im Wartungsmodus. | Nichts – Homey fragt im nächsten Abstand wieder. |

## Datenschutz

- **Keine Telemetrie, keine Verbindungen zu Dritten.** Die App spricht nur mit der DMS-Adresse, die du einträgst. Installation und Updates laufen über den Homey App Store; das verlangt die Plattform.
- **Nur Zahlen:** Die App liest beim DMS nur die vier Zahlen (und beim Start die Stufe des Schlüssels über `GET /api/v1/ich`; dort speichert sie nichts).
- **Wo was liegt:** Adresse und Schlüssel stehen in den Einstellungen des Geräts auf deinem Homey Pro (der Schlüssel in einem Passwortfeld, nicht angezeigt). Einen eigenen Schlüsselbund bietet Homey Apps nicht. Die Zahlen speichert Homey als Werte des Geräts und in Insights. Der Schlüssel steht nie im Protokoll der App.

## Grenzen

- Kommt in einem Abfrage-Abstand genauso viel Post dazu, wie erledigt wird, bleibt die Zahl gleich – dann löst „Neue Post angekommen“ nicht aus.
- Die App folgt keinen Weiterleitungen (z. B. von `http://` auf `https://`), damit der Schlüssel nicht an eine andere Adresse geht. Trag die Zieladresse direkt ein.

## Entwicklung

```sh
cd homey
npm ci            # nur Werkzeuge für die Prüfung; die App selbst hat keine Abhängigkeiten
npm test          # Logik und Gerät gegen einen nachgebauten DMS-Server (node --test)
npm run validieren  # Manifest, Bilder und Flow-Karten wie „homey app validate --level publish“
```

- Aufbau: `lib/` enthält die Logik ohne Homey-Laufzeit (Abruf mit ETag, Auswertung, Fehlerzuordnung), `drivers/dms/` das Gerät und das Einrichten, `locales/` die Texte (de, en). Das Manifest steht direkt in `app.json` (ohne Homey Compose).
- Ausprobieren auf einem Homey Pro: `npx homey app run` (Homey-CLI, Anmeldung bei Athom nötig).
- Bilder: Quellen als SVG in `bilder/`; die PNG unter `assets/images/` und `drivers/dms/assets/images/` sind daraus gerendert (z. B. `rsvg-convert -w 1000 -h 700 bilder/app-bild.svg -o assets/images/xlarge.png`).
- Neue Version: `version` in `package.json` und `app.json`, `CHANGELOG.md` und `.homeychangelog.json` ergänzen. Ein Release bekommt den Tag `homey-v<version>` und wird mit `npx homey app publish` hochgeladen.

## Lizenz

[Apache-2.0](../LICENSE), siehe auch [NOTICE](../NOTICE).
