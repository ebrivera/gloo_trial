# 1) Base image: includes Chromium + OS deps, so no sudo install is needed
# Pin the tag for reproducibility
FROM mcr.microsoft.com/playwright/python:v1.55.0-noble

# 2) Workdir
WORKDIR /app

# 3) Faster builds: copy reqs first to leverage layer cache
COPY requirements.txt /app/requirements.txt

# Optional but nice-to-have envs
ENV PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir -r /app/requirements.txt

# 4) Copy the backend app (includes api.py, data/, etc.)
COPY . /app

# (Playwright image already has a non-root user `pwuser`.)
# App listens on an unprivileged port, so we can safely drop privileges.
RUN chown -R pwuser:pwuser /app
USER pwuser

# 5) Render sets $PORT at runtime. Shell form CMD is required for ${PORT} expansion.
# Use a default (8000) if PORT is not set (for local runs).
ENV PORT=8000
CMD bash -lc 'uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000}'
