"""Tests for the Ablago sensors and binary sensors."""

from __future__ import annotations

from dataclasses import replace
from unittest.mock import MagicMock

from ablago import AblagoAuthError, AblagoConnectionError, Gesundheit
from freezegun.api import FrozenDateTimeFactory
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.ablago.const import DOMAIN, UPDATE_INTERVAL_COUNTERS
from homeassistant.config_entries import SOURCE_REAUTH
from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .conftest import STAND, URL

ENTITIES = {
    "sensor.ablago_example_org_new_mail": "3",
    "sensor.ablago_example_org_to_do": "5",
    "sensor.ablago_example_org_overdue": "1",
    "sensor.ablago_example_org_last_change": "2026-11-16T07:30:00+00:00",
    "binary_sensor.ablago_example_org_new_mail_waiting": STATE_ON,
    "binary_sensor.ablago_example_org_connectivity": STATE_ON,
}


async def _tick(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    freezer.tick(UPDATE_INTERVAL_COUNTERS)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


@pytest.mark.usefixtures("init_integration")
async def test_entities(
    hass: HomeAssistant, entity_registry: er.EntityRegistry, device_registry: dr.DeviceRegistry
) -> None:
    """All entities exist, belong to one device and show the counters."""
    for entity_id, state in ENTITIES.items():
        assert (current := hass.states.get(entity_id)) is not None, entity_id
        assert current.state == state, entity_id
        assert entity_registry.async_get(entity_id) is not None

    connectivity = entity_registry.async_get("binary_sensor.ablago_example_org_connectivity")
    assert connectivity is not None
    assert connectivity.entity_category == er.EntityCategory.DIAGNOSTIC

    entry_id = "01KABLAGOLENA0000000000000"
    device = device_registry.async_get_device_by_identifier((DOMAIN, entry_id), entry_id)
    assert device is not None
    assert device.name == "ablago.example.org"
    assert device.manufacturer == "Ablago"
    assert device.configuration_url == URL
    assert device.entry_type is dr.DeviceEntryType.SERVICE
    assert device.sw_version is None
    assert len(er.async_entries_for_device(entity_registry, device.id)) == len(ENTITIES)


@pytest.mark.usefixtures("init_integration")
async def test_update(hass: HomeAssistant, mock_client: MagicMock, freezer: FrozenDateTimeFactory) -> None:
    """New counters show up after the next poll, and the binary sensor follows new mail."""
    mock_client.zaehler.return_value = replace(STAND, neue_post=0, stand=43)
    await _tick(hass, freezer)
    assert hass.states.get("sensor.ablago_example_org_new_mail").state == "0"
    assert hass.states.get("binary_sensor.ablago_example_org_new_mail_waiting").state == STATE_OFF


@pytest.mark.usefixtures("init_integration")
async def test_unreachable(hass: HomeAssistant, mock_client: MagicMock, freezer: FrozenDateTimeFactory) -> None:
    """Counters become unavailable while Ablago is unreachable; connectivity says so instead."""
    mock_client.zaehler.side_effect = AblagoConnectionError("weg")
    mock_client.gesundheit.side_effect = AblagoConnectionError("weg")
    await _tick(hass, freezer)
    assert hass.states.get("sensor.ablago_example_org_new_mail").state == STATE_UNAVAILABLE
    assert hass.states.get("binary_sensor.ablago_example_org_new_mail_waiting").state == STATE_UNAVAILABLE
    assert hass.states.get("binary_sensor.ablago_example_org_connectivity").state == STATE_OFF

    mock_client.zaehler.side_effect = None
    mock_client.gesundheit.side_effect = None
    await _tick(hass, freezer)
    assert hass.states.get("sensor.ablago_example_org_new_mail").state == "3"
    assert hass.states.get("binary_sensor.ablago_example_org_connectivity").state == STATE_ON


@pytest.mark.usefixtures("init_integration")
async def test_not_ready(hass: HomeAssistant, mock_client: MagicMock, freezer: FrozenDateTimeFactory) -> None:
    """Ablago runs but its database does not answer: disconnected."""
    mock_client.gesundheit.return_value = Gesundheit(ok=False, zustand="datenbank", seit=None)
    await _tick(hass, freezer)
    assert hass.states.get("binary_sensor.ablago_example_org_connectivity").state == STATE_OFF


async def test_key_revoked(
    hass: HomeAssistant,
    init_integration: MockConfigEntry,
    mock_client: MagicMock,
    freezer: FrozenDateTimeFactory,
) -> None:
    """A key revoked while running starts the reauth flow."""
    mock_client.zaehler.side_effect = AblagoAuthError("401", status=401)
    await _tick(hass, freezer)
    assert hass.states.get("sensor.ablago_example_org_new_mail").state == STATE_UNAVAILABLE
    flows = hass.config_entries.flow.async_progress()
    assert [f["context"]["source"] for f in flows] == [SOURCE_REAUTH]
    assert flows[0]["context"]["entry_id"] == init_integration.entry_id
