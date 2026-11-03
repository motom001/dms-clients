# Contributing to a client

[Deutsch](CONTRIBUTING.md) · **English**

**Issues and pull requests are welcome in German or English.**

1. **Open an issue** – as a user story: "As a … I want …, so that …", with acceptance criteria. For a **bug or wish for a client**, use the matching template and select the client there. There is a separate template for a **new client**.
2. **Wait for approval.** Only issues with the label `freigegeben` (approved) are worked on; only the maintainer sets it.
3. **Fork and build** in the client's folder. A new client gets its own folder directly under the root with `README.md` and `CHANGELOG.md`.
4. **Pull request** with `Closes #…`. Every commit carries a `Signed-off-by:` (`git commit -s`). With it you confirm, following the [Developer Certificate of Origin](https://developercertificate.org/), that you may contribute under the [Apache-2.0](LICENSE).

## Rules for clients

- **Only the API v1** of the DMS. If something is missing there, describe it as a wish in the repository [motom001/dms](https://github.com/motom001/dms/issues/new/choose) – clients do not build workarounds.
- **Narrowest key level:** the client's README states which API key level it needs and why.
- **No telemetry, no advertising, no connections to third parties**, not even for crash reports. The only exception is what the platform itself strictly requires (such as an app store); the README says so.
- **Store secrets safely:** API keys only in the platform's secure storage (keychain, encrypted settings), never in logs.
- **New dependencies only with a reason** in the pull request: what for, why not with built-in means, license (compatible with Apache-2.0), maintenance status.
- **No real data:** examples, tests and screenshots use only made-up names (Lena, Jonas …), reserved domains such as `dms.example.org` or `dms.home.arpa`, and documentation IP addresses (`192.0.2.x`).
- **Version and changes:** increase the client's version and update `CHANGELOG.md`. A release gets a tag `<folder>-v<version>`.

Questions are welcome in the issue. How work on the DMS itself is organised is described in the [developer handbook](https://motom001.github.io/dms/entwickler/aktuell/) (in German).

Our [code of conduct](CODE_OF_CONDUCT.md) applies (in German).

This is a translation. If the German and English versions differ, the German version ([CONTRIBUTING.md](CONTRIBUTING.md)) applies.
