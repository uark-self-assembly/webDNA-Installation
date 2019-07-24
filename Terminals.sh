#!/bin/bash -x

OUTPUT="$(pwd)"
OUTPUT1="$OUTPUT/oxDNA/build/bin:"
OUTPUT2="$OUTPUT/oxDNA/UTILS:"

echo "node"
x-terminal-emulator -e "cd webdna-frontend && node server.js"

echo "django"
x-terminal-emulator -e "export PATH=$OUTPUT1$OUTPUT2$PATH && cd webdna-django-server && python3 manage.py runserver localhost:8000"

echo "celery"
x-terminal-emulator -e "export PATH=$OUTPUT1$OUTPUT2$PATH  && cd webdna-django-server && chmod +wx run_celery.sh && ./run_celery.sh"

