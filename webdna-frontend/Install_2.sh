#!/bin/bash -x

echo "Create .env"
touch .env
echo "LAN_IP=localhost" >> .env
echo "WAN_IP=localhost" >> .env
echo "SIMULATION_DIR=../webdna-django-server/server-
data/server-sims" >> .env

echo "Install npm"
sudo apt-get install npm
npm install

echo "Update node"
sudo npm install -g n
sudo n stable
node -v

echo "Update npm"
sudo apt install linuxbrew-wrapper
sudo rm -rf /usr/local/lib/node_modules
sudo rm -rf ~/.npm
brew uninstall --force node
PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"
brew install node
npm -v


