#!/usr/bin/env bash
# Tags und Releases je Client (#9).
#
#   releases.sh pruefen   zeigt, welche Releases nach dem Merge entstünden, und prüft die CHANGELOG-Abschnitte
#                         (ohne Schreibrechte, für Pull Requests)
#   releases.sh anlegen   legt für jede Version ohne Tag den Tag <ordner>-v<version> und das Release an
#                         (nur auf main, braucht GH_TOKEN mit contents: write und ZIEL = Commit)
#
# Version: <ordner>/package.json (Feld version), sonst <ordner>/VERSION. Text: Abschnitt „## <version>“ aus
# <ordner>/CHANGELOG.md. Titel: erste Überschrift aus <ordner>/README.md und die Version.
# Bestehende Tags und Releases werden nie verändert.
set -euo pipefail

modus="${1:-pruefen}"
case "$modus" in pruefen|anlegen) ;; *) echo "::error::Unbekannter Modus: $modus (pruefen oder anlegen)"; exit 2 ;; esac
if [ "$modus" = anlegen ]; then
  : "${GH_TOKEN:?GH_TOKEN fehlt}"
  : "${ZIEL:?ZIEL (Commit) fehlt}"
  [[ "$ZIEL" =~ ^[0-9a-f]{40}$ ]] || { echo "::error::ZIEL ist kein Commit-Hash"; exit 2; }
fi

ausgabe="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
arbeit="$(mktemp -d)"
trap 'rm -rf "$arbeit"' EXIT

# Tags, die es auf GitHub schon gibt (nicht nur lokal).
git ls-remote --tags --refs origin | awk '{sub("refs/tags/", "", $2); print $2}' > "$arbeit/tags"

fehler=0
neu=0
shopt -s nullglob
for pfad in */; do
  ordner="${pfad%/}"
  [ -f "$ordner/CHANGELOG.md" ] || continue
  if [[ ! "$ordner" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
    echo "::error::Ordnername $ordner: nur Kleinbuchstaben, Ziffern und Bindestrich"; fehler=1; continue
  fi

  if [ -f "$ordner/package.json" ]; then
    version="$(jq -r '.version // empty' "$ordner/package.json")"
  elif [ -f "$ordner/VERSION" ]; then
    version="$(tr -d '[:space:]' < "$ordner/VERSION")"
  else
    echo "::warning::$ordner/ hat weder package.json noch VERSION – kein Release"; continue
  fi
  if [[ ! "$version" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
    echo "::error::$ordner: Version „$version“ hat nicht das Format X.Y.Z"; fehler=1; continue
  fi

  tag="$ordner-v$version"
  if grep -qxF "$tag" "$arbeit/tags"; then
    echo "$tag gibt es schon – nichts zu tun."
    continue
  fi

  notizen="$arbeit/$ordner.md"
  awk -v v="$version" '
    /^## / { an = ($0 == "## " v); next }
    an { print }
  ' "$ordner/CHANGELOG.md" | sed -e '/./,$!d' > "$notizen"
  if ! grep -q '[^[:space:]]' "$notizen"; then
    echo "::error::$ordner/CHANGELOG.md hat keinen Abschnitt „## $version“ – ohne ihn entsteht kein Release"; fehler=1; continue
  fi
  printf '\n---\nTag `%s` · Ordner [`%s/`](https://github.com/%s/tree/%s/%s)\n' \
    "$tag" "$ordner" "${GITHUB_REPOSITORY:-motom001/dms-clients}" "$tag" "$ordner" >> "$notizen"

  name="$(sed -n 's/^# //p' "$ordner/README.md" | head -n 1)"
  titel="${name:-$ordner} $version"

  neu=$((neu + 1))
  if [ "$modus" = pruefen ]; then
    echo "- Nach dem Merge: Release **$titel** (Tag \`$tag\`)" >> "$ausgabe"
  else
    gh release create "$tag" --target "$ZIEL" --title "$titel" --notes-file "$notizen" --latest=false
    echo "- Angelegt: Release **$titel** (Tag \`$tag\`)" >> "$ausgabe"
  fi
done

[ "$neu" -gt 0 ] || echo "Keine neue Version – kein Release." >> "$ausgabe"
exit $fehler
