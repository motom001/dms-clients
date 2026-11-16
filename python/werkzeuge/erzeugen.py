#!/usr/bin/env python3
"""Erzeugt den Teil `ablago.api` aus der API-Beschreibung von Ablago.

    python werkzeuge/erzeugen.py                 # aus openapi/openapi.json (im Repository)
    python werkzeuge/erzeugen.py pfad/zur.json   # aus einer anderen Beschreibung

Schreibt nach src/ablago/api/. Der Ordner steht nicht im Repository: Er entsteht vor jedem Test und jedem Bau neu,
damit niemand von Hand daran ändert. Gebraucht wird openapi-python-client in der Fassung aus
werkzeuge/anforderungen-erzeugen.txt.

Vor dem Erzeugen werden bekannte Fehler der Beschreibung behoben (siehe `bereinigen`) – jeder mit Grund. Fällt ein
Fehler in Ablago weg, wird die Bereinigung einfach wirkungslos.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ORDNER = Path(__file__).resolve().parent.parent
QUELLE = ORDNER / "openapi" / "openapi.json"
ZIEL = ORDNER / "src" / "ablago" / "api"
EINSTELLUNGEN = ORDNER / "werkzeuge" / "erzeugen.yaml"
KOPF = '"""Erzeugt aus der API-Beschreibung von Ablago {version} – nicht von Hand ändern (werkzeuge/erzeugen.py)."""\n'


def bereinigen(beschreibung: dict) -> list[str]:
    """Behebt bekannte Fehler der Beschreibung, damit jede Route entsteht. Gibt aus, was geändert wurde."""
    geaendert = []
    for pfad, methoden in beschreibung.get("paths", {}).items():
        for methode, op in methoden.items():
            if not isinstance(op, dict):
                continue
            for p in op.get("parameters", []):
                # Pfad-Parameter sind nach OpenAPI immer Pflicht. Ablago 0.290 kennzeichnet `feld` in
                # GET /mappen/{id}/tabelle/{feld} nicht so; der Generator ließe die Route sonst weg.
                if p.get("in") == "path" and p.get("required") is not True:
                    p["required"] = True
                    geaendert.append(f"{methode.upper()} {pfad}: Pfad-Parameter {p.get('name')} als Pflicht")
    return geaendert


def main() -> int:
    quelle = Path(sys.argv[1]) if len(sys.argv) > 1 else QUELLE
    beschreibung = json.loads(quelle.read_text(encoding="utf-8"))
    for zeile in bereinigen(beschreibung):
        print(f"Bereinigt: {zeile}")
    version_datei = quelle.parent / "ABLAGO_VERSION"
    ablago = version_datei.read_text(encoding="utf-8").strip() if version_datei.exists() else "unbekannt"

    with tempfile.TemporaryDirectory() as tmp:
        tmp_pfad = Path(tmp)
        (tmp_pfad / "openapi.json").write_text(json.dumps(beschreibung), encoding="utf-8")
        ausgabe = tmp_pfad / "ausgabe"
        lauf = subprocess.run(
            [
                "openapi-python-client",
                "generate",
                "--path",
                str(tmp_pfad / "openapi.json"),
                "--output-path",
                str(ausgabe),
                "--config",
                str(EINSTELLUNGEN),
                "--overwrite",
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        print(lauf.stdout, end="")
        print(lauf.stderr, end="", file=sys.stderr)
        # Warnungen heißen hier: Eine Route oder ein Objekt fehlt im Ergebnis. Das soll auffallen, nicht still fehlen.
        if lauf.returncode != 0 or "WARNING" in lauf.stdout + lauf.stderr:
            print("::error::Erzeugen mit Fehlern oder Warnungen – siehe oben", file=sys.stderr)
            return 1
        paket = ausgabe / "api"
        if not (paket / "__init__.py").exists():
            print(f"::error::Erzeugtes Paket fehlt unter {paket}", file=sys.stderr)
            return 1
        if ZIEL.exists():
            shutil.rmtree(ZIEL)
        shutil.copytree(paket, ZIEL)

    init = ZIEL / "__init__.py"
    rest = init.read_text(encoding="utf-8").split('"""', 2)[-1]
    init.write_text(KOPF.format(version=ablago) + rest, encoding="utf-8")
    dateien = sum(1 for _ in ZIEL.rglob("*.py"))
    print(f"ablago.api aus Ablago {ablago} erzeugt: {dateien} Dateien")
    return 0


if __name__ == "__main__":
    sys.exit(main())
