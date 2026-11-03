# DMS for Homey Pro

[Deutsch](README.md) · **English**

App for **Homey Pro**: new mail, to-dos and deadlines from your self-hosted [DMS](https://github.com/motom001/dms) as device values and Flow cards. For example, a light can turn on when new mail has arrived, or you get a notification when a deadline is coming up – without anyone opening the DMS.

The DMS itself is in German, so this page names its menus and key levels in German, with a translation in brackets.

![How it works: Homey polls the DMS and triggers Flows (made-up values)](bilder/ablauf.en.svg)

## Requirements

- **Homey Pro** with Homey version 12.4.0 or newer. **Homey Cloud does not work:** it runs on the internet and cannot reach a DMS on your home network.
- **DMS version 0.148.0 or newer** (counts endpoint, [motom001/dms#625](https://github.com/motom001/dms/issues/625)).
- Homey must reach the DMS on your home network, e.g. at `https://dms.home.arpa` or `http://192.0.2.10:8080`.

## Which key? „nur Zähler“ (counts only)

The app needs an **API key with the level „nur Zähler“** (counts only). Create it in the DMS under **Profil → Sicherheit → API-Schlüssel** (profile, security, API keys).

- **Why this level:** a „nur Zähler“ key can only call `GET /api/v1/ich/zaehler` and only gets numbers there – no titles, senders, names or documents. The DMS answers everything else with `403`. If the key gets lost (for example with a Homey backup), someone learns at most how much mail and how many tasks you have.
- **„nur lesen“** (read only) works too; the device then shows a hint that „nur Zähler“ is enough.
- **„lesen und schreiben“** (read and write) is rejected by the app („use a key with the level nur Zähler“). It does not need write access.
- The numbers belong to the **user of the key**, within their permissions. For several people, create one key and one „DMS“ device per person.

## Setup

1. Sign in to the DMS as the person whose numbers Homey should show, and under **Profil → Sicherheit → API-Schlüssel** create a key with the level **„nur Zähler“**, e.g. „Homey“. Copy the key right away – it is shown in full only once.
2. In the Homey app, choose **Add device → DMS**.
3. Enter the **address of the DMS** and the **API key**. Homey tests the connection right away: you only get to the next step once numbers arrive and the level is right.
4. Add the „DMS“ device and rename it if you like, e.g. „DMS Lena“.

![Setup with address and key (schematic, made-up values)](bilder/einrichten.en.svg)

You can change the address, key and polling interval later in the **device settings**; Homey tests the connection there before saving, too. If the key has expired, **Repair** works as well.

## Values and Flow cards

| Device value | Number in the DMS (`GET /api/v1/ich/zaehler`) |
| --- | --- |
| **New mail** | `neuePost`: mail in state *Neu* (new) for you or for no one in particular |
| **To do** | `zuErledigen`: folders with open tasks for you |
| **Deadlines in 7 days** | `anstehend`: deadlines, reminders and tasks dated from today to 7 days ahead |
| **Overdue** | `ueberfaellig`: open deadlines, reminders and tasks dated before today |

| Flow card | Type | When |
| --- | --- | --- |
| **New mail arrived** | Trigger | The number of new mail goes up. Tokens: *New mail in total*, *Newly arrived* |
| **A deadline is due within 7 days / is overdue** | Trigger | „Deadlines in 7 days“ or „Overdue“ goes up. Tokens: *Deadlines in 7 days*, *Overdue* |
| **There is new mail** | Condition | „New mail“ is greater than 0 (can be inverted: *no* new mail) |

All four values are also available as Flow tokens and in Insights (history).

## Polling

Homey asks the DMS once per **polling interval** (default 5 minutes, adjustable from 1 minute to 1 day). The app sends the `ETag` of the last answer as `If-None-Match`. If nothing has changed, the DMS answers `304 Not Modified` **without a body** – no numbers are transferred. A trigger therefore fires at the latest one polling interval after the new mail arrived.

Nothing fires on the first poll after setup. After Homey restarts, the app compares with the last stored values: mail that arrived in the meantime fires once.

**Later:** once the DMS has a webhook ([motom001/dms#627](https://github.com/motom001/dms/issues/627)), the app can optionally fire right away instead of waiting for the next poll.

## Error messages

On an error the device shows „unavailable“ with the reason; during setup you see the same text. As soon as a poll works again, the device becomes available again by itself.

| Message | What to do |
| --- | --- |
| **The DMS cannot be reached.** | Check the address, whether the DMS is running and reachable on your home network. |
| **The API key is invalid, deleted or expired.** | Create a new „nur Zähler“ key in the DMS and enter it (settings or Repair). |
| **This API key has the wrong level. Use a key with the level „nur Zähler“.** | The key may write (or has an unknown level). Create a new „nur Zähler“ key. |
| Homey does not trust the certificate. | Use an address with a valid certificate or, on your own home network only, the `http://` address of the DMS. |
| No DMS 0.148.0 or newer answers at this address. | Check the address and the version of the DMS. |
| The DMS is in maintenance mode. | Nothing – Homey asks again after the next interval. |

## Privacy

- **No telemetry, no connections to third parties.** The app only talks to the DMS address you enter. Installation and updates go through the Homey App Store; the platform requires that.
- **Numbers only:** the app only reads the four numbers from the DMS (and, on start, the level of the key via `GET /api/v1/ich`; it stores nothing from there).
- **What is stored where:** address and key are kept in the device settings on your Homey Pro (the key in a password field, never displayed). Homey does not offer apps a separate keychain. Homey stores the numbers as device values and in Insights. The key never appears in the app log.

## Limits

- If, within one polling interval, as much mail arrives as is dealt with, the number stays the same – „New mail arrived“ then does not fire.
- The app does not follow redirects (e.g. from `http://` to `https://`), so the key never goes to another address. Enter the target address directly.

## Development

```sh
cd homey
npm ci              # only tools for checking; the app itself has no dependencies
npm test            # logic and device against a fake DMS server (node --test)
npm run validieren  # manifest, images and Flow cards like "homey app validate --level publish"
```

- Layout: `lib/` holds the logic without the Homey runtime (polling with ETag, evaluation, error mapping), `drivers/dms/` the device and setup, `locales/` the texts (de, en). The manifest is written directly in `app.json` (without Homey Compose).
- Try it on a Homey Pro: `npx homey app run` (Homey CLI, requires signing in with Athom).
- Images: sources as SVG in `bilder/`; the PNGs in `assets/images/` and `drivers/dms/assets/images/` are rendered from them (e.g. `rsvg-convert -w 1000 -h 700 bilder/app-bild.svg -o assets/images/xlarge.png`).
- New version: bump `version` in `package.json` and `app.json`, add to `CHANGELOG.md` and `.homeychangelog.json`. A release gets the tag `homey-v<version>` and is uploaded with `npx homey app publish`.

## License

[Apache-2.0](../LICENSE), see also [NOTICE](../NOTICE).
