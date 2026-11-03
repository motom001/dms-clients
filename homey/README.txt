Brings the numbers from Ablago, your self-hosted document filing for home and small businesses, to Homey Pro: new mail, to-dos, things due in the next 7 days and overdue items. Use them on the dashboard and in Flows, for example to turn on a light when new mail has arrived or to send a notification when something is due soon.

Homey Pro only: the app talks directly to Ablago on your home network. Homey Cloud cannot reach Ablago on your home network.

Requires Ablago 0.148.0 or newer and an API key with the level "nur Zähler" (counts only). Create it in Ablago: click your name at the top right → "Mein Konto" (my account) → "Sicherheit" (security) → "API-Schlüssel" (API keys). This key only reads numbers, never titles, senders or documents. A key with the level "nur lesen" (read only) works too; a key that can write is rejected.

Homey asks Ablago every 5 minutes (adjustable). If nothing has changed, Ablago only answers "not modified" and no data is transferred. No telemetry: the app only connects to the Ablago address you enter.
