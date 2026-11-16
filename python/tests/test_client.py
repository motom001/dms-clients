"""Tests der Handschicht gegen einen kleinen nachgebauten Ablago-Server (aiohttp), ohne Netz."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from datetime import UTC, datetime

import pytest
from aiohttp import web
from aiohttp.test_utils import TestServer

from ablago import (
    AblagoAuthError,
    AblagoClient,
    AblagoConnectionError,
    AblagoError,
    AblagoSSLError,
    Gesundheit,
    Zaehlerstand,
)

SCHLUESSEL = "dms_probe"
STAND = {"neuePost": 2, "zuErledigen": 5, "ueberfaellig": 1, "stand": 42, "geaendert": "2026-11-03T07:15:00.000Z"}


class Nachbau:
    """Merkt sich Anfragen und antwortet wie Ablago."""

    def __init__(self) -> None:
        self.anfragen: list[web.Request] = []
        self.zaehler: dict = dict(STAND)
        self.gesundheit: tuple[int, dict] = (200, {"ok": True, "zustand": "laeuft", "stand": "x"})
        self.zaehler_status: int | None = None
        self.verzoegerung = 0.0

    async def ich_zaehler(self, anfrage: web.Request) -> web.StreamResponse:
        self.anfragen.append(anfrage)
        if self.verzoegerung:
            await asyncio.sleep(self.verzoegerung)
        if anfrage.headers.get("Authorization") != f"Bearer {SCHLUESSEL}":
            return web.json_response({"fehler": "Schlüssel ungültig"}, status=401)
        if self.zaehler_status:
            return web.json_response({"fehler": "Kaputt"}, status=self.zaehler_status)
        etag = f'W/"{self.zaehler["stand"]}"'
        if anfrage.headers.get("If-None-Match") == etag:
            return web.Response(status=304, headers={"ETag": etag})
        return web.json_response(self.zaehler, headers={"ETag": etag})

    async def gesundheit_route(self, anfrage: web.Request) -> web.StreamResponse:
        self.anfragen.append(anfrage)
        status, daten = self.gesundheit
        return web.json_response(daten, status=status)


@pytest.fixture
async def nachbau() -> AsyncIterator[tuple[Nachbau, str]]:
    n = Nachbau()
    app = web.Application()
    app.router.add_get("/api/v1/ich/zaehler", n.ich_zaehler)
    app.router.add_get("/api/gesundheit", n.gesundheit_route)

    async def umleiten(_: web.Request) -> web.StreamResponse:
        raise web.HTTPFound("https://example.org/")

    app.router.add_get("/umleitung/api/v1/ich/zaehler", umleiten)
    server = TestServer(app)
    await server.start_server()
    try:
        yield n, str(server.make_url("")).rstrip("/")
    finally:
        await server.close()


Fabrik = Callable[..., AblagoClient]


@pytest.fixture
async def client(nachbau: tuple[Nachbau, str]) -> AsyncIterator[Fabrik]:
    offen: list[AblagoClient] = []

    def fabrik(**kw: object) -> AblagoClient:
        c = AblagoClient(kw.pop("adresse", nachbau[1]), api_key=kw.pop("api_key", SCHLUESSEL), **kw)  # type: ignore[arg-type]
        offen.append(c)
        return c

    yield fabrik
    for c in offen:
        await c.close()


async def test_zaehler_liest_zahlen(client: Fabrik) -> None:
    stand = await client().zaehler()
    assert stand == Zaehlerstand(2, 5, 1, 42, datetime(2026, 11, 3, 7, 15, tzinfo=UTC))


async def test_zaehler_304_liefert_letzten_stand(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    n, _ = nachbau
    c = client()
    erster = await c.zaehler()
    zweiter = await c.zaehler()
    assert zweiter == erster
    assert n.anfragen[0].headers.get("If-None-Match") is None
    assert n.anfragen[1].headers.get("If-None-Match") == 'W/"42"'
    # Nach einer Änderung kommt der neue Stand.
    n.zaehler = {**STAND, "neuePost": 3, "stand": 43}
    assert (await c.zaehler()).neue_post == 3


async def test_zaehler_uebergeht_unbekannte_felder(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    nachbau[0].zaehler = {**STAND, "spaeterNeu": 7}
    assert (await client().zaehler()).zu_erledigen == 5


async def test_zaehler_kaputte_antwort(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    nachbau[0].zaehler = {**STAND, "neuePost": "zwei"}
    with pytest.raises(AblagoError, match="neuePost"):
        await client().zaehler()


async def test_schluessel_falsch(client: Fabrik) -> None:
    with pytest.raises(AblagoAuthError) as fehler:
        await client(api_key="dms_falsch").zaehler()
    assert fehler.value.status == 401
    assert "Schlüssel ungültig" in str(fehler.value)


async def test_ohne_schluessel(client: Fabrik) -> None:
    with pytest.raises(AblagoAuthError):
        await client(api_key=None).zaehler()


async def test_403_ist_auth_fehler(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    nachbau[0].zaehler_status = 403
    with pytest.raises(AblagoAuthError):
        await client().zaehler()


async def test_500_ist_verbindungsfehler(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    nachbau[0].zaehler_status = 502
    with pytest.raises(AblagoConnectionError) as fehler:
        await client().zaehler()
    assert fehler.value.status == 502


async def test_zeitueberschreitung(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    nachbau[0].verzoegerung = 0.5
    with pytest.raises(AblagoConnectionError, match="rechtzeitig"):
        await client(timeout=0.1).zaehler()


async def test_nicht_erreichbar(client: Fabrik) -> None:
    # Port 9 (discard) auf localhost nimmt praktisch nie Verbindungen an.
    with pytest.raises(AblagoConnectionError):
        await client(adresse="http://127.0.0.1:9", timeout=2).zaehler()


async def test_umleitung_wird_nicht_gefolgt(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    with pytest.raises(AblagoError, match="leitet um"):
        await client(adresse=nachbau[1] + "/umleitung").zaehler()


async def test_gesundheit(nachbau: tuple[Nachbau, str], client: Fabrik) -> None:
    c = client(api_key=None)
    assert await c.gesundheit() == Gesundheit(ok=True, zustand="laeuft", seit=None)
    nachbau[0].gesundheit = (
        503,
        {"ok": False, "zustand": "datenbank", "datenbank": "antwortet-nicht", "seit": "2026-11-16T00:00:00Z"},
    )
    g = await c.gesundheit()
    assert not g.ok and g.zustand == "datenbank" and g.seit == datetime(2026, 11, 16, tzinfo=UTC)
    # Die Gesundheit schickt nie einen Schlüssel mit.
    assert all("Authorization" not in a.headers for a in nachbau[0].anfragen)


async def test_ssl_fehler_gegen_selbst_signiert() -> None:
    # Ohne passendes Zertifikat (hier: HTTP-Server, HTTPS-Anfrage) kommt ein Verbindungsfehler, nie ein Absturz.
    app = web.Application()
    server = TestServer(app)
    await server.start_server()
    try:
        c = AblagoClient(f"https://127.0.0.1:{server.port}", api_key=SCHLUESSEL, timeout=2)
        with pytest.raises(AblagoConnectionError):
            await c.zaehler()
        await c.close()
    finally:
        await server.close()


def test_ssl_fehler_ist_verbindungsfehler() -> None:
    assert issubclass(AblagoSSLError, AblagoConnectionError)


@pytest.mark.parametrize("adresse", ["ablago.example.org", "ftp://ablago.example.org", "https://", ""])
def test_adresse_ungueltig(adresse: str) -> None:
    with pytest.raises(ValueError):
        AblagoClient(adresse, api_key=SCHLUESSEL)


def test_adresse_bereinigt() -> None:
    assert AblagoClient(" https://ablago.example.org/ablage/ ").adresse == "https://ablago.example.org/ablage"


async def test_eigene_sitzung_bleibt_offen(nachbau: tuple[Nachbau, str]) -> None:
    import aiohttp

    async with aiohttp.ClientSession() as sitzung:
        async with AblagoClient(nachbau[1], api_key=SCHLUESSEL, session=sitzung) as c:
            await c.zaehler()
        assert not sitzung.closed
