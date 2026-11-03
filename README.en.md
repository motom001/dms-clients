# DMS Clients

[Deutsch](README.md) · **English**

Programs that run **outside the DMS** and talk to it: apps, extensions and connections to other systems. The [DMS](https://github.com/motom001/dms) itself is self-hosted document management for households and families.

> **You do not need any of these clients.** The DMS can be used completely in the browser. Clients are an extra, for example for the share menu on your phone or a lamp that lights up when new mail arrives.

## Which clients exist and are planned

Each client lives in **its own folder directly under the root**. A folder is created with the first pull request for that client.

| Area | Folder | What it is | Status |
| --- | --- | --- | --- |
| Home automation | `homey/` | App for Homey Pro: new mail, tasks and deadlines as values and flow cards | planned ([motom001/dms#626](https://github.com/motom001/dms/issues/626)) |
| Home automation | `homeassistant/` | Home Assistant integration (via HACS): the same numbers as sensors | later ([motom001/dms#628](https://github.com/motom001/dms/issues/628)) |
| Phone and tablet | `ios/`, `android/` (or shared `app/`) | Apps for iPhone, iPad and Android: scanning, share menu, notifications, Face ID | concept ([motom001/dms#340](https://github.com/motom001/dms/issues/340)) |
| Office | `office/` | Add-ins for Word, Excel and Outlook: file a document or email in the DMS | idea (from [motom001/dms#340](https://github.com/motom001/dms/issues/340)) |
| Office | `thunderbird/` | Thunderbird extension: file an email with attachments as incoming mail | idea |
| Browser | `browser/` | Extension for Firefox, Chrome and Edge: file the current page or invoice as incoming mail | idea |
| Phone without an app | `kurzbefehle/` | Apple Shortcuts ("scan to DMS", Siri) and templates for Android sharing | idea |
| Examples | `beispiele/` | Guides and small scripts for Node-RED, ioBroker, openHAB, `curl` and Python | idea |

**Deliberately not planned:** a separate desktop app (the WebDAV drive and the browser cover this), connections to cloud systems that require a DMS reachable from the internet (Google Home, Alexa, SmartThings), and Apple Home/HomeKit (use Home Assistant for that).

Whatever a client needs inside the DMS, such as the lean counter endpoint with the "counters only" key ([motom001/dms#625](https://github.com/motom001/dms/issues/625)) or the webhook ([motom001/dms#627](https://github.com/motom001/dms/issues/627)), is built in the repository [motom001/dms](https://github.com/motom001/dms).

## Principles for all clients

- **Only the public API v1** of the DMS ([API description](https://motom001.github.io/dms/admin/aktuell/api/), in German). No client needs access to the database or files of the DMS.
- **As few permissions as possible:** a client asks for the narrowest key level that is enough and states it in its README.
- **No telemetry:** a client sends nothing to third parties, not even anonymously. It only talks to the DMS whose address you enter.
- **No content where numbers are enough:** home automation connections get numbers, no titles, senders or documents.
- **Data stays in the DMS:** a client stores at most what it needs for display, and says where.

## Layout

```
<client>/              one folder per client, e.g. homey/
  README.md            what the client does, which key level, installation (German, ideally also README.en.md)
  CHANGELOG.md         changes per version
  …                    source code, tests, build following the rules of the platform
.github/               templates for issues and pull requests, workflows
CONTRIBUTING.en.md     how a contribution gets here
ROADMAP.md             how to read the roadmap (German)
SECURITY.en.md         report vulnerabilities confidentially
```

**Versions:** each client has its own version numbers, independent of the DMS. A release gets a tag with the folder name, e.g. `homey-v1.0.0`.

## Contributing

Report bugs and wishes for a client using the templates under [Issues](https://github.com/motom001/dms-clients/issues/new/choose). Bugs in the DMS itself belong in the repository [motom001/dms](https://github.com/motom001/dms/issues/new/choose). How a contribution works is described in [CONTRIBUTING.en.md](CONTRIBUTING.en.md).

## License

[Apache-2.0](LICENSE), see also [NOTICE](NOTICE). Our [code of conduct](CODE_OF_CONDUCT.md) applies (in German).

This is a translation. If the German and English versions differ, the German version ([README.md](README.md)) applies.
