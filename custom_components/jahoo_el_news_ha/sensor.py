"""Support for Jahoo EL news HA RSS feed."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
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
    """Set up the Jahoo EL news HA sensor."""
    coordinator: RssCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([RssSensor(coordinator, entry)], True)


class RssSensor(CoordinatorEntity, SensorEntity):
    """Representation of a RSS sensor that rotates through articles."""
    
    _attr_has_entity_name = True
    _attr_icon = "mdi:rss"

    def __init__(self, coordinator: RssCoordinator, entry: ConfigEntry):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_rss"
        self._attr_name = "RSS"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Jahoo HA Generator",
            model="Rotating RSS Reader",
        )

    @property
    def native_value(self) -> str:
        """Return the state of the sensor (title of article)."""
        entry = self.coordinator.data
        if not entry:
            return "No Data"
        return entry.get('title', 'Unknown')[:255]

    @property
    def extra_state_attributes(self) -> dict:
        """Return specific attributes for the current article."""
        entry = self.coordinator.data
        if not entry:
            return {}

        attrs = {
            'full_title': entry.get('title', ''),
            'description': entry.get('summary', ''),
            'link': entry.get('link', ''),
            'published': entry.get('published', ''),
            'article_index': self.coordinator.current_index + 1,
            'total_articles': len(self.coordinator.feed_entries),
        }

        # Find Image
        image_url = None
        if 'media_content' in entry and entry['media_content']:
            image_url = entry['media_content'][0].get('url')
        elif 'enclosures' in entry and entry['enclosures']:
            image_url = entry['enclosures'][0].get('href')
        elif 'links' in entry:
             for link in entry['links']:
                if 'image' in link.get('type', ''):
                    image_url = link.get('href')
                    break
        
        attrs['image_url'] = image_url
        return attrs

    @property
    def entity_picture(self) -> str | None:
        """Return the image of the current article as the entity picture."""
        return self.extra_state_attributes.get('image_url')
