"""The Jahoo EL news HA integration."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import (
    DOMAIN, 
    CONF_URL, 
    CONF_SCAN_INTERVAL, 
    CONF_LIMIT, 
    CONF_ROTATE_INTERVAL,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_LIMIT,
    DEFAULT_ROTATE_INTERVAL
)
from .coordinator import RssCoordinator

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BUTTON]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Jahoo EL news HA from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    url = entry.data[CONF_URL]
    scan_interval = entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    limit = entry.data.get(CONF_LIMIT, DEFAULT_LIMIT)
    rotate_interval = entry.data.get(CONF_ROTATE_INTERVAL, DEFAULT_ROTATE_INTERVAL)

    coordinator = RssCoordinator(hass, url, scan_interval, limit, rotate_interval)
    
    # Fetch initial data
    await coordinator.async_config_entry_first_refresh()
    
    # Start the rotation
    coordinator.start_rotation()

    hass.data[DOMAIN][entry.entry_id] = coordinator
    
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        coordinator = hass.data[DOMAIN][entry.entry_id]
        coordinator.stop_rotation()
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
