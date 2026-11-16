"""Tests for setting up and unloading the Ablago integration."""

from __future__ import annotations

from unittest.mock import MagicMock

from ablago import AblagoAuthError, AblagoConnectionError, AblagoError, AblagoSSLError
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.ablago.const import DOMAIN
from homeassistant.config_entries import SOURCE_REAUTH, ConfigEntryState
from homeassistant.core import HomeAssistant


async def test_setup_and_unload(hass: HomeAssistant, init_integration: MockConfigEntry) -> None:
    """The entry loads and unloads."""
    assert init_integration.state is ConfigEntryState.LOADED
    assert await hass.config_entries.async_unload(init_integration.entry_id)
    await hass.async_block_till_done()
    assert init_integration.state is ConfigEntryState.NOT_LOADED


@pytest.mark.parametrize(
    "side_effect",
    [AblagoConnectionError("weg"), AblagoSSLError("Zertifikat"), AblagoError("HTTP 404", status=404)],
)
async def test_setup_retry(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry, mock_client: MagicMock, side_effect: Exception
) -> None:
    """Home Assistant tries again later while Ablago is not reachable."""
    mock_client.zaehler.side_effect = side_effect
    mock_config_entry.add_to_hass(hass)
    await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.SETUP_RETRY


async def test_setup_auth_failed(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry, mock_client: MagicMock
) -> None:
    """A rejected key starts the reauth flow instead of retrying."""
    mock_client.zaehler.side_effect = AblagoAuthError("401", status=401)
    mock_config_entry.add_to_hass(hass)
    await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.SETUP_ERROR

    flows = hass.config_entries.flow.async_progress()
    assert len(flows) == 1
    assert flows[0]["handler"] == DOMAIN
    assert flows[0]["context"]["source"] == SOURCE_REAUTH
    assert flows[0]["context"]["entry_id"] == mock_config_entry.entry_id
