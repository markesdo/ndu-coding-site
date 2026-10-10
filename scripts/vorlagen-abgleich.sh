#!/usr/bin/env bash
# Gleicht die Projekt-Vorlage (markesdo/ndu-projekt) mit der Leihbar-Vorlage
# (markesdo/ndu-coding-2026) ab: Alles, was in beiden gleich sein soll, wird aus
# der Leihbar-Vorlage kopiert. Committet und pusht nichts – danach den Diff in
# ndu-projekt lesen und selbst committen.
#
#   bash scripts/vorlagen-abgleich.sh [pfad/ndu-coding-2026] [pfad/ndu-projekt]
#
# CLAUDE.md und README.md unterscheiden sich absichtlich (ohne Leihbar-Regeln,
# Platzhalter „Mein Projekt“). Das Skript zeigt nur ihren Diff; Änderungen an
# den Kursregeln dort von Hand nachziehen.
set -euo pipefail

basis="$(cd "$(dirname "$0")/../.." && pwd)"
leihbar="${1:-$basis/ndu-coding-2026}"
projekt="${2:-$basis/ndu-projekt}"

for repo in "$leihbar" "$projekt"; do
  [ -d "$repo/.git" ] || { echo "Kein Git-Repo: $repo" >&2; exit 1; }
  if [ -n "$(git -C "$repo" status --porcelain)" ]; then
    echo "Ungesicherte Änderungen in $repo – erst committen oder verwerfen." >&2
    exit 1
  fi
  git -C "$repo" switch -q main
  git -C "$repo" pull -q --ff-only
done

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
for datei in "${gemeinsam[@]}"; do
  mkdir -p "$projekt/$(dirname "$datei")"
  cp "$leihbar/$datei" "$projekt/$datei"
done

# Befehle: alle außer /ndu-neu (das räumt Leihbar weg und gibt es nur dort).
for befehl in "$leihbar"/.claude/commands/*.md; do
  [ "$(basename "$befehl")" = ndu-neu.md ] && continue
  cp "$befehl" "$projekt/.claude/commands/"
done
for befehl in "$projekt"/.claude/commands/*.md; do
  [ -e "$leihbar/.claude/commands/$(basename "$befehl")" ] || echo "Nur in ndu-projekt: .claude/commands/$(basename "$befehl")"
done

# devcontainer.json: gleich bis auf das Port-Label.
sed 's/"label": "Leihbar (npm run dev)"/"label": "Mein Projekt (npm run dev)"/' \
  "$leihbar/.devcontainer/devcontainer.json" > "$projekt/.devcontainer/devcontainer.json"

echo "== Geändert in ndu-projekt"
git -C "$projekt" status --short
for datei in CLAUDE.md README.md; do
  echo
  echo "== $datei (Leihbar → Projekt, von Hand abgleichen)"
  diff -u "$leihbar/$datei" "$projekt/$datei" || true
done
