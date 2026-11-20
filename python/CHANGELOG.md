# Changelog

Änderungen des Python-Clients `ablago` je Version. Ein Release bekommt den Tag `python-v<version>` und landet auf [PyPI](https://pypi.org/project/ablago/).

## 0.1.2

API von Ablago 0.299.2 (automatischer Abgleich): nur Beschreibungen.

Nur Beschreibungen, Beispiele oder Einzelheiten geändert – keine neuen oder weggefallenen Routen, Objekte oder Felder.

## 0.1.1

API von Ablago 0.290.10 (automatischer Abgleich): nur Beschreibungen.

Nur Beschreibungen, Beispiele oder Einzelheiten geändert – keine neuen oder weggefallenen Routen, Objekte oder Felder.

## 0.1.0

Erste Fassung (#22).

- **Handschicht** `AblagoClient` auf aiohttp: `zaehler()` mit ETag/304 (Schlüssel „nur Zähler“ genügt) und `gesundheit()` ohne Schlüssel. Eigene aiohttp-Sitzung möglich, Umleitungen werden nicht verfolgt.
- **Fehler** `AblagoError`, `AblagoAuthError`, `AblagoConnectionError`, `AblagoSSLError`.
- **Vollständige API** `ablago.api` (Zusatz `[api]`), erzeugt aus der API-Beschreibung von Ablago 0.290.8.
