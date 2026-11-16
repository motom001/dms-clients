"""Fixtures for the Ablago tests."""

from __future__ import annotations

from collections.abc import Generator
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

from ablago import Gesundheit, Zaehlerstand
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.ablago.const import DOMAIN
from homeassistant.const import CONF_API_KEY, CONF_URL, CONF_VERIFY_SSL
from homeassistant.core import HomeAssistant

URL = "https://ablago.example.org"
API_KEY = "dms_zaehler_lena"
USER_INPUT = {CONF_URL: URL, CONF_API_KEY: API_KEY, CONF_VERIFY_SSL: True}

STAND = Zaehlerstand(
    neue_post=3,
    zu_erledigen=5,
    ueberfaellig=1,
    stand=42,
    geaendert=datetime(2026, 11, 16, 7, 30, tzinfo=UTC),
)
GESUND = Gesundheit(ok=True, zustand="laeuft", seit=None)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Load the integration from custom_components."""


@pytest.fixture
def mock_client() -> Generator[MagicMock]:
    """Replace the Ablago client everywhere the integration creates one."""
    with patch("custom_components.ablago.coordinator.AblagoClient", autospec=True) as client_class:
        client = client_class.return_value
        client.adresse = URL
        client.zaehler = AsyncMock(return_value=STAND)
        client.gesundheit = AsyncMock(return_value=GESUND)
        yield client


@pytest.fixture
def mock_config_entry() -> MockConfigEntry:
    """A config entry for Lena."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="ablago.example.org",
        data=USER_INPUT,
        entry_id="01KABLAGOLENA0000000000000",
    )


@pytest.fixture
async def init_integration(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry, mock_client: MagicMock
) -> MockConfigEntry:
    """Set up the integration."""
    mock_config_entry.add_to_hass(hass)
    await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    return mock_config_entry
