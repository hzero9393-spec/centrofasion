#!/bin/sh
cd /home/z/my-project
while true; do
    npx next dev -p 3000 2>&1 >> dev.log
    sleep 2
done
