# Ablago für Home Assistant

**Deutsch** · [English](README.en.md)

Die Integration **Ablago** zeigt in [Home Assistant](https://www.home-assistant.io/) die Zahlen einer Person aus [Ablago](https://github.com/motom001/dms): **neue Post, Zu erledigen und Überfälliges**. Damit lassen sich Dashboards und Automationen bauen, etwa eine Lampe, die bei neuer Post leuchtet, oder eine Benachrichtigung aufs Handy.

Sie spricht über die Bibliothek [`ablago`](https://pypi.org/project/ablago/) mit Ablago (Ordner [`python/`](../python/)) und ist so gebaut, dass sie später in Home Assistant selbst aufgenommen werden kann ([#3](https://github.com/motom001/dms-clients/issues/3)). Bis dahin lässt sie sich von Hand installieren.

Getestet mit Home Assistant 2026.10 und Ablago 0.290.8.

## Was du in Home Assistant bekommst

Je Person ein Gerät mit diesen Entitäten:

| Entität | Art | Bedeutung |
| --- | --- | --- |
| Neue Post | Sensor | Post im Stand „Neu“ für diese Person oder ohne Empfänger |
| Zu erledigen | Sensor | Mappen unter „Zu erledigen“ |
| Überfällig | Sensor | eigene offene Fristen, Erinnerungen und Aufgaben mit Datum vor heute |
| Letzte Änderung | Sensor (Zeitpunkt) | wann sich eine der Zahlen zuletzt geändert hat |
| Neue Post da | Binärer Sensor | an, solange „Neue Post“ größer als 0 ist |
| Konnektivität | Binärer Sensor (Diagnose) | an, solange Ablago läuft und die Datenbank antwortet |

Mehr gibt ein Schlüssel „nur Zähler“ nicht her: keine Titel, keine Absender, keine Inhalte. Ist Ablago nicht erreichbar, sind die Zahlen „nicht verfügbar“ und „Konnektivität“ ist aus.

## Installieren (zum Ausprobieren)

1. Am neuesten [Release „Ablago für Home Assistant“](https://github.com/motom001/dms-clients/releases?q=homeassistant-v&expanded=true) das Archiv `ablago.zip` herunterladen und in den Ordner `custom_components` deiner Home-Assistant-Konfiguration auspacken, sodass dort `custom_components/ablago/manifest.json` liegt. (Oder den Ordner [`custom_components/ablago`](custom_components/ablago/) von hier kopieren.)
2. Home Assistant neu starten.

Home Assistant lädt die Bibliothek `ablago` beim ersten Start selbst von PyPI.

## Einrichten

1. In Ablago: **Mein Konto → Sicherheit → API-Schlüssel**, einen Schlüssel der Stufe **„nur Zähler“** anlegen. Er kann nur die Zahlen lesen.
2. In Home Assistant: **Einstellungen → Geräte & Dienste → Integration hinzufügen → Ablago**.
3. **Adresse** (wie im Browser, z. B. `https://ablago.example.org`) und **API-Schlüssel** eintragen. „Zertifikat prüfen“ bleibt an, außer bei einem selbst signierten Zertifikat im Heimnetz.
4. Das neue Gerät nach der Person umbenennen, z. B. in „Ablago · Lena“, und Home Assistant die Entitäts-IDs gleich mit ändern lassen. Der Schlüssel verrät nicht, wem er gehört; deshalb heißt das Gerät zuerst wie die Adresse.

**Mehrere Personen:** Jede Person legt in Ablago ihren eigenen Schlüssel an, und die Integration wird für jede Person einmal hinzugefügt. Die Verwaltung kann keinen Schlüssel für andere erzeugen – so entscheidet jede Person selbst, ob ihre Zahlen in Home Assistant erscheinen.

**Ohne HTTPS:** Erreichst du Ablago im Heimnetz nur über `http://`, geht der Schlüssel unverschlüsselt durchs Netz. Bei „nur Zähler“ verrät er höchstens, wie viel Post da ist; besser ist trotzdem HTTPS.

**Schlüssel widerrufen oder abgelaufen:** Home Assistant meldet „Erneute Authentifizierung erforderlich“ und fragt nach einem neuen Schlüssel. Adresse und Schlüssel lassen sich jederzeit über **Neu konfigurieren** ändern, ohne die Integration zu löschen.

## Beispiel-Automation

Eine Benachrichtigung, sobald für Lena neue Post da ist (Entitäts-ID je nach Name des Eintrags):

```yaml
alias: Neue Post in Ablago
triggers:
  - trigger: state
    entity_id: binary_sensor.ablago_lena_neue_post_da
    from: "off"
    to: "on"
actions:
  - action: notify.mobile_app_lenas_handy
    data:
      title: Ablago
      message: >
        {{ states('sensor.ablago_lena_neue_post') }} neue Post wartet.
```

## Aktualisierung

Die Integration fragt **einmal in der Minute** nach. Hat sich nichts geändert, antwortet Ablago mit `304` ohne Inhalt; das kostet fast nichts. Neue Post erscheint also spätestens nach einer Minute.

## Entfernen

**Einstellungen → Geräte & Dienste → Ablago → Eintrag → Löschen**, dann den Schlüssel in Ablago unter **Mein Konto → Sicherheit → API-Schlüssel** widerrufen. Bei einer Installation von Hand danach den Ordner `custom_components/ablago` löschen.

## Entwickeln

```bash
cd homeassistant
pip install -r anforderungen-test.txt -r anforderungen-werkzeuge.txt   # Python 3.14 wie Home Assistant
ruff format --check . && ruff check . && mypy
pytest -q -p no:sugar --cov=custom_components.ablago --cov-fail-under=100
```

Gegen ein echtes Ablago: `ABLAGO_URL=… ABLAGO_SCHLUESSEL=… pytest -m ablago`. In der CI startet dafür das Image `dms-komplett` in der Version, gegen die auch der Python-Client geprüft ist; dazu läuft die Prüfung `hassfest` von Home Assistant.

Code, Kommentare und `strings.json` sind auf Englisch, wie es Home Assistant für Integrationen verlangt. `translations/en.json` ist eine Kopie von `strings.json`, `translations/de.json` die deutsche Fassung; ein Test hält die drei gleich. Den Stand der [Qualitätsstufen](https://developers.home-assistant.io/docs/core/integration-quality-scale/) von Home Assistant führt `custom_components/ablago/quality_scale.yaml`.
