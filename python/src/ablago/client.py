"""Handschicht: ein schmaler, asynchroner Einstieg für die häufigsten Abfragen.

Gebaut auf aiohttp, damit Home Assistant seine eigene Sitzung mitgeben kann (Home Assistant teilt eine aiohttp-
Sitzung für alle Integrationen). Für alles Übrige gibt es den aus der API-Beschreibung erzeugten Teil `ablago.api`.
"""

from __future__ import annotations

import ssl
from types import TracebackType
from typing import Any
from urllib.parse import urlsplit

import aiohttp

from .exceptions import AblagoAuthError, AblagoConnectionError, AblagoError, AblagoSSLError
from .models import Gesundheit, Zaehlerstand

STANDARD_ZEITGRENZE = 10.0


class AblagoClient:
    """Verbindung zu einer Ablago.

    ``adresse`` ist die Adresse, unter der Ablago im Browser erreichbar ist, z. B. ``https://ablago.example.org``.
    ``api_key`` ist ein Schlüssel aus *Mein Konto → Sicherheit → API-Schlüssel*; für :meth:`zaehler` genügt die
    Stufe „nur Zähler“. Ohne eigene ``session`` legt der Client eine an und schließt sie mit :meth:`close` wieder.

    .. code-block:: python

        async with AblagoClient("https://ablago.example.org", api_key="dms_…") as client:
            stand = await client.zaehler()
            print(stand.neue_post)
    """

    def __init__(
        self,
        adresse: str,
        api_key: str | None = None,
        *,
        session: aiohttp.ClientSession | None = None,
        verify_ssl: bool = True,
        timeout: float = STANDARD_ZEITGRENZE,
    ) -> None:
        teile = urlsplit(adresse.strip())
        if teile.scheme not in ("http", "https") or not teile.netloc:
            raise ValueError(
                "Adresse braucht http:// oder https:// und einen Rechnernamen, z. B. https://ablago.example.org"
            )
        self._basis = f"{teile.scheme}://{teile.netloc}{teile.path.rstrip('/')}"
        self._api_key = api_key
        self._session = session
        self._eigene_session = session is None
        self._verify_ssl = verify_ssl
        self._timeout = aiohttp.ClientTimeout(total=timeout)
        # Letzter ETag und Stand: Bei 304 liefert zaehler() den letzten Stand ohne neue Übertragung.
        self._etag: str | None = None
        self._letzter_stand: Zaehlerstand | None = None

    # ---------- Lebensdauer ----------

    async def __aenter__(self) -> AblagoClient:
        return self

    async def __aexit__(
        self, typ: type[BaseException] | None, fehler: BaseException | None, spur: TracebackType | None
    ) -> None:
        await self.close()

    async def close(self) -> None:
        """Schließt die Sitzung – nur, wenn der Client sie selbst angelegt hat."""
        if self._eigene_session and self._session is not None:
            await self._session.close()
            self._session = None

    def _sitzung(self) -> aiohttp.ClientSession:
        if self._session is None:
            self._session = aiohttp.ClientSession()
        return self._session

    @property
    def adresse(self) -> str:
        """Die bereinigte Adresse von Ablago, ohne Schrägstrich am Ende."""
        return self._basis

    # ---------- Abfragen ----------

    async def zaehler(self) -> Zaehlerstand:
        """Neue Post, Zu erledigen und Überfälliges der Person, der der Schlüssel gehört.

        Schickt den ETag des letzten Abrufs mit. Hat sich nichts geändert, antwortet Ablago mit 304 ohne Inhalt,
        und der Client liefert den letzten Stand – häufiges Abfragen kostet so fast nichts.
        """
        if not self._api_key:
            raise AblagoAuthError("Für die Zähler braucht es einen API-Schlüssel")
        koepfe = {"Authorization": f"Bearer {self._api_key}"}
        if self._etag and self._letzter_stand is not None:
            koepfe["If-None-Match"] = self._etag
        status, daten, antwort_koepfe = await self._anfrage("GET", "/api/v1/ich/zaehler", koepfe)
        if status == 304 and self._letzter_stand is not None:
            return self._letzter_stand
        self._pruefe_status(status, daten)
        if not isinstance(daten, dict):
            raise AblagoError("Ablago hat keine lesbare Antwort geschickt", status=status)
        try:
            stand = Zaehlerstand.from_api(daten)
        except ValueError as fehler:
            raise AblagoError(f"Antwort von Ablago passt nicht: {fehler}", status=status) from None
        self._etag = antwort_koepfe.get("etag")
        self._letzter_stand = stand
        return stand

    async def gesundheit(self) -> Gesundheit:
        """Läuft Ablago, antwortet die Datenbank? Braucht keinen Schlüssel und verrät keine Version.

        Ein 503 mit Grund (etwa „datenbank“) ist eine Antwort, kein Fehler: Ablago läuft, ist aber gerade nicht bereit.
        Nur wenn Ablago gar nicht antwortet, kommt :class:`AblagoConnectionError`.
        """
        status, daten, _ = await self._anfrage("GET", "/api/gesundheit", {})
        if status in (200, 503) and isinstance(daten, dict):
            return Gesundheit.from_api(daten)
        self._pruefe_status(status, daten)
        raise AblagoError("Ablago hat keine lesbare Antwort geschickt", status=status)

    # ---------- intern ----------

    async def _anfrage(self, methode: str, pfad: str, koepfe: dict[str, str]) -> tuple[int, Any, dict[str, str]]:
        ssl_wahl: bool | ssl.SSLContext = True if self._verify_ssl else False
        try:
            async with self._sitzung().request(
                methode,
                self._basis + pfad,
                headers={"Accept": "application/json", **koepfe},
                ssl=ssl_wahl,
                timeout=self._timeout,
                allow_redirects=False,
            ) as antwort:
                daten: Any = None
                if antwort.status != 304 and antwort.content_type == "application/json":
                    try:
                        daten = await antwort.json()
                    except (aiohttp.ContentTypeError, ValueError):
                        daten = None
                # Kopfzeilen klein geschrieben: HTTP unterscheidet bei Namen nicht nach Groß- und Kleinschreibung.
                return antwort.status, daten, {k.lower(): v for k, v in antwort.headers.items()}
        except aiohttp.ClientConnectorCertificateError as fehler:
            raise AblagoSSLError(f"Zertifikat von {self._basis} passt nicht: {fehler.certificate_error}") from fehler
        except aiohttp.ClientSSLError as fehler:
            raise AblagoSSLError(f"Sichere Verbindung zu {self._basis} gescheitert") from fehler
        except TimeoutError as fehler:
            raise AblagoConnectionError(f"{self._basis} antwortet nicht rechtzeitig") from fehler
        except aiohttp.ClientError as fehler:
            raise AblagoConnectionError(f"{self._basis} ist nicht erreichbar") from fehler

    @staticmethod
    def _pruefe_status(status: int, daten: Any) -> None:
        if status < 400:
            if status >= 300:
                # Umleitungen folgt der Client bewusst nicht: Sonst ginge der Schlüssel an eine andere Adresse.
                raise AblagoError(f"Ablago leitet um (HTTP {status}) – bitte die Adresse prüfen", status=status)
            return
        text = daten.get("fehler") if isinstance(daten, dict) else None
        meldung = str(text) if text else f"HTTP {status}"
        if status in (401, 403):
            raise AblagoAuthError(meldung, status=status)
        if status >= 500:
            raise AblagoConnectionError(meldung, status=status)
        raise AblagoError(meldung, status=status)
