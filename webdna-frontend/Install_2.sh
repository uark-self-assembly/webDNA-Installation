#!/bin/bash -x

echo "Create .env"
touch .env
echo "LAN_IP=localhost" >> .env
echo "WAN_IP=localhost" >> .env
echo "SIMULATION_DIR=../webdna-django-server/server-
data/server-sims" >> .env

sudo apt install nodejs
sudo apt install npm

sed -i 's/\"rxjs\": \"^6.2.1\"/\"rxjs\": \"6.2.1\"/g' package.json
sed -i 's/\"typescript\": \"~2.7.2\"/\"typescript\": \"^2.7.2\"/g' package.json

npm install
npm run build
