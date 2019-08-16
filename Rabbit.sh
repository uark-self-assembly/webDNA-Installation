#!/bin/bash -x

sudo rabbitmq-server start
sudo rabbitmqctl add_user django_server productionpass
sudo rabbitmqctl add_vhost webdna-production
sudo rabbitmqctl set_user_tags django_server administrator
sudo rabbitmqctl set_permissions -p webdna-production django_server ".*" ".*" ".*"

