#!/bin/sh

cd nxt
./run.sh &
cd ..
cd fmcore
./run_core.sh &
cd ..
node ./freemarket-lite/app.js