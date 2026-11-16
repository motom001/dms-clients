"""Tests for the Ablago diagnostics."""

from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.components.diagnostics import get_diagnostics_for_config_entry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from homeassistant.core import HomeAssistant


async def test_diagnostics(
    hass: HomeAssistant, hass_client: ClientSessionGenerator, init_integration: MockConfigEntry
) -> None:
    """Address and key are redacted; the counters are included."""
    result = await get_diagnostics_for_config_entry(hass, hass_client, init_integration)
    assert result == {
        "entry": {"url": "**REDACTED**", "api_key": "**REDACTED**", "verify_ssl": True},
        "counters": {
            "neue_post": 3,
            "zu_erledigen": 5,
            "ueberfaellig": 1,
            "stand": 42,
            "geaendert": "2026-11-16T07:30:00+00:00",
        },
        "health": {"ok": True, "zustand": "laeuft", "seit": None},
    }
