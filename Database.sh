#!/bin/bash -x

echo "Creating Database.sql"
sudo printf "CREATE DATABASE webdna;" > Database.sql

echo "Running Database.sql"
sudo -u postgres psql -f Database.sql

echo "Connecting to webdna"
sudo -u postgres psql -c '\c webdna'

echo "Creating Schema"
sudo -u postgres psql -d webdna -c 'CREATE SCHEMA webdna;'

echo "Creating Extension"
sudo -u postgres psql -d webdna -c 'CREATE EXTENSION "uuid-ossp";'

echo "Creating RoleEdit.sql"
sudo printf "CREATE ROLE django_server WITH SUPERUSER LOGIN PASSWORD 'dJAngO#SerVe!!!PaSs!1*';\nALTER DATABASE webdna OWNER TO django_server;\nALTER SCHEMA webdna OWNER TO django_server;" > RoleEdit.sql

echo "Running RoleEdit.sql"
sudo -u postgres psql -d webdna -f RoleEdit.sql


