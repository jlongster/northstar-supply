#!/bin/sh
# Keeps the demo server running: restarts it if it exits. This VM has no systemd, so this is
# started detached, e.g. from the repo root:
#   setsid nohup scripts/serve-forever.sh >> server.log 2>&1 < /dev/null &
cd "$(dirname "$0")/.." || exit 1
while true; do
  node server.js
  echo "[serve-forever] server exited with $? at $(date -u +%FT%TZ); restarting in 1s"
  sleep 1
done
