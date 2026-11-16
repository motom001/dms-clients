# Changelog

Änderungen des Python-Clients `ablago` je Version. Ein Release bekommt den Tag `python-v<version>` und landet auf [PyPI](https://pypi.org/project/ablago/).

## 0.2.0

API von Ablago 0.226.0 (automatischer Abgleich). **Achtung: Es fällt etwas weg oder ändert sich** – Aufrufer prüfen.

**Weggefallene Routen**
- `DELETE /ablaeufe/{id}` – Geplanten Ablauf löschen
- `DELETE /dokumente/{id}/anlagen/{anlage}` – Anlage lösen (zum eigenen Dokument machen)
- `DELETE /mappen/{id}/hinweise/{schluessel}` – Hinweis eines Pakets entfernen
- `DELETE /paketaktionen/laeufe/{lauf}` – Paket-Aktion abbrechen
- `GET /dokumente/{id}/anlagen` – Anlagen eines Dokuments
- `GET /dokumente/{id}/leerseiten` – Leerseiten eines Dokuments in Post
- `GET /mappen/{id}/ablaeufe` – Geplante Abläufe und Vorlagen einer Mappe
- `GET /mappen/{id}/erwaehnungen` – Erwähnungen einer Mappe (#889)
- `GET /mappen/{id}/paketaktionen` – Aktionen von Paketen an einer Mappe
- `GET /mappen/{id}/tabelle/{feld}` – Zeilen einer Tabelle an einer Mappe
- `GET /mappen/{id}/vorlagen` – Text-Vorlagen für eine Mappe
- `GET /merkmale` – Merkmale der Ablage, z. B. „beruflich genutzt“
- `GET /paketdaten/einrichtung/{bereich}` – Einrichtung eines Bereichs (Pakete)
- `GET /paketdaten/nachweise/{bereich}/{monat}` – Nachweise eines Monats (Pakete)
- `GET /typen/{id}/fassungen` – Fassungen eines Mappentyps (Werkbank)
- `GET /typen/{id}/fassungen/{nr}` – Vorschau: Fassung wiederherstellen (Werkbank)
- `POST /dokumente/{id}/anlagen` – Dokument als Anlage anhängen
- `POST /entdecken/rundgaenge/{schluessel}` – Rundgang gesehen oder später
- `POST /entdecken/tipps/{schluessel}` – Tipp gesehen, erledigt, ausblenden oder wieder einblenden
- `POST /mappen/{id}/ablaeufe` – Automatisierungsvorlage an einer Mappe anwenden
- `POST /mappen/{id}/paketaktionen/{paket}/{aktion}` – Aktion eines Pakets starten
- `POST /mappen/{id}/vorlagen/{dokument}/setzen` – Brief aus einer Vorlage setzen (PDF)
- `POST /paketaktionen/laeufe/{lauf}` – Dialog einer Paket-Aktion beantworten
- `POST /paketaktionen/laeufe/{lauf}/datei` – Datei einer Paket-Aktion abholen
- `POST /paketdaten/einrichtung/{bereich}/vergleich` – Einrichtung mit einem gemerkten Stand vergleichen (Pakete)
- `POST /typen/{id}/fassungen/{nr}/wiederherstellen` – Fassung wiederherstellen (Werkbank)
- `PUT /ablaeufe/{id}` – Geplanten Ablauf ändern
- `PUT /dokumente/{id}/anlagen` – Anlagen umsortieren
- `PUT /dokumente/{id}/anlagen/{anlage}` – Anlage umbenennen
- `PUT /dokumente/{id}/leerseiten` – Leerseiten markieren (Pakete)
- `PUT /dokumente/{id}/leerseiten/{nr}` – Seite behalten oder weglassen
- `PUT /mappen/{id}/hinweise/{schluessel}` – Hinweis eines Pakets an der Mappe setzen
- `PUT /sicherungen/{name}/holen` – Angeforderte Sicherung zurückliefern (Pakete)

**Weggefallene Objekte**
- `AblaufEingabe`
- `AblaufErgebnis`
- `AktionenAnMappe`
- `AktionsAntworten`
- `AktionsSchritt`
- `AnlageAnhaengen`
- `AnlageName`
- `Anlagen`
- `AnlagenReihenfolge`
- `Anzeigeregel`
- `EinrichtungEintrag`
- `EinrichtungStand`
- `EinrichtungVergleich`
- `EinrichtungVergleichEingabe`
- `Erwaehnungen`
- `Fassung`
- `FassungWiederherstellen`
- `FassungsListe`
- `FassungsVorschau`
- `HinweisEingabe`
- `LeerseiteWahl`
- `Leerseiten`
- `LeerseitenMarkieren`
- `LeerseitenStand`
- `MappenAblaeufe`
- `MappenAblauf`
- `Merkmale`
- `NachweiseStand`
- `PaketHinweis`
- `RundgangMerker`
- `SicherungHolen`
- `Tabellenseite`
- `TextGesetzt`
- `TextSetzen`
- `TippHandlung`
- `Urheber`
- `VorlageZumAnwenden`
- `VorlagenListe`

**Weggefallene Felder**
- `Abgleich`: `dazu`, `eigene`
- `Dokument`: `anlageNr`, `anlageZu`, `eingangNr`, `leerseiten`, `originalEmail`
- `EmailEingabe`: `mitAnlagen`, `originalEmail`
- `EmailMehrere`: `mitAnlagen`, `originalEmail`
- `Erkennung`: `ausgehend`
- `Feld`: `anzeigen`, `berechnetVon`, `gleicherTyp`, `merkmal`, `negativ`, `quelle`, `schreibschutz`, `standard`, `vorbelegen`, `vorlage`, `zielOptional`, `zielTypen`
- `Mappe`: `vorgabe`
- `MappeDetails`: `ablaufvorlagen`, `erinnerungen`, `fristBeginntMit`, `hinweise`, `vorgabe`
- `MappentypEingabe`: `doppelteBestaetigt`, `inSuche`, `teilVon`
- `PostEingabe`: `an`, `von`
- `PostFotos`: `an`
- `SeitenBearbeiten`: `anlagen`
- `TypVorschlaege`: `dazu`, `erechnung`, `positionen`
- `VorschlaegeEingabe`: `positionen`
- `Wiederhergestellt`: `teile`
- `Zugeordnet`: `leerseiten`
- `Zuordnen`: `leerseiten`, `originalEmail`

## 0.1.0

Erste Fassung (#22).

- **Handschicht** `AblagoClient` auf aiohttp: `zaehler()` mit ETag/304 (Schlüssel „nur Zähler“ genügt) und `gesundheit()` ohne Schlüssel. Eigene aiohttp-Sitzung möglich, Umleitungen werden nicht verfolgt.
- **Fehler** `AblagoError`, `AblagoAuthError`, `AblagoConnectionError`, `AblagoSSLError`.
- **Vollständige API** `ablago.api` (Zusatz `[api]`), erzeugt aus der API-Beschreibung von Ablago 0.290.8.
