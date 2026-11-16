#!/usr/bin/env bash
# Startet ein frisches Ablago (Image dms-komplett, mit eingebauter Datenbank) für Tests von Clients und richtet es über
# die Schnittstelle ein – wie deploy/komplett-probe.sh im Repository dms, ohne Browser.
#
#   .github/scripts/ablago-starten.sh <image>     z. B. ghcr.io/motom001/dms-komplett:0.290.8
#
# Schreibt nach $GITHUB_ENV (sonst auf die Ausgabe):
#   ABLAGO_URL         Adresse, z. B. http://127.0.0.1:18091
#   ABLAGO_SCHLUESSEL  API-Schlüssel der Stufe „nur Zähler“ für die eingerichtete Person
# Der Container heißt ablago-test; Konto und Passwort sind reine Testwerte.
set -euo pipefail
IMAGE="${1:?Image angeben, z. B. ghcr.io/motom001/dms-komplett:0.290.8}"
PORT=18091
URL="http://127.0.0.1:$PORT"
NAME=ablago-test
EMAIL=lena@example.org
PASSWORT="ein-langes-test-passwort-$RANDOM$RANDOM"
arbeit=$(mktemp -d)
fehler() { echo "::error::Ablago starten: $*"; docker logs --tail 60 "$NAME" 2>&1 || true; exit 1; }

docker run -d --name "$NAME" -p "127.0.0.1:$PORT:3000" \
  -v "$arbeit/files:/data/files" -v "$arbeit/geheim:/data/geheim" -v "$arbeit/sicherung:/data/sicherung" \
  -v "$arbeit/postgres:/data/postgres" "$IMAGE" >/dev/null

for _ in $(seq 1 90); do
  curl -fsS "$URL/api/konto/status" >/dev/null 2>&1 && break
  [ "$(docker inspect -f '{{.State.Running}}' "$NAME")" = true ] || fehler "Container läuft nicht mehr"
  sleep 2
done
curl -fsS "$URL/api/konto/status" >/dev/null || fehler "Ablago antwortet nicht"

# Einrichtungscode aus dem Ordner geheim (gehört dem Benutzer im Container, deshalb sudo).
for _ in $(seq 1 30); do sudo test -s "$arbeit/geheim/EINRICHTUNGSCODE" && break; sleep 1; done
code=$(sudo cat "$arbeit/geheim/EINRICHTUNGSCODE")
kekse="$arbeit/kekse"
curl -fsS -c "$kekse" -X POST "$URL/api/konto/einrichten" -H 'x-dms: 1' -H "x-einrichtungscode: $code" \
  -H 'content-type: application/json' \
  -d "{\"mandant\":\"Familie Beispiel\",\"name\":\"Lena Beispiel\",\"email\":\"$EMAIL\",\"passwort\":\"$PASSWORT\"}" >/dev/null \
  || fehler "Einrichten scheitert"

schluessel=$(curl -fsS -b "$kekse" -X POST "$URL/api/konto/api-schluessel" -H 'x-dms: 1' \
  -H 'content-type: application/json' -d '{"name":"Test Python-Client","recht":"zaehler"}' | jq -r '.schluessel // empty')
[ -n "$schluessel" ] || fehler "Kein API-Schlüssel erhalten"
echo "::add-mask::$schluessel"

ziel="${GITHUB_ENV:-/dev/stdout}"
{ echo "ABLAGO_URL=$URL"; echo "ABLAGO_SCHLUESSEL=$schluessel"; } >> "$ziel"
echo "Ablago läuft unter $URL ($IMAGE), Schlüssel „nur Zähler“ angelegt."
