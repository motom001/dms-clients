# Python client for Ablago

[Deutsch](README.md) · **English**

The package `ablago` talks to [Ablago](https://github.com/motom001/dms), the self-hosted document filing for home and small businesses, from Python. It is the basis of the Home Assistant integration and works for your own scripts, monitoring and tools.

```bash
pip install ablago            # convenience layer: counters and health
pip install "ablago[api]"     # plus the complete API (ablago.api)
```

Python 3.12 or newer.

## Quick start

```python
import asyncio
from ablago import AblagoClient, AblagoAuthError, AblagoConnectionError


async def main():
    async with AblagoClient("https://ablago.example.org", api_key="dms_…") as client:
        counters = await client.zaehler()
        print(counters.neue_post, counters.zu_erledigen, counters.ueberfaellig)


asyncio.run(main())
```

Create the key in Ablago under **My account → Security → API keys**. For the counters, the level **“counters only”** is enough – do not use a higher one than needed.

Names follow the Ablago API, which is German: `zaehler` = counters, `neue_post` = new mail, `zu_erledigen` = to do, `ueberfaellig` = overdue, `gesundheit` = health.

## Two layers

| Part | What | Dependencies |
| --- | --- | --- |
| `ablago` | **Convenience layer**, hand-written: `AblagoClient` with `zaehler()` and `gesundheit()`, clear errors | `aiohttp` |
| `ablago.api` | **Complete API**, generated from Ablago’s API description: one function per route (sync and async), one typed class per object | `httpx2`, `attrs` (extra `[api]`) |

- `AblagoClient(address, api_key=None, *, session=None, verify_ssl=True, timeout=10)`. A session you pass in (e.g. Home Assistant’s) stays open after `close()`.
- `await client.zaehler()` → `Zaehlerstand(neue_post, zu_erledigen, ueberfaellig, stand, geaendert)`, with ETag/304: unchanged counters cost almost nothing.
- `await client.gesundheit()` → `Gesundheit(ok, zustand, seit)`, no key needed, never reveals the version.
- Redirects are not followed, so the key never goes to another address.

**Errors** all derive from `AblagoError`: `AblagoAuthError` (key wrong, expired, revoked or without permission – replace the key), `AblagoConnectionError` (unreachable, timeout, 5xx – retry later), `AblagoSSLError` (certificate does not match; subclass of `AblagoConnectionError`).

```python
from ablago.api import AuthenticatedClient
from ablago.api.api.ablage import get_mappen

async with AuthenticatedClient(base_url="https://ablago.example.org/api/v1", token="dms_…") as client:
    folders = await get_mappen.asyncio(client=client)
```

All routes are described in the [API documentation](https://help.ablago.app/admin/aktuell/api/).

## Keeping up with Ablago

`ablago.api` is generated from `openapi/openapi.json`, the API description of a fixed Ablago version (`openapi/ABLAGO_VERSION`). Once a day a workflow checks for a new Ablago release and opens a pull request if the API changed: additions only → minor version; removals or changes → marked and decided by hand.

## Privacy

The client only talks to the address you give it and sends nothing to third parties. It stores nothing on disk.

## License

Apache-2.0
