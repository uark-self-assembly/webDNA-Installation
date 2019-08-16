# WebDNA Django Server

This repository holds the Django Server running the WebDNA backend. It is an open-source project under active development at the University of Arkansas.

WebDNA is a user-centric software designed around the [oxDNA](https://dna.physics.ox.ac.uk/index.php/Main_Page) simulation software. This API serves as the view to a managed simulation environment, featuring user accounts, custom data manipulation (via Python scripts), and much more.

## For the Developers
You should adjust your environment according to below:
1. **Add oxDNA/UTILS and oxDNA/build/bin to PATH.**<br>Modify `~/.profile` to include the following line:

    ```bash
    ...
    export PATH="/usr/local/bin/oxDNA/build/bin:/usr/local/bin/oxDNA/UTILS:$PATH"
    ```
2. **Make the oxDNA UTIL scripts runnable.**<br>In the `UTILS` directory, run the following commands:

    ```bash
    chmod +wx *.py
    sed -i '1i #!/usr/bin/env python2' *.py
    ```

We'll outline here what all is needed to get this server up and running on your machine.
There are three main components (so far):

1. A PostgreSQL database server
2. This Django API
3. The Celery task manager

We'll set these things up in that order.

### PostgreSQL Database Server

First, install the PostgreSQL DB server on your machine. Depending on your machine, follow the instructions here to install the database server:
  * [macOS](https://www.codementor.io/engineerapart/getting-started-with-postgresql-on-mac-osx-are8jcopb)
  * [Windows](https://www.postgresql.org/download/windows/)

When you install PostgreSQL, make sure to create a database called "webdna" by running the following commands as a superuser in the psql prompt:

```sql
CREATE DATABASE webdna;
```

Go ahead and connect to the database with:

```sql
\c webdna
```

We will then create a "schema" to keep all of our WebDNA tables organized. Run:

```sql
CREATE SCHEMA webdna;
```

Now, run the following command to support UUIDs on this database:

```sql
CREATE EXTENSION "uuid-ossp";
```

Create a role (i.e. a "user") on your PSQL database called "django_server" by running the following command as a superuser in the psql prompt:

```sql
CREATE ROLE django_server WITH SUPERUSER LOGIN PASSWORD 'dJAngO#SerVe!!!Pa$#!1*';
```

After that, run the following command to make this user owner of the  `webdna` database.

```sql
ALTER DATABASE webdna OWNER TO django_server;
```

Grant ownership of the webdna schema to the django_server user

```sql
ALTER SCHEMA webdna OWNER TO django_server;
```

Finally, we need to perform the **database migrations**. In the project directory, run the following command:

```bash
python3 manage.py migrate
```

If you see a bunch of `OK` messages, then you're done! The database is all set up.

### Django API
Well, to be honest, PostgreSQL was the hard part because everybody has a different machine, but this is a bit easier. First, make sure you've got PyCharm Professional installed. If not, you can definitely still run this Python project, but for our team, we're sticking to an IDE that makes the development process a breeze.

We recommend using a virtual environment. If you want to do this, simply run the setup script in this repo.

```bash
./venv_setup.sh
```

Otherwise, you just need tomake sure you have all the Python dependencies installed. Run the following if you didn't do the above:

```bash
pip3 install -r requirements.txt
```

To make it easier to quickly run the server from within PyCharm, 
create a new configuration by clicking the "Configurations" drop-down in the top right of the PyCharm window.
  * In the configuration window, click the "+" on the far left and select "Django server".
  * Then, change the "Host" to "localhost". I would also name the configuration something pretty, like "Run Server".

If you'd rather run it from command line, just run the following, replacing `{LAN_IP}` with your local network IP:

```bash
python3 manage.py runserver {LAN_IP}:8000
```

## Setting up Celery

Before installing the Celery task server, we have to install and configure the RabbitMQ backend.

### RabbitMQ Setup

1. Open a terminal session and install RabbitMQ by running:

    ```bash
    sudo apt install rabbitmq-server
    ```

2. Start the RabbitMQ server with by running: 

    ```bash
    rabbitmq-server start
    ```

3. Create a new user for the django server by running:

    ```bash
    sudo rabbitmqctl add_user django_server productionpass
    ```

    (Note: you will likely want a different password than "productionpass", but you will have to also change the corresponding setting in the server's settings.py file to use your stronger password)

4. Create a new virtual host named "webdna-production" by runnning: 

    ```bash
    sudo rabbitmqctl add_vhost webdna-production
    ```

5. Make sure the new user is labeled as an admin by running:

    ```bash
    sudo rabbitmqctl set_user_tags django_server administrator
    ```

6. Set the correct permissions for the django_server user on the new vhost by running:
    ```bash
    sudo rabbitmqctl set_permissions -p webdna-production django_server ".*" ".*" ".*"
    ```
    (Be sure to include the quotation marks in the command)
7. RabbitMQ should be ready for server use.

### Running Celery

This one is even easier. Celery is the server that handles executing jobs, but the server code is integrated with the Django code. To run the Celery server, just run the following:

```bash
./run_celery.sh
```
