#!/bin/bash -x

echo "Install nginx"
sudo apt-get install nginx

echo "cd and permissions"
cd /etc/nginx/sites-enabled
sudo chmod ugo+rw default

echo "Delete contents"
truncate -s 0 default

echo "Create default"
touch default
echo "server {" >> default
echo "    listen 80;" >> default
echo "    server_name localhost;" >> default
echo "    location / {" >> default
echo "		proxy_pass \"http://localhost:8080\";" >> default
echo "		proxy_http_version 1.1;" >> default
echo "		proxy_set_header Upgrade \$http_upgrade;" >> default
echo "		proxy_set_header Connection \"upgrade\";" >> default
echo "		proxy_set_header Host \$host;" >> default
echo "		proxy_cache_bypass \$http_upgrade;" >> default
echo "		proxy_set_header X-Forwarded-For \$remote_addr;" >> default
echo "    }" >> default
echo "}" >> default

cd -
sudo service nginx restart


