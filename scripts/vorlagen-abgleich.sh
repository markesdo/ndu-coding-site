#!/usr/bin/env bash
# Gleicht die Projekt-Vorlage (markesdo/ndu-projekt) mit der Leihbar-Vorlage
# (markesdo/ndu-coding-2026) ab: Alles, was in beiden gleich sein soll, wird aus
# origin/main der Leihbar-Vorlage kopiert. Committet und pusht nichts – danach
# den Diff in ndu-projekt lesen und selbst committen.
#
#   bash scripts/vorlagen-abgleich.sh [pfad/ndu-coding-2026] [pfad/ndu-projekt]
#
# Die Leihbar-Checkout wird nur gefetcht, nie umgeschaltet (Dateien kommen per
# git show origin/main:…). ndu-projekt muss sauber auf main stehen.
# CLAUDE.md und README.md unterscheiden sich absichtlich (ohne Leihbar-Regeln,
# Platzhalter „Mein Projekt“). Das Skript zeigt nur ihren Diff; Änderungen an
# den Kursregeln dort von Hand nachziehen.
set -euo pipefail

basis="$(cd "$(dirname "$0")/../.." && pwd)"
leihbar="${1:-$basis/ndu-coding-2026}"
projekt="${2:-$basis/ndu-projekt}"

for repo in "$leihbar" "$projekt"; do
  git -C "$repo" rev-parse --git-dir >/dev/null 2>&1 || { echo "Kein Git-Repo: $repo" >&2; exit 1; }
done
if [ "$(git -C "$projekt" branch --show-current)" != main ] || [ -n "$(git -C "$projekt" status --porcelain)" ]; then
  echo "ndu-projekt muss sauber auf main stehen: $projekt" >&2
  exit 1
fi
git -C "$leihbar" fetch -q origin main
git -C "$projekt" pull -q --ff-only
quelle=origin/main

# Gleich in beiden Vorlagen. Was hier nicht steht und nicht in „absichtlich
# anders“, meldet das Skript am Ende als neu.
gemeinsam=(
  .claude/settings.json
  .devcontainer/git-identitaet.sh
  .env.example
  .gitignore
  .mcp.json
  .vscode/extensions.json
  AGENTS.md
  docs/HILFE-ANFRAGE.md
  docs/PRODUKT-VORLAGE.md
  eslint.config.mjs
  next.config.ts
  package.json
  package-lock.json
  postcss.config.mjs
  setup-mac.sh
  src/app/favicon.ico
  src/app/globals.css
  src/components/FeatureCard.tsx
  tsconfig.json
)
absichtlich_anders=(
  CLAUDE.md README.md docs/BACKLOG.md docs/ENTSCHEIDUNGEN.md
  .devcontainer/devcontainer.json
  src/app/layout.tsx src/app/page.tsx src/components/Header.tsx src/components/Footer.tsx
  src/data/gegenstaende.ts src/lib/format.ts .claude/commands/ndu-neu.md
)

hole() { # Datei aus der Leihbar-Vorlage nach ndu-projekt
  mkdir -p "$projekt/$(dirname "$1")"
  git -C "$leihbar" show "$quelle:$1" > "$projekt/$1"
}

fehlt=()
for datei in "${gemeinsam[@]}"; do
  if git -C "$leihbar" cat-file -e "$quelle:$datei" 2>/dev/null; then hole "$datei"; else fehlt+=("$datei"); fi
done

# Befehle: alle außer /ndu-neu (das räumt Leihbar weg und gibt es nur dort).
while IFS= read -r befehl; do
  [ "$befehl" = .claude/commands/ndu-neu.md ] || hole "$befehl"
done < <(git -C "$leihbar" ls-tree --name-only "$quelle" .claude/commands/)
for befehl in "$projekt"/.claude/commands/*.md; do
  name=".claude/commands/$(basename "$befehl")"
  git -C "$leihbar" cat-file -e "$quelle:$name" 2>/dev/null || echo "Nur in ndu-projekt: $name"
done

# devcontainer.json: gleich bis auf das Port-Label.
git -C "$leihbar" show "$quelle:.devcontainer/devcontainer.json" \
  | sed 's/"label": "Leihbar (npm run dev)"/"label": "Mein Projekt (npm run dev)"/' \
  > "$projekt/.devcontainer/devcontainer.json"

echo "== Geändert in ndu-projekt"
git -C "$projekt" status --short

warnung=0
if ! grep -q '"label": "Mein Projekt (npm run dev)"' "$projekt/.devcontainer/devcontainer.json"; then
  echo "!! Port-Label in devcontainer.json nicht ersetzt – Label in der Leihbar-Vorlage geändert? Von Hand anpassen." >&2
  warnung=1
fi
if ! grep -q 'Mein Projekt' "$projekt/.claude/commands/ndu-idee.md"; then
  echo "!! ndu-idee.md kennt den Platzhalter „Mein Projekt“ nicht mehr – nicht committen, erst klären." >&2
  warnung=1
fi
for datei in "${fehlt[@]+"${fehlt[@]}"}"; do
  echo "!! In der Leihbar-Vorlage nicht mehr vorhanden: $datei – Liste im Skript anpassen." >&2
  warnung=1
done
while IFS= read -r datei; do
  case " ${gemeinsam[*]} ${absichtlich_anders[*]} " in *" $datei "*) continue ;; esac
  case "$datei" in .claude/commands/*|public/gegenstaende/*) continue ;; esac
  echo "!! Neu in der Leihbar-Vorlage, nicht abgeglichen: $datei" >&2
  warnung=1
done < <(git -C "$leihbar" ls-tree -r --name-only "$quelle")

for datei in CLAUDE.md README.md; do
  echo
  echo "== $datei (Leihbar → Projekt, von Hand abgleichen)"
  diff -u <(git -C "$leihbar" show "$quelle:$datei") "$projekt/$datei" || true
done
exit "$warnung"
