"""Support for Jahoo EL news HA navigation buttons."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers.entity import DeviceInfo

from .const import DOMAIN
from .coordinator import RssCoordinator

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Jahoo EL news HA buttons."""
    coordinator: RssCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        RssNavButton(coordinator, entry, "Next", "mdi:arrow-right", "next"),
        RssNavButton(coordinator, entry, "Previous", "mdi:arrow-left", "prev"),
    ], True)


class RssNavButton(CoordinatorEntity, ButtonEntity):
    """Button to navigate RSS items."""
    
    _attr_has_entity_name = True

    def __init__(self, coordinator: RssCoordinator, entry: ConfigEntry, name: str, icon: str, action: str):
        """Initialize the button."""
        super().__init__(coordinator)
        self._action = action
        self._attr_unique_id = f"{entry.entry_id}_btn_{action}"
        self._attr_name = name
        self._attr_icon = icon
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Jahoo HA Generator",
            model="Rotating RSS Reader",
        )

    async def async_press(self) -> None:
        """Handle the button press."""
        if self._action == "next":
            self.coordinator.next_article()
        else:
            self.coordinator.prev_article()
