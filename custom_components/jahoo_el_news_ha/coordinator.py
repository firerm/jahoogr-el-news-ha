"""DataUpdateCoordinator for Jahoo EL news HA."""
from __future__ import annotations

import logging
import datetime
import feedparser
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.httpx_client import get_async_client

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

class RssCoordinator(DataUpdateCoordinator):
    """Class to manage fetching RSS data and rotating the view."""

    def __init__(
        self, 
        hass: HomeAssistant, 
        url: str, 
        scan_interval: int, 
        limit: int, 
        rotate_interval: int
    ) -> None:
        """Initialize."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=datetime.timedelta(minutes=scan_interval),
        )
        self.url = url
        self.limit = limit
        self.rotate_interval = rotate_interval
        
        self.feed_entries: list[dict[str, Any]] = []
        self.current_index = 0
        self._unsubscribe_rotate = None

    async def _async_update_data(self):
        """Fetch data from RSS."""
        client = get_async_client(self.hass)
        try:
            response = await client.get(self.url)
            response.raise_for_status()
            parsed = feedparser.parse(response.text)
            
            if parsed.entries:
                self.feed_entries = parsed.entries[:self.limit]
                _LOGGER.debug(f"Fetched {len(self.feed_entries)} articles.")
                # Reset index if out of bounds or empty
                if self.current_index >= len(self.feed_entries):
                    self.current_index = 0
                return self.get_current_article()
            else:
                _LOGGER.warning("RSS feed parsed but no entries found")
                return None

        except Exception as err:
            raise UpdateFailed(f"Error fetching RSS: {err}")

    def get_current_article(self):
        """Return the current article based on index."""
        if not self.feed_entries:
            return None
        return self.feed_entries[self.current_index]

    @callback
    def start_rotation(self):
        """Start the rotation timer."""
        if self._unsubscribe_rotate:
            self._unsubscribe_rotate()
        
        self._unsubscribe_rotate = async_track_time_interval(
            self.hass, self._auto_rotate, datetime.timedelta(seconds=self.rotate_interval)
        )

    @callback
    def stop_rotation(self):
        """Stop the rotation timer."""
        if self._unsubscribe_rotate:
            self._unsubscribe_rotate()
            self._unsubscribe_rotate = None

    @callback
    def _auto_rotate(self, _now=None):
        """Rotate to next article automatically."""
        self.next_article(auto=True)

    def next_article(self, auto=False):
        """Go to next article."""
        if not self.feed_entries:
            return

        self.current_index = (self.current_index + 1) % len(self.feed_entries)
        
        # If manually triggered, reset the timer to avoid immediate double jump
        if not auto:
            self.start_rotation()
            
        self.async_set_updated_data(self.get_current_article())

    def prev_article(self):
        """Go to previous article."""
        if not self.feed_entries:
            return

        self.current_index = (self.current_index - 1) % len(self.feed_entries)
        # Handle negative wrap-around
        if self.current_index < 0:
            self.current_index = len(self.feed_entries) - 1

        self.start_rotation()
        self.async_set_updated_data(self.get_current_article())
