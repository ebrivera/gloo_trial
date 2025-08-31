#!/usr/bin/env bash
set -euo pipefail

echo "==> Creating a safety backup of potentially removed files to /tmp/ernesto_cleanup_backup.tar.gz"
tar -czf /tmp/ernesto_cleanup_backup.tar.gz \
  Procfile \
  run.sh \
  diagnose_deploy.sh \
  main.py \
  clean_data.py \
  data 2>/dev/null || true
echo "    Backup done (if files existed)."

# 1) Ensure vendored files exist
need_fail=0
for f in church-grader/backend/main.py church-grader/backend/clean_data.py; do
  if [ ! -f "$f" ]; then
    echo "❌ Missing $f — aborting to avoid breaking deploy."
    need_fail=1
  fi
done
if [ $need_fail -ne 0 ]; then exit 1; fi

# 2) Remove root Procfile (misleading)
if [ -f Procfile ]; then
  echo "==> Removing root Procfile (use backend/Procfile instead)"
  rm -f Procfile
fi

# 3) Remove helper scripts not needed in prod
for helper in run.sh diagnose_deploy.sh; do
  if [ -f "$helper" ]; then
    echo "==> Removing helper $helper"
    rm -f "$helper"
  fi
done

# 4) Only delete root main.py / clean_data.py if identical to backend copies
maybe_rm_dup () {
  local root="$1" backend="$2"
  if [ -f "$root" ]; then
    if cmp -s "$root" "$backend"; then
      echo "==> Removing duplicate $root (identical to $backend)"
      rm -f "$root"
    else
      echo "⚠️  Keeping $root (differs from $backend)."
    fi
  fi
}
maybe_rm_dup main.py church-grader/backend/main.py
maybe_rm_dup clean_data.py church-grader/backend/clean_data.py

# 5) Move/clean root data if identical
if [ -d data ]; then
  mkdir -p church-grader/backend/data
  # Compare representative file; if identical, remove root dir
  if [ -f data/churches_cleaned.csv ] && [ -f church-grader/backend/data/churches_cleaned.csv ] && cmp -s data/churches_cleaned.csv church-grader/backend/data/churches_cleaned.csv; then
    echo "==> Removing root data/ (already vendored)"
    rm -rf data
  else
    echo "⚠️  Keeping root data/ (differs or missing vendored counterpart)."
  fi
fi

# 6) Merge Python requirements so backend has everything it needs
echo "==> Merging backend/requirements.txt with root requirements.txt (if present)"
BACKEND_REQ=church-grader/backend/requirements.txt
TMP_MERGE=$(mktemp)
if [ -f requirements.txt ]; then
  # Concatenate, normalize, unique by package (case-insensitive), keep pinned versions
  cat "$BACKEND_REQ" requirements.txt | \
    awk 'NF && $1 !~ /^#/ {print tolower($0)}' | \
    sort -u > "$TMP_MERGE"

  # Ensure critical deps exist (openai, requests, beautifulsoup4, tqdm, pandas, uvicorn, fastapi, pydantic)
  for pkg in "openai" "requests" "beautifulsoup4" "tqdm" ; do
    grep -qi "^${pkg}" "$TMP_MERGE" || echo "${pkg}" >> "$TMP_MERGE"
  done

  mv "$TMP_MERGE" "$BACKEND_REQ"
  echo "    Updated $BACKEND_REQ"
else
  echo "    No root requirements.txt found; left $BACKEND_REQ as-is."
fi

echo "==> Done. Suggested git steps:"
echo "   git checkout -b deploy-cleanup"
echo "   git add -A && git commit -m 'Deploy cleanup: remove duplicates, merge backend requirements'"
echo "   # then push and keep deploying from church-grader/backend + church-grader/"
