CREATE ROLE django_server WITH SUPERUSER LOGIN PASSWORD 'dJAngO#SerVe!!!PaSs!1*';
ALTER DATABASE webdna OWNER TO django_server;
ALTER SCHEMA webdna OWNER TO django_server;