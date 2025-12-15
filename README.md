# Jahoo.gr Greek News ( or your language ) for Home Assistant 🇬🇷

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![maintainer](https://img.shields.io/badge/maintainer-firerm-green.svg)]()

A lightweight and efficient Home Assistant integration that fetches the latest news headlines from **Every Site** has RSS feed. It displays news in a sleek, rotating card format directly on your dashboard, keeping you updated with what's happening in Greece( you can change that) and all over the world.

## ✨ Key Features

* **📰 Live RSS Feed:** Automatically fetches the latest news from Every Site. ( default every 15 minutes)
* **🔄 Auto-Rotation:** News cards rotate automatically based on your preferred interval.
* **🎛️ Fully Customizable:**
    * Set the **rotation speed** (in seconds).
    * Choose the **number of headlines** to display in the loop.
    * Define the **feed refresh interval** (how often to check for new stories).
* **navigation:** Built-in **Next** and **Previous** buttons for manual browsing.
* **🚀 Lightweight & Fast:** Optimized performance with minimal resource usage.
* **📱 Dashboard Ready:** Easy to add to any Lovelace view.

---

## 📥 Installation via HACS

This integration is available via **HACS** (Home Assistant Community Store) as a custom repository.

1.  Open your Home Assistant instance and navigate to **HACS**.
2.  Click on **Integrations**.
3.  In the top right corner, click the three dots (**⋮**) and select **Custom repositories**.
4.  Paste the following URL into the HACS **Repository** field:
    ```text
    https://github.com/firerm/jahoogr-el-news-ha
    ```
5.  In the **Category** dropdown, select **Integration**.
6.  Click **Add**.
7.  Once added, close the modal and find the new integration in the list. Click **Download**.
8.  **Restart Home Assistant** to apply the changes.

---

## ⚙️ Configuration

After installation, you can configure the integration directly via the Home Assistant UI:

1.  Go to **Settings** > **Devices & Services**.
2.  Click **Add Integration** and search for **Jahoo EL news HA**.
3.  Follow the on-screen instructions to set your preferences:
    * **Rotation Interval:** (e.g., 10 seconds) ++++ removed!++++
    * **Feed Refresh Rate:** (e.g., 30 minutes)
    * **Max Cards:** Number of news items to rotate.

---

## 🖼️ Dashboard Setup

To display the news on your dashboard, simply add the custom card provided by the integration.
That's it ! enjoy!

```yaml
type: vertical-stack
cards:
  - type: markdown
    content: >
      {% if state_attr('sensor.jahoo_el_news_ha_rss', 'image_url') %}
      <a href="{{ state_attr('sensor.jahoo_el_news_ha_rss', 'link') }}" target="_blank"><img src="{{ state_attr('sensor.jahoo_el_news_ha_rss', 'image_url') }}" width="100%"/></a>
      {% endif %}

      <h3><a href="{{ state_attr('sensor.jahoo_el_news_ha_rss', 'link') }}" target="_blank" style="text-decoration: none; color: inherit;">{{ states('sensor.jahoo_el_news_ha_rss') }}</a></h3>

      {{ state_attr('sensor.jahoo_el_news_ha_rss', 'description') }}

      <small>News {{ state_attr('sensor.jahoo_el_news_ha_rss', 'article_index') }} / {{ state_attr('sensor.jahoo_el_news_ha_rss', 'total_articles') }}</small>
  - type: horizontal-stack
    cards:
      - type: button
        entity: button.jahoo_el_news_ha_previous
        icon: mdi:arrow-left
        show_name: false
        icon_height: 30px
        tap_action:
          action: call-service
          service: button.press
          target:
            entity_id: button.jahoo_el_news_ha_previous
      - type: button
        entity: button.jahoo_el_news_ha_next
        icon: mdi:arrow-right
        show_name: false
        icon_height: 30px
        tap_action:
          action: call-service
          service: button.press
          target:
            entity_id: button.jahoo_el_news_ha_next
```
<div align="center">

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![GitHub stars](https://img.shields.io/github/stars/firerm/jahoogr-el-news-ha?style=for-the-badge)](https://github.com/firerm/jahoogr-el-news-ha/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/firerm/jahoogr-el-news-ha?style=for-the-badge)](https://github.com/firerm/jahoogr-el-news-ha/issues)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/firerm/jahoogr-el-news-ha/graphs/commit-activity)

</div>

---
<div align="center">
  <p>Created by <b>Tassos S. Manolis</b> | Powered by <a href="https://jahoo.gr" target="_blank"><b>jahoo.gr</b></a></p>
</div>
