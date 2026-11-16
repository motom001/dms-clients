"""Einfache Datenklassen für die Antworten der Handschicht.

Unbekannte Felder in Antworten werden übergangen: Ablago darf neue Felder hinzufügen, ohne dass ältere Fassungen
dieses Clients scheitern (Grundsatz für alle Clients, siehe CONTRIBUTING.md).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


def _ganzzahl(daten: dict[str, Any], schluessel: str) -> int:
    wert: Any = daten.get(schluessel, 0)
    # bool ist in Python eine Unterklasse von int – das wäre hier eine kaputte Antwort.
    if isinstance(wert, bool) or not isinstance(wert, int) or wert < 0:
        raise ValueError(f"Feld {schluessel!r} ist keine Zahl ab 0: {wert!r}")
    return int(wert)


def _zeitpunkt(text: Any) -> datetime | None:
    if not isinstance(text, str) or not text:
        return None
    try:
        # Ablago schickt UTC mit „Z“; so liest es auch jede Python-Version sicher als UTC.
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None


@dataclass(frozen=True, slots=True)
class Zaehlerstand:
    """Zahlen einer Person, wie sie `GET /api/v1/ich/zaehler` liefert."""

    #: Post im Stand „Neu“ für diese Person oder ohne Empfänger.
    neue_post: int
    #: Mappen unter „Zu erledigen“.
    zu_erledigen: int
    #: Offene Fristen, Erinnerungen und Aufgaben mit Datum vor heute.
    ueberfaellig: int
    #: Zählt hoch, sobald sich eine Zahl ändert.
    stand: int
    #: Wann sich die Zahlen zuletzt geändert haben.
    geaendert: datetime | None

    @classmethod
    def from_api(cls, daten: dict[str, Any]) -> Zaehlerstand:
        return cls(
            neue_post=_ganzzahl(daten, "neuePost"),
            zu_erledigen=_ganzzahl(daten, "zuErledigen"),
            ueberfaellig=_ganzzahl(daten, "ueberfaellig"),
            stand=_ganzzahl(daten, "stand"),
            geaendert=_zeitpunkt(daten.get("geaendert")),
        )


@dataclass(frozen=True, slots=True)
class Gesundheit:
    """Zustand von Ablago, wie ihn `GET /api/gesundheit` liefert – ohne Anmeldung, ohne Version."""

    #: True, wenn Ablago läuft und die Datenbank antwortet.
    ok: bool
    #: „laeuft“ oder der Grund, z. B. „datenbank“.
    zustand: str
    #: Seit wann der Zustand besteht, wenn Ablago es meldet.
    seit: datetime | None

    @classmethod
    def from_api(cls, daten: dict[str, Any]) -> Gesundheit:
        return cls(
            ok=daten.get("ok") is True,
            zustand=str(daten.get("zustand") or ("laeuft" if daten.get("ok") is True else "unbekannt")),
            seit=_zeitpunkt(daten.get("seit")),
        )
