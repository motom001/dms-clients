# Python-Client für Ablago

**Deutsch** · [English](README.en.md)

Das Paket [`ablago`](https://pypi.org/project/ablago/) spricht aus Python mit [Ablago](https://github.com/motom001/dms), der selbst gehosteten Dokumentenablage für zu Hause und kleine Betriebe. Es ist die Grundlage der Integration für Home Assistant ([#3](https://github.com/motom001/dms-clients/issues/3)) und taugt für eigene Skripte, Monitoring und Werkzeuge.

```bash
pip install ablago            # Handschicht: Zähler und Erreichbarkeit
pip install "ablago[api]"     # dazu die vollständige API (ablago.api)
```

Python 3.12 oder neuer.

## Schnellstart

```python
import asyncio
from ablago import AblagoClient, AblagoAuthError, AblagoConnectionError

async def main():
    async with AblagoClient("https://ablago.example.org", api_key="dms_…") as client:
        stand = await client.zaehler()
        print(stand.neue_post, stand.zu_erledigen, stand.ueberfaellig)

asyncio.run(main())
```

Den Schlüssel legst du in Ablago unter **Mein Konto → Sicherheit → API-Schlüssel** an. Für die Zähler genügt die Stufe **„nur Zähler“** – nimm keine höhere als nötig.

## Zwei Schichten

| Teil | Was | Abhängigkeiten |
| --- | --- | --- |
| `ablago` | **Handschicht**, von Hand geschrieben: `AblagoClient` mit `zaehler()` und `gesundheit()`, verständliche Fehler | `aiohttp` |
| `ablago.api` | **Vollständige API**, erzeugt aus der API-Beschreibung von Ablago: jede Route eine Funktion (synchron und asynchron), jedes Objekt eine typisierte Klasse | `httpx2`, `attrs` (Zusatz `[api]`) |

**Handschicht**
- `AblagoClient(adresse, api_key=None, *, session=None, verify_ssl=True, timeout=10)`. Mit einer eigenen `aiohttp.ClientSession` (etwa der von Home Assistant) bleibt diese nach `close()` offen.
- `await client.zaehler()` → `Zaehlerstand(neue_post, zu_erledigen, ueberfaellig, stand, geaendert)`. Der Client schickt den ETag des letzten Abrufs mit; hat sich nichts geändert, antwortet Ablago mit 304, und du bekommst den letzten Stand ohne neue Übertragung.
- `await client.gesundheit()` → `Gesundheit(ok, zustand, seit)`. Ohne Schlüssel, verrät keine Version. „Ablago läuft, aber die Datenbank nicht“ ist eine Antwort (`ok=False`), kein Fehler.
- Umleitungen folgt der Client nicht, damit der Schlüssel nie an eine andere Adresse geht.

**Fehler** – alle erben von `AblagoError`:

| Fehler | Bedeutung | Was tun |
| --- | --- | --- |
| `AblagoAuthError` | Schlüssel falsch, abgelaufen, widerrufen oder ohne Recht (401/403) | Schlüssel ersetzen |
| `AblagoConnectionError` | nicht erreichbar, Zeitüberschreitung, 5xx | später erneut versuchen |
| `AblagoSSLError` | Zertifikat passt nicht (Unterklasse von `AblagoConnectionError`) | Zertifikat prüfen; `verify_ssl=False` nur im eigenen Netz |

**Vollständige API**

```python
from ablago.api import AuthenticatedClient
from ablago.api.api.ablage import get_mappen

async with AuthenticatedClient(base_url="https://ablago.example.org/api/v1", token="dms_…") as client:
    mappen = await get_mappen.asyncio(client=client)
```

Welche Routen es gibt, steht in der [API-Beschreibung im Handbuch](https://help.ablago.app/admin/aktuell/api/). Die Namen folgen der API: `get_ich_zaehler`, `post_mappen` usw. Ein Schlüssel hat höchstens die Rechte seiner Person; „nur lesen“ erlaubt nur GET.

## Mit Ablago Schritt halten

`ablago.api` entsteht aus `openapi/openapi.json`, der API-Beschreibung einer festen Ablago-Version (`openapi/ABLAGO_VERSION`). Der Ordner `src/ablago/api/` steht nicht im Repository; er entsteht vor jedem Test und Bau mit `python werkzeuge/erzeugen.py`.

Einmal am Tag prüft der Workflow „Python: API abgleichen“, ob es ein neues Ablago-Release gibt. Hat sich die API geändert, öffnet er einen Pull Request mit der neuen Beschreibung:
- **nur Neues** → Minor-Version, darf nach grüner Prüfung gemergt werden;
- **Wegfallendes oder Geändertes** → deutlich markiert, wird von Hand entschieden.

## Entwickeln

```bash
cd python
python -m venv .venv && . .venv/bin/activate
pip install -r werkzeuge/anforderungen-erzeugen.txt -r anforderungen-test.txt
python werkzeuge/erzeugen.py
pip install -e ".[api]"
pytest            # Tests gegen einen nachgebauten Server
ruff check . && mypy src
```

Gegen ein echtes Ablago: `ABLAGO_URL=… ABLAGO_SCHLUESSEL=… pytest -m ablago`. In der CI startet dafür das Image `dms-komplett` in der Version aus `openapi/ABLAGO_VERSION`.

## Veröffentlichen

- Version in `VERSION` erhöhen und in `CHANGELOG.md` einen Abschnitt `## X.Y.Z` ergänzen.
- Nach dem Merge legt der Workflow „Release“ Tag `python-vX.Y.Z` und Release an und lädt das Paket zu PyPI hoch – über **Trusted Publishing**, ohne gespeichertes Passwort oder Token (Umgebung `pypi`).

## Datenschutz

Der Client spricht nur mit der Adresse, die du angibst, und sendet nichts an Dritte. Er speichert nichts auf der Platte; den letzten Zählerstand hält er nur im Arbeitsspeicher.
