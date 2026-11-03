Brings the numbers from your self-hosted DMS (document management for households) to Homey Pro: new mail, to-dos, deadlines within the next 7 days and overdue items. Use them on the dashboard and in Flows, for example to turn on a light when new mail has arrived or to send a notification when a deadline is coming up.

Homey Pro only: the app talks directly to the DMS on your home network. Homey Cloud cannot reach a DMS on your home network.

Requires DMS 0.148.0 or newer and an API key with the level "nur Zähler" (counts only), which you create in the DMS under Profil > Sicherheit > API-Schlüssel. This key only reads numbers, never titles, senders or documents. A read-only key works too; a key that can write is rejected.

Homey asks the DMS every 5 minutes (adjustable). If nothing has changed, the DMS only answers "not modified" and no data is transferred. No telemetry: the app only connects to the DMS address you enter.
