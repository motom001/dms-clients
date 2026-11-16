"""Checks of the integration's files that hassfest does not do for custom integrations."""

from __future__ import annotations

import json
from pathlib import Path

ORDNER = Path(__file__).parents[1] / "custom_components" / "ablago"


def _schluessel(daten: object, pfad: str = "") -> set[str]:
    if isinstance(daten, dict):
        return set().union(*(_schluessel(v, f"{pfad}/{k}") for k, v in daten.items())) | {pfad}
    return {pfad}


def test_translations_match_strings() -> None:
    """strings.json is the English source; en.json is a copy, de.json has the same keys."""
    strings = json.loads((ORDNER / "strings.json").read_text(encoding="utf-8"))
    englisch = json.loads((ORDNER / "translations" / "en.json").read_text(encoding="utf-8"))
    deutsch = json.loads((ORDNER / "translations" / "de.json").read_text(encoding="utf-8"))
    assert englisch == strings
    assert _schluessel(deutsch) == _schluessel(strings)


def test_requirement_matches_tests() -> None:
    """The version of ablago in the manifest is the one the tests run with."""
    manifest = json.loads((ORDNER / "manifest.json").read_text(encoding="utf-8"))
    anforderungen = (Path(__file__).parents[1] / "anforderungen-test.txt").read_text(encoding="utf-8")
    gepinnt = [z.strip() for z in anforderungen.splitlines() if z.startswith("ablago==")]
    assert manifest["requirements"] == gepinnt


def test_version_matches_release() -> None:
    """The release tag homeassistant-v<VERSION> and the manifest name the same version."""
    manifest = json.loads((ORDNER / "manifest.json").read_text(encoding="utf-8"))
    version = (Path(__file__).parents[1] / "VERSION").read_text(encoding="utf-8").strip()
    assert manifest["version"] == version
