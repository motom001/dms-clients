# Security

[Deutsch](SECURITY.md) · **English**

This repository belongs to the DMS ([motom001/dms](https://github.com/motom001/dms)) and contains: clients that talk to the DMS via its API (apps, extensions, home automation connections).

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities. Report them confidentially via GitHub: **Security → Report a vulnerability** in this repository ([private vulnerability reporting](https://github.com/motom001/dms-clients/security/advisories/new)). Reports in German or English are welcome.

If the vulnerability affects the DMS itself, please report it directly in the repository [motom001/dms](https://github.com/motom001/dms/security/advisories/new).

## What is checked automatically

| What | With | When |
| --- | --- | --- |
| Source code of the clients, workflows | CodeQL | every pull request, every push to `main` |
| Commits | Signed-off-by (DCO) | every pull request |
| GitHub Actions and client dependencies | Dependabot (alerts and updates) | every pull request, weekly |
| Secrets (tokens, passwords) | Secret scanning with push protection | every push |

Findings are listed under **Security** in this repository.

This is a translation. If the German and English versions differ, the German version ([SECURITY.md](SECURITY.md)) applies.
