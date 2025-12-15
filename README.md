# Jahoo.gr Greek News ( or your language ) for Home Assistant 🇬🇷

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![maintainer](https://img.shields.io/badge/maintainer-firerm-green.svg)]()

A lightweight and efficient Home Assistant integration that fetches the latest news headlines from **Yahoo.gr** via RSS feed. It displays news in a sleek, rotating card format directly on your dashboard, keeping you updated with what's happening in Greece and the world.

## ✨ Key Features

* **📰 Live RSS Feed:** Automatically fetches the latest news from Yahoo.gr.
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
4.  Paste the following URL into the **Repository** field:
    ```text
    [https://github.com/firerm/jahoogr-el-news-ha/](https://github.com/firerm/jahoogr-el-news-ha/)
    ```
5.  In the **Category** dropdown, select **Integration**.
6.  Click **Add**.
7.  Once added, close the modal and find the new integration in the list. Click **Download**.
8.  **Restart Home Assistant** to apply the changes.

---

## ⚙️ Configuration

After installation, you can configure the integration directly via the Home Assistant UI:

1.  Go to **Settings** > **Devices & Services**.
2.  Click **Add Integration** and search for **Yahoo.gr Greek News**.
3.  Follow the on-screen instructions to set your preferences:
    * **Rotation Interval:** (e.g., 10 seconds)
    * **Feed Refresh Rate:** (e.g., 30 minutes)
    * **Max Cards:** Number of news items to rotate.

---

## 🖼️ Dashboard Setup

To display the news on your dashboard, simply add the custom card provided by the integration.

```yaml
type: custom:jahoogr-news-card
entity: sensor.jahoogr_news  # Example entity ID
