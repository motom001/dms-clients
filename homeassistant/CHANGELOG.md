# Changelog

Änderungen der Integration für Home Assistant je Version. Ein Release bekommt den Tag `homeassistant-v<version>`.

## 0.1.1

- **Logo von Ablago in Home Assistant** (Ordner `brand/`, Symbol und Logo hell und dunkel): Seit Home Assistant 2026.3 bringen eigene Integrationen ihr Logo selbst mit; vorher stand an ihrer Stelle ein Platzhalter.
- **Archiv `ablago.zip` am Release** zum Installieren von Hand: auspacken und den Ordner `ablago` nach `custom_components` legen.

## 0.1.0

Erste Fassung (#3, Stufe 1): die Zahlen einer Person als Sensoren, ohne Paket in Ablago und ohne Änderung an Ablago.

- **Einrichtung über die Oberfläche** mit Adresse, Schlüssel der Stufe „nur Zähler“ und „Zertifikat prüfen“. Der Schlüssel wird gleich ausprobiert. Je Person ein Eintrag mit eigenem Gerät.
- **Sensoren:** Neue Post, Zu erledigen, Überfällig, Letzte Änderung. **Binäre Sensoren:** „Neue Post da“ und, als Diagnose, „Konnektivität“ (Ablago läuft und die Datenbank antwortet).
- **Abfrage einmal in der Minute** mit `ETag`. Bei unverändertem Stand antwortet Ablago mit `304` ohne Inhalt.
- **Fehler verständlich:** nicht erreichbar, Zertifikat, Umleitung, keine Ablago unter der Adresse, Schlüssel abgelehnt. Bei einem abgelehnten Schlüssel fragt Home Assistant nach einem neuen; Adresse und Schlüssel lassen sich nachträglich ändern.
- Diagnose zum Herunterladen, ohne Adresse und Schlüssel.
- Texte Deutsch und Englisch.
- Getestet mit Home Assistant 2026.10 und Ablago 0.290.8, Bibliothek `ablago` 0.1.0.
