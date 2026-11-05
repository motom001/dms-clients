# Sicherheit

**Deutsch** · [English](SECURITY.en.md)

Dieses Repository gehört zu Ablago ([motom001/dms](https://github.com/motom001/dms)) und enthält: Clients, die über die API mit Ablago sprechen (Apps, Erweiterungen, Anbindungen an Hausautomatisierung).

## Eine Sicherheitslücke melden

Bitte **kein öffentliches Issue** für Sicherheitslücken. Melde sie vertraulich über GitHub: **Security → Report a vulnerability** in diesem Repository ([Private Vulnerability Reporting](https://github.com/motom001/dms-clients/security/advisories/new)). Ohne GitHub-Konto: **[security@ablago.app](mailto:security@ablago.app)**.

Betrifft die Lücke Ablago selbst, melde sie bitte direkt im Repository [motom001/dms](https://github.com/motom001/dms/security/advisories/new).

## Was automatisch geprüft wird

| Was | Womit | Wann |
| --- | --- | --- |
| Quellcode der Clients, Workflows | CodeQL | jeder Pull Request, jeder Push auf `main` |
| Commits | Signed-off-by (DCO) | jeder Pull Request |
| GitHub-Actions und Abhängigkeiten der Clients | Dependabot (Warnungen und Updates) | jeder Pull Request, wöchentlich |
| Geheimnisse (Tokens, Passwörter) | Secret Scanning mit Push-Schutz | jeder Push |

Die Funde stehen unter **Security** in diesem Repository.

Meldungen auf Deutsch oder Englisch sind willkommen. Bei Abweichungen zwischen deutscher und englischer Fassung gilt die deutsche.
