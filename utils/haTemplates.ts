import { IntegrationConfig, GeneratedFile } from '../types';
import { translations, Language } from './translations';

export const generateFiles = (
  config: IntegrationConfig, 
  lang: Language = 'en',
  githubInfo?: { user: string; repo: string }
): GeneratedFile[] => {
  const { name, domain, rssUrl, scanInterval } = config;
  const t = translations[lang].files;

  const docUrl = githubInfo 
    ? `https://github.com/${githubInfo.user}/${githubInfo.repo}`
    : "https://github.com/generic/readme";
    
  const issueUrl = githubInfo 
    ? `https://github.com/${githubInfo.user}/${githubInfo.repo}/issues`
    : "https://github.com/generic/issues";

  // 1. manifest.json
  const manifest = {
    domain: domain,
    name: name,
    codeowners: githubInfo ? [`@${githubInfo.user}`] : [],
    config_flow: true,
    dependencies: [],
    documentation: docUrl,
    iot_class: "cloud_polling",
    issue_tracker: issueUrl,
    requirements: ["feedparser>=6.0.0"],
    version: "1.0.0"
  };

  // 2. const.py
  const constPy = `"""Constants for the ${name} integration."""

DOMAIN = "${domain}"
CONF_URL = "url"
CONF_SCAN_INTERVAL = "scan_interval"
DEFAULT_SCAN_INTERVAL = ${scanInterval}
`;

  // 3. __init__.py
  const initPy = `"""The ${name} integration."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN

PLATFORMS: list[Platform] = [Platform.SENSOR]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ${name} from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        pass

    return unload_ok
`;

  // 4. config_flow.py
  const configFlowPy = `"""Config flow for ${name} integration."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN, CONF_URL, CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL, default="${rssUrl}"): str,
        vol.Optional(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): int,
    }
)

class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for ${name}."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if user_input is None:
            return self.async_show_form(
                step_id="user", data_schema=STEP_USER_DATA_SCHEMA
            )

        return self.async_create_entry(title="${name}", data=user_input)
`;

  // 5. sensor.py
  const sensorPy = `"""Support for ${name} RSS feed."""
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
    """Set up the ${name} sensor."""
    url = entry.data[CONF_URL]
    # Retrieve scan interval from config, fallback to default if missing
    scan_interval = entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    
    sensor = RssSensor(hass, url, "${name}", scan_interval)
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
`;

    // 6. Lovelace Card example
    const lovelaceYaml = `type: markdown
content: >-
  ## {{ states('sensor.${domain}_sensor') }}

  <img src="{{ state_attr('sensor.${domain}_sensor', 'image_url') }}" width="100%"/>

  {{ state_attr('sensor.${domain}_sensor', 'description') }}

  [Read More]({{ state_attr('sensor.${domain}_sensor', 'link') }})
`;

    // 7. hacs.json (Important for HACS)
    const hacsJson = {
      name: name,
      render_readme: true,
      content_in_root: false, // Standard structure: files are in custom_components/domain/
      zip_release: false
    };

  return [
    { filename: 'manifest.json', content: JSON.stringify(manifest, null, 2), language: 'json', description: t.manifest },
    { filename: '__init__.py', content: initPy, language: 'python', description: t.init },
    { filename: 'const.py', content: constPy, language: 'python', description: t.const },
    { filename: 'config_flow.py', content: configFlowPy, language: 'python', description: t.config },
    { filename: 'sensor.py', content: sensorPy, language: 'python', description: t.sensor },
    { filename: 'hacs.json', content: JSON.stringify(hacsJson, null, 2), language: 'json', description: t.hacs },
    { filename: 'lovelace_card.yaml', content: lovelaceYaml, language: 'yaml', description: t.lovelace },
  ];
};