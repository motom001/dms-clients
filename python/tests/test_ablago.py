"""Gegen ein echtes Ablago (CI: Ablago-Image, siehe .github/workflows/python.yml).

Läuft nur mit ABLAGO_URL und ABLAGO_SCHLUESSEL (Schlüssel der Stufe „nur Zähler“), sonst übersprungen.
"""

from __future__ import annotations

import os

import pytest

from ablago import AblagoAuthError, AblagoClient

URL = os.environ.get("ABLAGO_URL")
SCHLUESSEL = os.environ.get("ABLAGO_SCHLUESSEL")
pytestmark = [
    pytest.mark.ablago,
    pytest.mark.skipif(not (URL and SCHLUESSEL), reason="ABLAGO_URL/ABLAGO_SCHLUESSEL fehlen"),
]


async def test_zaehler_und_304() -> None:
    async with AblagoClient(URL or "", api_key=SCHLUESSEL) as c:
        erster = await c.zaehler()
        assert erster.neue_post >= 0 and erster.stand >= 1
        assert c._etag, "Ablago schickt keinen ETag"
        assert await c.zaehler() == erster


async def test_gesundheit() -> None:
    async with AblagoClient(URL or "") as c:
        g = await c.gesundheit()
    assert g.ok and g.zustand == "laeuft"


async def test_falscher_schluessel() -> None:
    async with AblagoClient(URL or "", api_key="dms_gibtesnicht") as c:
        with pytest.raises(AblagoAuthError):
            await c.zaehler()


async def test_erzeugter_teil_gegen_ablago() -> None:
    api = pytest.importorskip("ablago.api")
    from ablago.api.api.konto import get_ich_zaehler

    async with api.AuthenticatedClient(base_url=f"{URL}/api/v1", token=SCHLUESSEL or "") as client:
        stand = await get_ich_zaehler.asyncio(client=client)
    assert stand is not None and stand.stand >= 1
