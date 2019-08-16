#!/bin/bash -x

echo "node"
x-terminal-emulator -e "cd webdna-frontend && node server.js"

echo "django"
x-terminal-emulator -e "export PATH=\"/home/austin/WebDNA/oxDNA/build/bin:/home/austin/WebDNA/oxDNA/UTILS:\$PATH\" && cd webdna-django-server && python3 manage.py runserver localhost:8000"

echo "celery"
x-terminal-emulator -e "export PATH=\"/home/austin/WebDNA/oxDNA/build/bin:/home/austin/WebDNA/oxDNA/UTILS:\$PATH\" && cd webdna-django-server && chmod +wx run_celery.sh && ./run_celery.sh"

