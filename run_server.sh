#!/bin/sh

cd nxt
./run.sh &
cd ..
cd fmcore
./run_core.sh &
cd ..
mongod --dbpath ./freemarket-lite/data/db --smallfiles &
node ./freemarket-lite/app.js