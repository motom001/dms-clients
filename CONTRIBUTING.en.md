# Contributing to a client

[Deutsch](CONTRIBUTING.md) · **English**

**Issues and pull requests are welcome in German or English.**

1. **Open an issue** – as a user story: "As a … I want …, so that …", with acceptance criteria. For a **bug or wish for a client**, use the matching template and select the client there. There is a separate template for a **new client**.
2. **Wait for approval.** Only issues with the label `freigegeben` (approved) are worked on; only the maintainer sets it.
3. **Fork and build** in the client's folder. A new client gets its own folder directly under the root with `README.md` and `CHANGELOG.md`.
4. **Pull request** with `Closes #…`. Every commit carries a `Signed-off-by:` (`git commit -s`). With it you confirm, following the [Developer Certificate of Origin](https://developercertificate.org/), that you may contribute under the [Apache-2.0](LICENSE).

## Rules for clients

- **Only the API v1** of Ablago. If something is missing there, describe it as a wish in the repository [motom001/dms](https://github.com/motom001/dms/issues/new/choose) – clients do not build workarounds.
- **Narrowest key level:** the client's README states which API key level it needs and why.
- **No telemetry, no advertising, no connections to third parties**, not even for crash reports. The only exception is what the platform itself strictly requires (such as an app store); the README says so.
- **Store secrets safely:** API keys only in the platform's secure storage (keychain, encrypted settings), never in logs.
- **New dependencies only with a reason** in the pull request: what for, why not with built-in means, license (compatible with Apache-2.0), maintenance status.
- **No real data:** examples, tests and screenshots use only made-up names (Lena, Jonas …), reserved domains such as `dms.example.org` or `dms.home.arpa`, and documentation IP addresses (`192.0.2.x`).
- **Version and changes:** increase the client's version (in `package.json`, otherwise in a `VERSION` file in the folder, format `X.Y.Z`) and add a section `## X.Y.Z` to `CHANGELOG.md`. After the merge, the "Release" workflow creates the tag `<folder>-v<version>` and the release with that section as its text – nothing to do by hand. If the section is missing, the check in the pull request already reports it. Publishing to third-party stores (Homey App Store …) is done by the maintainer.

## The same in every client

All clients should look and work like Ablago itself and like the other clients.

- **Name:** the program is called **Ablago** (one word, only the A in capitals). "DMS" only where the kind of program is meant. Internal identifiers (`dms_…`, folders, API paths) stay.
- **App ID:** `app.ablago.clients.<client>`, e.g. `app.ablago.clients.homey`. It cannot be changed after the first release.
- **Terms from the [glossary](https://help.ablago.app/benutzer/aktuell/begriffe/)** (in German), spelled as in the interface. The three numbers of the counts endpoint have the same name in every client:

  | Number | German | English |
  | --- | --- | --- |
  | `neuePost` | Neue Post | New mail |
  | `zuErledigen` | Zu erledigen | To do |
  | `ueberfaellig` | Überfällig | Overdue |

  Triggers are called "New mail arrived", "New to-do", "Something is overdue" (German: „Neue Post angekommen“, „Neue Aufgabe zu erledigen“, „Etwas ist überfällig“). Ablago no longer has "Anstehend" ([dms#725](https://github.com/motom001/dms/issues/725)); do not read `anstehend`, no time window of your own such as "in 7 days". Ignore unknown fields in the response.
- **Describe paths the way you click:** "click your name at the top right → "Mein Konto" (my account) → "Sicherheit" (security) → "API-Schlüssel" (API keys)". Always "→", never ">", never "Profil →".
- **English:** as long as Ablago only speaks German, interface terms stay German in quotation marks, with a translation in brackets the first time: "nur Zähler" (counts only).
- **Icons from [Lucide](https://lucide.dev), the same shapes as in the Ablago interface** (`web/src/Symbol.tsx` in the `dms` repository, ISC license; copy only the shapes, license notice in `NOTICE`). New mail `inbox`, To do `list-checks`, Overdue `triangle-alert`. If a platform only allows its own set, use the closest icon.
- **Logo and colours** only from the `marke/` folder in the [dms-website](https://github.com/motom001/dms-website) repository. The app icon is always the logo, never a custom drawing.
- **Setup:** address and API key, suggest and explain the narrowest level, test the connection right away (also when changing settings and repairing), one key per person.
- **Messages** say why something does not work and what to do, including the path; never the key.
- **What goes where:** everything that concerns only this client is in its README (with a "Privacy" section: no telemetry, only what is needed, what is stored where). The Ablago handbook only covers the general part and links to the README.

Questions are welcome in the issue. How work on Ablago itself is organised is described in the [developer handbook](https://help.ablago.app/entwickler/aktuell/) (in German).

Our [code of conduct](CODE_OF_CONDUCT.md) applies (in German).

This is a translation. If the German and English versions differ, the German version ([CONTRIBUTING.md](CONTRIBUTING.md)) applies.
