#!/bin/sh

./nxt/run.sh &
./fmcore/run_core.sh &
node ./freemarket-lite/app.js
