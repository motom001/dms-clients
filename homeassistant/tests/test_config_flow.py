"""Tests for the Ablago config flow."""

from __future__ import annotations

from collections.abc import Generator
from unittest.mock import AsyncMock, MagicMock, patch

from ablago import AblagoAuthError, AblagoConnectionError, AblagoError, AblagoSSLError
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.ablago.const import DOMAIN
from homeassistant.config_entries import SOURCE_USER
from homeassistant.const import CONF_API_KEY, CONF_URL, CONF_VERIFY_SSL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from .conftest import API_KEY, URL, USER_INPUT

ERRORS = [
    (AblagoAuthError("401", status=401), {CONF_API_KEY: "invalid_api_key"}),
    (AblagoSSLError("Zertifikat"), {CONF_URL: "ssl_error"}),
    (AblagoConnectionError("weg"), {CONF_URL: "cannot_connect"}),
    (AblagoError("leitet um", status=301), {CONF_URL: "redirect"}),
    (AblagoError("HTTP 404", status=404), {CONF_URL: "not_ablago"}),
    (AblagoError("kaputt"), {CONF_URL: "not_ablago"}),
    (RuntimeError("BOOM"), {"base": "unknown"}),
]


@pytest.fixture(autouse=True)
def mock_setup_entry() -> Generator[AsyncMock]:
    """Do not set up the entry after the flow."""
    with patch("custom_components.ablago.async_setup_entry", return_value=True) as setup:
        yield setup


async def _start(hass: HomeAssistant) -> str:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"
    assert result["errors"] == {}
    return result["flow_id"]


async def test_user_flow(hass: HomeAssistant, mock_client: MagicMock, mock_setup_entry: AsyncMock) -> None:
    """Address and key work: the entry is named after the host."""
    flow_id = await _start(hass)
    result = await hass.config_entries.flow.async_configure(flow_id, {**USER_INPUT, CONF_URL: f"  {URL}/ "})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "ablago.example.org"
    assert result["data"] == USER_INPUT
    mock_client.zaehler.assert_awaited_once()
    assert len(mock_setup_entry.mock_calls) == 1


@pytest.mark.parametrize(("side_effect", "errors"), ERRORS)
async def test_user_flow_errors(
    hass: HomeAssistant, mock_client: MagicMock, side_effect: Exception, errors: dict[str, str]
) -> None:
    """Every failure shows its own message, and the flow recovers."""
    flow_id = await _start(hass)
    mock_client.zaehler.side_effect = side_effect
    result = await hass.config_entries.flow.async_configure(flow_id, USER_INPUT)
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == errors

    mock_client.zaehler.side_effect = None
    result = await hass.config_entries.flow.async_configure(flow_id, USER_INPUT)
    assert result["type"] is FlowResultType.CREATE_ENTRY


async def test_user_flow_invalid_url(hass: HomeAssistant, mock_client: MagicMock) -> None:
    """An address without http:// or https:// is rejected before anything is sent."""
    flow_id = await _start(hass)
    with patch("custom_components.ablago.coordinator.AblagoClient", side_effect=ValueError):
        result = await hass.config_entries.flow.async_configure(flow_id, {**USER_INPUT, CONF_URL: "ablago.example.org"})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_URL: "invalid_url"}


async def test_user_flow_already_configured(
    hass: HomeAssistant, mock_client: MagicMock, mock_config_entry: MockConfigEntry
) -> None:
    """The same address and key cannot be added twice."""
    mock_config_entry.add_to_hass(hass)
    flow_id = await _start(hass)
    result = await hass.config_entries.flow.async_configure(flow_id, USER_INPUT)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_second_person(hass: HomeAssistant, mock_client: MagicMock, mock_config_entry: MockConfigEntry) -> None:
    """Another key for the same Ablago is another person and gets its own entry."""
    mock_config_entry.add_to_hass(hass)
    flow_id = await _start(hass)
    result = await hass.config_entries.flow.async_configure(flow_id, {**USER_INPUT, CONF_API_KEY: "dms_zaehler_jonas"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert len(hass.config_entries.async_entries(DOMAIN)) == 2


async def test_reauth_flow(hass: HomeAssistant, mock_client: MagicMock, mock_config_entry: MockConfigEntry) -> None:
    """A new key replaces the old one."""
    mock_config_entry.add_to_hass(hass)
    result = await mock_config_entry.start_reauth_flow(hass)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "reauth_confirm"
    assert result["description_placeholders"]["url"] == URL

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: "dms_neu"})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reauth_successful"
    assert mock_config_entry.data == {**USER_INPUT, CONF_API_KEY: "dms_neu"}


@pytest.mark.parametrize(("side_effect", "errors"), ERRORS)
async def test_reauth_flow_errors(
    hass: HomeAssistant,
    mock_client: MagicMock,
    mock_config_entry: MockConfigEntry,
    side_effect: Exception,
    errors: dict[str, str],
) -> None:
    """A key that does not work is not saved."""
    mock_config_entry.add_to_hass(hass)
    result = await mock_config_entry.start_reauth_flow(hass)
    mock_client.zaehler.side_effect = side_effect
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: "dms_neu"})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == errors
    assert mock_config_entry.data[CONF_API_KEY] == API_KEY

    mock_client.zaehler.side_effect = None
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: "dms_neu"})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reauth_successful"


async def test_reconfigure_flow(
    hass: HomeAssistant, mock_client: MagicMock, mock_config_entry: MockConfigEntry
) -> None:
    """Address, key and certificate check can be changed."""
    mock_config_entry.add_to_hass(hass)
    result = await mock_config_entry.start_reconfigure_flow(hass)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "reconfigure"

    neu = {CONF_URL: "http://192.168.1.20:3000", CONF_API_KEY: "dms_neu", CONF_VERIFY_SSL: False}
    result = await hass.config_entries.flow.async_configure(result["flow_id"], neu)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert mock_config_entry.data == neu


@pytest.mark.parametrize(("side_effect", "errors"), ERRORS)
async def test_reconfigure_flow_errors(
    hass: HomeAssistant,
    mock_client: MagicMock,
    mock_config_entry: MockConfigEntry,
    side_effect: Exception,
    errors: dict[str, str],
) -> None:
    """A change that does not work is not saved."""
    mock_config_entry.add_to_hass(hass)
    result = await mock_config_entry.start_reconfigure_flow(hass)
    mock_client.zaehler.side_effect = side_effect
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == errors

    mock_client.zaehler.side_effect = None
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"


async def test_reconfigure_to_existing_entry(
    hass: HomeAssistant, mock_client: MagicMock, mock_config_entry: MockConfigEntry
) -> None:
    """An entry cannot be changed into a copy of another one."""
    mock_config_entry.add_to_hass(hass)
    andere = MockConfigEntry(domain=DOMAIN, data={**USER_INPUT, CONF_API_KEY: "dms_zaehler_jonas"})
    andere.add_to_hass(hass)
    result = await andere.start_reconfigure_flow(hass)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"
