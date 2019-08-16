#!/bin/bash -x

echo "----audit----"
npm audit fix --force

echo "---typescript----"
npm install typescript@">=3.4 <3.5"

echo "---sass---"
npm rebuild node-sass

echo "--run build--"
npm run build

