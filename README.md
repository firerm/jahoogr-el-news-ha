Οδηγίες Εγκατάστασης
1 Βρείτε τον φάκελο config/custom_components/ στις ρυθμίσεις του HA.

2 Αποσυμπιέστε το ZIP μέσα σε αυτόν τον φάκελο.
config/custom_components/jahoo_el_news_ha/...)

3 Επανεκκινήστε το Home Assistant.
4 Πηγαίνετε στο Ρυθμίσεις > Συσκευές > Προσθήκη Integration
5 Αναζητήστε για Jahoo EL news HA
--------------------
Κώδικας για το Dashboard
Αφού προσθέσετε το integration, επιλέξτε 'markdown' κάρτα. Θα εναλλάσσει αυτόματα τα άρθρα.

{% if state_attr('sensor.jahoo_el_news_ha_rss', 'image_url') %}
<img src="{{ state_attr('sensor.jahoo_el_news_ha_rss', 'image_url') }}" width="100%"/>
{% endif %}

{{ state_attr('sensor.jahoo_el_news_ha_rss', 'description') }}

[Διαβάστε περισσότερα]({{ state_attr('sensor.jahoo_el_news_ha_rss', 'link') }})

<small>News {{ state_attr('sensor.jahoo_el_news_ha_rss', 'article_index') }} / {{ state_attr('sensor.jahoo_el_news_ha_rss', 'total_articles') }}</small>
