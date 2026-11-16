"""Against a real Ablago: set up the integration through the config flow and read the sensors.

Runs only with ABLAGO_URL and ABLAGO_SCHLUESSEL (a key of the level "counters only"); in CI the workflow starts
the image dms-komplett for that.
"""

from __future__ import annotations

import os

import pytest

from custom_components.ablago.const import DOMAIN
from homeassistant.config_entries import SOURCE_USER, ConfigEntryState
from homeassistant.const import CONF_API_KEY, CONF_URL, CONF_VERIFY_SSL, STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

URL = os.environ.get("ABLAGO_URL", "")
SCHLUESSEL = os.environ.get("ABLAGO_SCHLUESSEL", "")

pytestmark = [
    pytest.mark.ablago,
    pytest.mark.skipif(not (URL and SCHLUESSEL), reason="kein Ablago (ABLAGO_URL, ABLAGO_SCHLUESSEL)"),
]


@pytest.mark.usefixtures("socket_enabled")
async def test_echtes_ablago(hass: HomeAssistant) -> None:
    """Config flow, setup and sensors with a fresh Ablago (no mail yet)."""
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_URL: URL, CONF_API_KEY: SCHLUESSEL, CONF_VERIFY_SSL: True}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY, result.get("errors")
    await hass.async_block_till_done()

    entry = hass.config_entries.async_entries(DOMAIN)[0]
    assert entry.state is ConfigEntryState.LOADED

    staende = {
        s.entity_id: s.state for s in hass.states.async_all() if s.entity_id.split(".")[1].startswith("127_0_0_1")
    }
    neue_post = next(v for k, v in staende.items() if k.endswith("_new_mail") and k.startswith("sensor."))
    assert neue_post.isdigit()
    assert next(v for k, v in staende.items() if k.endswith("_connectivity")) == STATE_ON
    assert next(v for k, v in staende.items() if k.endswith("_new_mail_waiting")) in (STATE_ON, STATE_OFF)

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_URL: URL, CONF_API_KEY: "dms_falsch", CONF_VERIFY_SSL: True}
    )
    assert result["errors"] == {CONF_API_KEY: "invalid_api_key"}
