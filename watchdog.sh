#!/bin/bash
# Watchdog script - keeps Next.js dev server alive
cd /home/z/my-project
while true; do
    if ! pgrep -f "next-server" > /dev/null 2>&1; then
        echo "[$(date)] Starting Next.js dev server..." >> dev.log
        : > dev.log
        npx next dev -p 3000 >> dev.log 2>&1
        echo "[$(date)] Server exited, restarting in 3s..." >> dev.log
        sleep 3
    fi
    sleep 2
done
