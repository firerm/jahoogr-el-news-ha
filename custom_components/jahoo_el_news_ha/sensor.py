"""Support for Jahoo EL news HA RSS feed."""
from __future__ import annotations

import logging
import datetime
import feedparser
import voluptuous as vol

from homeassistant.components.sensor import (
    SensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.httpx_client import get_async_client

from .const import CONF_URL, CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Jahoo EL news HA sensor."""
    url = entry.data[CONF_URL]
    # Retrieve scan interval from config, fallback to default if missing
    scan_interval = entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    
    sensor = RssSensor(hass, url, "Jahoo EL news HA", scan_interval)
    async_add_entities([sensor], True)


class RssSensor(SensorEntity):
    """Representation of a RSS sensor."""

    def __init__(self, hass, url, name, scan_interval):
        """Initialize the sensor."""
        self._hass = hass
        self._url = url
        self._attr_name = name
        self._scan_interval = scan_interval
        self._attr_native_value = None
        self._attr_extra_state_attributes = {}
        self._attr_icon = "mdi:rss"
        self._feed_data = None
        self._unsubscribe = None
        
    async def async_added_to_hass(self):
        """Start updates when added to hass."""
        # Schedule update based on configured interval
        self._unsubscribe = async_track_time_interval(
            self._hass, self.update_data, datetime.timedelta(minutes=self._scan_interval)
        )
        # Fetch data immediately
        await self.update_data()

    async def async_will_remove_from_hass(self):
        """Clean up the listener."""
        if self._unsubscribe:
            self._unsubscribe()

    async def update_data(self, now=None):
        """Fetch new state data for the sensor."""
        client = get_async_client(self._hass)
        try:
            response = await client.get(self._url)
            response.raise_for_status()
            self._feed_data = feedparser.parse(response.text)
            self.async_schedule_update_ha_state(True)
        except Exception as err:
            _LOGGER.error("Error fetching RSS feed: %s", err)

    async def async_update(self) -> None:
        """Update the sensor."""
        if not self._feed_data or not self._feed_data.entries:
            return

        # Get the latest entry
        latest_entry = self._feed_data.entries[0]
        
        # Set State (Title)
        self._attr_native_value = latest_entry.get('title', 'Unknown')
        
        # Extract attributes
        self._attr_extra_state_attributes['description'] = latest_entry.get('summary', '')
        self._attr_extra_state_attributes['link'] = latest_entry.get('link', '')
        self._attr_extra_state_attributes['published'] = latest_entry.get('published', '')

        # Try to find an image
        image_url = None
        
        # 1. Check media_content
        if 'media_content' in latest_entry:
            media = latest_entry['media_content']
            if media and len(media) > 0:
                image_url = media[0].get('url')
        
        # 2. Check enclosures
        if not image_url and 'enclosures' in latest_entry:
            enclosures = latest_entry['enclosures']
            if enclosures and len(enclosures) > 0:
                image_url = enclosures[0].get('href')

        # 3. Check links (often standard for atom)
        if not image_url and 'links' in latest_entry:
             for link in latest_entry['links']:
                if 'image' in link.get('type', ''):
                    image_url = link.get('href')
                    break
        
        if image_url:
            self._attr_extra_state_attributes['image_url'] = image_url
            self._attr_entity_picture = image_url
