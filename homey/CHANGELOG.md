# Changelog

Änderungen der Homey-App je Version. Ein Release bekommt den Tag `homey-v<version>`.

## 1.1.1

Nacharbeit zu 1.1.0 (#7), weiterhin vor der ersten Veröffentlichung.

- Die Symbole der vier Werte haben jetzt **dieselben Formen wie in Ablago selbst** (Lucide aus `web/src/Symbol.tsx`): Neue Post `inbox`, Zu erledigen `list-checks`, Fällig in 7 Tagen `calendar`, Überfällig `triangle-alert`. In 1.1.0 waren es andere Lucide-Formen.

## 1.1.0

Die App heißt jetzt **Ablago** und erscheint so zum ersten Mal im Homey App Store (#6, #7). Version 1.0.0 war nicht veröffentlicht.

- **Name, App-ID und Logo:** App und Gerät heißen „Ablago“, die App-ID ist `app.ablago.clients.homey`. Alle Texte sprechen von Ablago statt vom DMS.
- **Begriffe wie in allen Clients:** Der Wert „Fristen in 7 Tagen“ heißt **„Fällig in 7 Tagen“** (er zählt Fristen, Erinnerungen und Aufgaben mit Datum). Die Flow-Karte heißt **„Etwas wird bald fällig / ist überfällig“**; ihr Hinweis sagt ehrlich, dass sie auch bei neu angelegten Einträgen auslöst. „Neue Post“: „für dich oder für alle“ statt „ohne *Für*“. Kennungen passend dazu (`dms_faellig_7_tage`, Karte `bald_faellig`, Token `faellig_7_tage`).
- **Wege, wie man klickt:** „Klick oben rechts auf deinen Namen → Mein Konto → Sicherheit → API-Schlüssel“ statt „Profil > Sicherheit > API-Schlüssel“. Stufen immer in Anführungszeichen; englische Texte nennen die deutschen Begriffe einheitlich mit Übersetzung.
- **Symbole** der vier Werte aus Lucide (ISC-Lizenz, siehe NOTICE).
- **Wartungsmodus:** Nennt Ablago eine Wartezeit (`Retry-After`), fragt Homey danach wieder – höchstens nach dem eingestellten Abstand.
- README: Hinweis zum Webhook berichtigt (gibt es in Ablago seit 0.150.0; die App nutzt ihn noch nicht).

## 1.0.0

Erste Version (#2).

- Gerät „DMS“ für Homey Pro: Einrichten mit Adresse und API-Schlüssel, Verbindungstest beim Anlegen, beim Ändern der Einstellungen und beim Reparieren.
- Werte **Neue Post**, **Zu erledigen**, **Fristen in 7 Tagen** und **Überfällig** aus `GET /api/v1/ich/zaehler` (DMS ab 0.148.0).
- Flow-Karten: Auslöser „Neue Post angekommen“ und „Frist wird fällig“ (in den nächsten 7 Tagen oder überfällig), Bedingung „Es liegt neue Post vor“.
- Abfrage im einstellbaren Abstand (Vorgabe 5 Minuten) mit `If-None-Match`: Bei unverändertem Stand kommt nur `304` ohne Daten.
- Schlüssel-Stufe „nur Zähler“ empfohlen, „nur lesen“ mit Hinweis, „lesen und schreiben“ abgelehnt.
- Verständliche Meldungen, u. a. für: DMS nicht erreichbar, Schlüssel ungültig oder abgelaufen, falsche Schlüssel-Stufe.
- Texte auf Deutsch und Englisch.
