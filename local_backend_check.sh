#!/usr/bin/env bash
set -euo pipefail

echo "==> Checking OPENAI_API_KEY (needed for /evaluate jobs that call run_batch)"
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "⚠️  OPENAI_API_KEY not set. Health & /churches will work; /evaluate may fail. Export it if you want to test /evaluate:"
  echo "    export OPENAI_API_KEY=sk-..."
fi

pushd church-grader/backend >/dev/null

echo "==> Installing backend deps (once)"
python -m pip install -r requirements.txt >/dev/null

echo "==> Launching FastAPI on :8000"
uvicorn api:app --host 0.0.0.0 --port 8000 &
BACK_PID=$!

# Cleanup on exit
cleanup() { echo; echo "==> Stopping backend ($BACK_PID)"; kill $BACK_PID 2>/dev/null || true; }
trap cleanup EXIT

echo "==> Waiting for health..."
for i in {1..30}; do
  if curl -fsS http://localhost:8000/health >/dev/null; then break; fi
  sleep 0.5
done

echo "==> Health:"
curl -s http://localhost:8000/health | python -m json.tool || true

echo "==> First 3 churches:"
curl -s http://localhost:8000/churches | python - <<'PY'
import sys, json
data=json.load(sys.stdin)
print(json.dumps(data[:3], indent=2))
PY

echo
echo "✅ Backend basic endpoints look good. Leave this running in this tab to keep the server alive."
echo "   (Open a new terminal for the frontend test.)"
wait
