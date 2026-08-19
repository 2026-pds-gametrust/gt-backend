#!/usr/bin/env bash
# Atomic commits: 1 file = 1 commit. Excludes SDD/FSD artifacts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

should_exclude() {
  case "$1" in
    docs/specs/*|docs/frontend-api/*|docs/audits/*|.cursor/plans/*|.env|.env.*|docs/qa/e2e-phase1/_evidence/*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

infer_type() {
  local f="$1"
  case "$f" in
    src/__tests__/*) echo "test" ;;
    src/domain/*) echo "feat" ;;
    src/infraestructure/*|src/application/*|src/configuration/*|src/contracts/*|src/app.ts) echo "feat" ;;
    docs/*|*.md) echo "docs" ;;
    .github/*) echo "ci" ;;
    yarn.lock|package.json) echo "chore" ;;
    *) echo "chore" ;;
  esac
}

infer_scope() {
  local f="$1"
  case "$f" in
    src/domain/*/*)
      echo "$f" | cut -d/ -f3
      ;;
    src/__tests__/unit/*/*|src/__tests__/integration/*/*)
      echo "$f" | cut -d/ -f4
      ;;
    src/application/*|src/infraestructure/*|src/configuration/*)
      echo "$f" | cut -d/ -f2
      ;;
    .cursor/*)
      echo "cursor"
      ;;
    .claude/*)
      echo "claude"
      ;;
    .agents/*)
      echo "agents"
      ;;
    *)
      echo "repo"
      ;;
  esac
}

infer_action() {
  local f="$1" status="$2"
  local base
  base="$(basename "$f")"

  if [ "$status" = "D" ]; then
    echo "remove ${base}"
    return
  fi

  case "$f" in
    src/domain/*/service/*.ts)
      echo "update $(basename "$f" .ts) service"
      ;;
    src/domain/*/entity/*.ts)
      echo "update $(basename "$f" .ts) entity"
      ;;
    src/application/controllers/*.ts)
      echo "update $(basename "$f" .ts) controller"
      ;;
    src/contracts/service.yaml)
      echo "update OpenAPI service contract"
      ;;
    src/__tests__/*)
      echo "add or update tests in ${base}"
      ;;
    docs/en/*|docs/pt-BR/*)
      echo "add bilingual API documentation for ${base}"
      ;;
    .devin/*)
      echo "add DeepWiki steering configuration"
      ;;
    scripts/generate-frontend-api-docs.js)
      echo "extend bilingual API doc generator"
      ;;
    scripts/e2e/*)
      echo "add e2e script ${base}"
      ;;
    scripts/seed-local.ts)
      echo "add local database seed script"
      ;;
    yarn.lock)
      echo "update yarn lockfile"
      ;;
    package.json)
      echo "update package dependencies and scripts"
      ;;
    docker-compose.yml)
      echo "update docker-compose for local dependencies"
      ;;
    .gitignore)
      echo "update gitignore patterns"
      ;;
    *)
      echo "update ${base}"
      ;;
  esac
}

build_message() {
  local f="$1" status="$2"
  local type scope action
  type="$(infer_type "$f")"
  scope="$(infer_scope "$f")"
  action="$(infer_action "$f" "$status")"
  if [ "$scope" = "repo" ]; then
    echo "${type}: ${action}"
  else
    echo "${type}(${scope}): ${action}"
  fi
}

sort_prefix() {
  local f="$1"
  case "$f" in
    src/domain/*) echo "1" ;;
    src/infraestructure/*) echo "2" ;;
    src/application/*) echo "3" ;;
    src/configuration/*) echo "4" ;;
    src/contracts/*) echo "5" ;;
    src/app.ts) echo "6" ;;
    src/__tests__/*) echo "7" ;;
    *) echo "9" ;;
  esac
}

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

git status --porcelain -uall | while IFS= read -r line; do
  status="${line:0:2}"
  file="${line:3}"
  if should_exclude "$file"; then
    continue
  fi
  st="M"
  case "$status" in
    "??"|"A "*|" A") st="A" ;;
    " D"|"D ") st="D" ;;
  esac
  prefix="$(sort_prefix "$file")"
  printf '%s\t%s\t%s\n' "$prefix" "$st" "$file"
done | sort -t $'\t' -k1,1 -k3,3 > "$TMP"

total="$(wc -l < "$TMP" | tr -d ' ')"
echo "Planning ${total} atomic commits (excluding SDD/FSD artifacts)..."

count=0
while IFS=$'\t' read -r _prefix st f; do
  [ -z "$f" ] && continue
  git add -- "$f" 2>/dev/null || git add -u -- "$f"
  msg="$(build_message "$f" "$st")"
  git commit -m "$msg" >/dev/null
  count=$((count + 1))
  if [ $((count % 50)) -eq 0 ]; then
    echo "Committed ${count}/${total}..."
  fi
done < "$TMP"

echo "Done: ${count} commits."
git status --short | head -30
