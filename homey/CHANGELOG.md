# Changelog

Änderungen der Homey-App je Version. Ein Release bekommt den Tag `homey-v<version>`.

## 1.0.0

Erste Version (#2).

- Gerät „DMS“ für Homey Pro: Einrichten mit Adresse und API-Schlüssel, Verbindungstest beim Anlegen, beim Ändern der Einstellungen und beim Reparieren.
- Werte **Neue Post**, **Zu erledigen**, **Fristen in 7 Tagen** und **Überfällig** aus `GET /api/v1/ich/zaehler` (DMS ab 0.148.0).
- Flow-Karten: Auslöser „Neue Post angekommen“ und „Frist wird fällig“ (in den nächsten 7 Tagen oder überfällig), Bedingung „Es liegt neue Post vor“.
- Abfrage im einstellbaren Abstand (Vorgabe 5 Minuten) mit `If-None-Match`: Bei unverändertem Stand kommt nur `304` ohne Daten.
- Schlüssel-Stufe „nur Zähler“ empfohlen, „nur lesen“ mit Hinweis, „lesen und schreiben“ abgelehnt.
- Verständliche Meldungen, u. a. für: DMS nicht erreichbar, Schlüssel ungültig oder abgelaufen, falsche Schlüssel-Stufe.
- Texte auf Deutsch und Englisch.
