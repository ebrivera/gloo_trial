#!/usr/bin/env bash
set -euo pipefail

echo ">> Creating backend/data and vendoring code that lives outside backend..."
mkdir -p church-grader/backend/data
cp -f data/*.csv church-grader/backend/data/ || true
cp -f main.py church-grader/backend/ || true
cp -f clean_data.py church-grader/backend/ || true

API="church-grader/backend/api.py"

echo ">> Relaxing CORS temporarily (allow all) for fast deploy..."
# Replace allow_origins=[...] with wildcard. Safe for first deploy; tighten later.
python - <<'PY'
import re, sys, pathlib
p = pathlib.Path("church-grader/backend/api.py")
s = p.read_text()
s = re.sub(r"allow_origins=\[[^\]]+\]", "allow_origins=[\"*\"]", s)
p.write_text(s)
print("CORS set to *")
PY

echo ">> Rewriting data paths from ../../data/... -> ./data/..."
# Two occurrences in load_churches_from_csv() and run_evaluation_background()
sed -i.bak 's|\.\./\.\./data/|./data/|g' "$API" || true

echo ">> Adjusting imports now that main.py & clean_data.py are in the same folder..."
# Keep the sys.path hack harmless, but prefer local imports first
python - <<'PY'
from pathlib import Path
p = Path("church-grader/backend/api.py")
s = p.read_text()
s = s.replace("from main import run_batch", "from main import run_batch")
s = s.replace("from clean_data import clean_church_data", "from clean_data import clean_church_data")
p.write_text(s)
print("Imports OK")
PY

echo ">> Creating backend Procfile (for Heroku/Render-style if ever needed)"
cat > church-grader/backend/Procfile <<'PROC'
web: uvicorn api:app --host 0.0.0.0 --port $PORT
PROC

echo ">> Backend prep complete."
