"""Base entity for the Ablago integration."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import EntityDescription
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import AblagoCounterCoordinator, AblagoHealthCoordinator


class AblagoEntity[CoordinatorT: AblagoCounterCoordinator | AblagoHealthCoordinator](CoordinatorEntity[CoordinatorT]):
    """One device per config entry, that is per person and Ablago."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: CoordinatorT, description: EntityDescription) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        entry = coordinator.config_entry
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        # Ablago does not tell a key of the level "counters only" its version or owner (motom001/dms#1067),
        # so the device has neither; it is named after the config entry, which users rename per person.
        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, entry.entry_id)},
            manufacturer="Ablago",
            name=entry.title,
            configuration_url=coordinator.client.adresse,
        )
