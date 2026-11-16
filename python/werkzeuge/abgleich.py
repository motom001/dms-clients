#!/usr/bin/env python3
"""Vergleicht zwei API-Beschreibungen von Ablago und schreibt eine kurze Zusammenfassung in Markdown.

    python werkzeuge/abgleich.py alt.json neu.json

Für den Changelog und den Text des Pull Requests im Workflow „Python: API abgleichen“. Ob eine Änderung etwas
kaputt macht, entscheidet dort oasdiff; hier geht es nur darum, lesbar aufzuzählen, was dazukam und was wegfiel.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def routen(beschreibung: dict) -> dict[str, str]:
    """operationId → „GET /pfad: Zusammenfassung“."""
    ergebnis = {}
    for pfad, methoden in beschreibung.get("paths", {}).items():
        for methode, op in methoden.items():
            if isinstance(op, dict) and op.get("operationId"):
                ergebnis[op["operationId"]] = f"`{methode.upper()} {pfad}` – {op.get('summary', '').strip()}"
    return ergebnis


def objekte(beschreibung: dict) -> dict[str, set[str]]:
    """Schema → Felder."""
    return {
        name: set((schema.get("properties") or {}).keys())
        for name, schema in beschreibung.get("components", {}).get("schemas", {}).items()
    }


def zusammenfassung(alt: dict, neu: dict) -> str:
    r_alt, r_neu = routen(alt), routen(neu)
    o_alt, o_neu = objekte(alt), objekte(neu)
    zeilen: list[str] = []

    def abschnitt(titel: str, eintraege: list[str]) -> None:
        if eintraege:
            zeilen.append(f"**{titel}**")
            zeilen.extend(f"- {e}" for e in eintraege)
            zeilen.append("")

    abschnitt("Neue Routen", [r_neu[k] for k in sorted(r_neu.keys() - r_alt.keys())])
    abschnitt("Weggefallene Routen", [r_alt[k] for k in sorted(r_alt.keys() - r_neu.keys())])
    abschnitt("Neue Objekte", [f"`{k}`" for k in sorted(o_neu.keys() - o_alt.keys())])
    abschnitt("Weggefallene Objekte", [f"`{k}`" for k in sorted(o_alt.keys() - o_neu.keys())])
    felder_neu, felder_weg = [], []
    for name in sorted(o_alt.keys() & o_neu.keys()):
        dazu, weg = sorted(o_neu[name] - o_alt[name]), sorted(o_alt[name] - o_neu[name])
        if dazu:
            felder_neu.append(f"`{name}`: " + ", ".join(f"`{f}`" for f in dazu))
        if weg:
            felder_weg.append(f"`{name}`: " + ", ".join(f"`{f}`" for f in weg))
    abschnitt("Neue Felder", felder_neu)
    abschnitt("Weggefallene Felder", felder_weg)
    if not zeilen:
        zeilen.append(
            "Nur Beschreibungen, Beispiele oder Einzelheiten geändert – "
            "keine neuen oder weggefallenen Routen, Objekte oder Felder."
        )
    return "\n".join(zeilen).rstrip() + "\n"


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2
    alt, neu = (json.loads(Path(p).read_text(encoding="utf-8")) for p in sys.argv[1:])
    print(zusammenfassung(alt, neu), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main())
