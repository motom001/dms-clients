"""Der erzeugte Teil ablago.api: vollständig, importierbar, und er passt zur Handschicht."""

from __future__ import annotations

import importlib
import json
from pathlib import Path

import pytest

ORDNER = Path(__file__).resolve().parent.parent
api = pytest.importorskip("ablago.api", reason="ablago.api ist nicht erzeugt (python werkzeuge/erzeugen.py)")


def test_jede_route_hat_eine_funktion() -> None:
    beschreibung = json.loads((ORDNER / "openapi" / "openapi.json").read_text(encoding="utf-8"))
    erwartet = {
        op["operationId"]
        for methoden in beschreibung["paths"].values()
        for op in methoden.values()
        if isinstance(op, dict) and "operationId" in op
    }
    vorhanden = {p.stem for p in (ORDNER / "src" / "ablago" / "api" / "api").rglob("*.py") if p.stem != "__init__"}

    # Der Generator schreibt operationId in snake_case: getIchZaehler → get_ich_zaehler.
    def schlange(name: str) -> str:
        return "".join("_" + z.lower() if z.isupper() else z for z in name).lstrip("_").replace("-", "_")

    fehlt = sorted(n for n in erwartet if schlange(n) not in vorhanden)
    assert not fehlt, f"Diese Routen fehlen in ablago.api: {fehlt}"


def test_zaehler_ueber_den_erzeugten_teil_importierbar() -> None:
    modul = importlib.import_module("ablago.api.api.konto.get_ich_zaehler")
    assert hasattr(modul, "asyncio") and hasattr(modul, "sync")
    from ablago.api import AuthenticatedClient

    assert AuthenticatedClient(base_url="https://ablago.example.org/api/v1", token="dms_probe")


def test_handschicht_kennt_alle_felder_des_zaehlers() -> None:
    from ablago import Zaehlerstand
    from ablago.api.models import Zaehlerstand as Erzeugt

    pflicht = {"neue_post", "zu_erledigen", "ueberfaellig", "stand", "geaendert"}
    assert pflicht <= {f.name for f in Erzeugt.__attrs_attrs__}
    assert pflicht <= set(Zaehlerstand.__dataclass_fields__)
