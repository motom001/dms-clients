# Ablago for Home Assistant

[Deutsch](README.md) · **English**

The **Ablago** integration shows the counters of one person in [Ablago](https://github.com/motom001/dms) in [Home Assistant](https://www.home-assistant.io/): **new mail, to do and overdue**. Use them for dashboards and automations, for example a lamp that lights up when there is new mail, or a notification on your phone.

It talks to Ablago through the library [`ablago`](https://pypi.org/project/ablago/) (folder [`python/`](../python/)) and is built so that it can later be included in Home Assistant itself ([#3](https://github.com/motom001/dms-clients/issues/3)). Until then you can install it by hand.

Tested with Home Assistant 2026.10 and Ablago 0.290.8.

## What you get in Home Assistant

One device per person with these entities:

| Entity | Type | Meaning |
| --- | --- | --- |
| New mail | Sensor | Mail in the state "New" for this person or without a recipient |
| To do | Sensor | Folders under "To do" |
| Overdue | Sensor | The person's open deadlines, reminders and tasks dated before today |
| Last change | Sensor (timestamp) | When one of the counters last changed |
| New mail waiting | Binary sensor | On while "New mail" is above 0 |
| Connectivity | Binary sensor (diagnostic) | On while Ablago runs and its database answers |

A key of the level "counters only" gives nothing more: no titles, no senders, no content. While Ablago is unreachable, the counters are "unavailable" and "Connectivity" is off.

## Install (to try it out)

1. From the latest [release "Ablago für Home Assistant"](https://github.com/motom001/dms-clients/releases?q=homeassistant-v&expanded=true), download `ablago.zip` and unpack it into the folder `custom_components` of your Home Assistant configuration, so that `custom_components/ablago/manifest.json` is there. (Or copy the folder [`custom_components/ablago`](custom_components/ablago/) from here.)
2. Restart Home Assistant.

Home Assistant fetches the library `ablago` from PyPI on the first start.

## Set up

1. In Ablago: **My account → Security → API keys**, create a key of the level **"counters only"**. It can only read the counters.
2. In Home Assistant: **Settings → Devices & services → Add integration → Ablago**.
3. Enter the **address** (as in the browser, e.g. `https://ablago.example.org`) and the **API key**. Leave "Verify certificate" on, except for a self-signed certificate in your home network.
4. Rename the new device after the person, e.g. "Ablago · Lena", and let Home Assistant rename the entity IDs as well. The key does not tell whom it belongs to, so the device is first named after the address.

**Several people:** Every person creates their own key in Ablago, and the integration is added once per person. Administrators cannot create keys for others, so every person decides whether their counters show up in Home Assistant.

**Without HTTPS:** If you reach Ablago in your home network only via `http://`, the key travels unencrypted. With "counters only" it reveals at most how much mail is waiting; HTTPS is still better.

**Key revoked or expired:** Home Assistant reports "Re-authentication required" and asks for a new key. Address and key can be changed at any time with **Reconfigure**, without removing the integration.

## Example automation

A notification as soon as there is new mail for Lena (entity IDs depend on the name of the entry):

```yaml
alias: New mail in Ablago
triggers:
  - trigger: state
    entity_id: binary_sensor.ablago_lena_new_mail_waiting
    from: "off"
    to: "on"
actions:
  - action: notify.mobile_app_lenas_phone
    data:
      title: Ablago
      message: >
        {{ states('sensor.ablago_lena_new_mail') }} new mail waiting.
```

## Updates

The integration asks **once a minute**. If nothing changed, Ablago answers with `304` and no body, which costs next to nothing. New mail shows up within a minute.

## Remove

**Settings → Devices & services → Ablago → entry → Delete**, then revoke the key in Ablago under **My account → Security → API keys**. For a manual installation, delete the folder `custom_components/ablago` afterwards.

## Development

```bash
cd homeassistant
pip install -r anforderungen-test.txt -r anforderungen-werkzeuge.txt   # Python 3.14 like Home Assistant
ruff format --check . && ruff check . && mypy
pytest -q -p no:sugar --cov=custom_components.ablago --cov-fail-under=100
```

Against a real Ablago: `ABLAGO_URL=… ABLAGO_SCHLUESSEL=… pytest -m ablago`. In CI, the image `dms-komplett` starts for this in the version the Python client is tested against; Home Assistant's `hassfest` check runs as well.

Code, comments and `strings.json` are in English, as Home Assistant requires for integrations. `translations/en.json` is a copy of `strings.json`, `translations/de.json` the German version; a test keeps the three in line. The status of Home Assistant's [quality scale](https://developers.home-assistant.io/docs/core/integration-quality-scale/) is kept in `custom_components/ablago/quality_scale.yaml`.
