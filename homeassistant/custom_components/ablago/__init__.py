"""The Ablago integration: counters of one person in a self-hosted Ablago."""

from __future__ import annotations

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .coordinator import (
    AblagoConfigEntry,
    AblagoCounterCoordinator,
    AblagoData,
    AblagoHealthCoordinator,
    create_client,
)

PLATFORMS: list[Platform] = [Platform.BINARY_SENSOR, Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: AblagoConfigEntry) -> bool:
    """Set up Ablago from a config entry."""
    client = create_client(hass, dict(entry.data))

    counters = AblagoCounterCoordinator(hass, entry, client)
    health = AblagoHealthCoordinator(hass, entry, client)

    # Raises ConfigEntryNotReady when Ablago is unreachable and starts reauth when the key is rejected.
    await counters.async_config_entry_first_refresh()
    await health.async_config_entry_first_refresh()

    entry.runtime_data = AblagoData(counters=counters, health=health)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: AblagoConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
