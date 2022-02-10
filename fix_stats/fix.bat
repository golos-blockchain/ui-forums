@echo off
echo -----------------------------------------
echo ...Launching fix_stats application...
echo -----------------------------------------
echo .
CMD /C npm install -g yarn
CMD /C yarn install
node fix_stats.js
