#!/usr/bin/env bash
set -euo pipefail

source_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -n "${RUNTIME_PROJECT_SOURCE:-}" && -d "$RUNTIME_PROJECT_SOURCE" ]]; then source_dir="$RUNTIME_PROJECT_SOURCE"; fi
cd "$source_dir"
if [[ -f .env ]]; then
  set -a
  source ./.env
  set +a
fi

api_port="${BACKEND_PORT:-${PORT:-}}"
ui_port="${FRONTEND_PORT:-${CLIENT_PORT:-}}"
[[ "$api_port" =~ ^[0-9]+$ ]] || { echo "BACKEND_PORT or PORT must be set explicitly" >&2; exit 2; }
[[ "$ui_port" =~ ^[0-9]+$ ]] || { echo "FRONTEND_PORT or CLIENT_PORT must be set explicitly" >&2; exit 2; }
: "${DATABASE_URL:?DATABASE_URL must be set explicitly}"
for port in "$api_port" "$ui_port"; do
  if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use; no process was stopped" >&2
    exit 1
  fi
done

export PORT="$api_port" BACKEND_PORT="$api_port" FRONTEND_PORT="$ui_port"
npm --prefix backend run migrate
npm --prefix backend run create-admin
npm --prefix backend start &
api_pid=$!
(cd frontend && VITE_API_PROXY_TARGET="http://127.0.0.1:$api_port" npm run dev -- --host 127.0.0.1 --port "$ui_port") &
ui_pid=$!
cleanup() {
  kill "$api_pid" "$ui_pid" 2>/dev/null || true
  wait "$api_pid" "$ui_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
echo "HardwareOS UI starting at http://127.0.0.1:$ui_port"
wait "$api_pid" "$ui_pid"
