Extract WebDNA.zip
(Download the repository as a .zip)
(Right click on the downloaded .zip file and click extract)
(Rename folder to WebDNA if it is named anything else and move all the files so the directory looks like WebDNA/files, not WebDNA/WebDNA/files)

Install and Setup oxDNA
    Install dependencies
        sudo apt update
	sudo apt upgrade
	sudo apt-get install cmake
        cd WebDNA
	source oxBuild.sh
        
OxDNA installation and setup is complete.
    
    
Install and Setup Backend
    Install dependencies
        yes | source Install_1.sh
	
    Log into postgresql and build the database
	source Database.sh

    Install Django and perform migrations
	cd webdna-django-server
	pip3 install -r requirements.txt
	python3 manage.py migrate

    Setup Rabbit
	cd ..
	source Rabbit.sh
        
Backend installation and setup is complete.


Install and Setup Frontend
    Environment setup
	cd webdna-frontend
	source Install_2.sh
	
Reroute the server
	source nginx.sh

Frontend installation and setup is complete.
    

Run the Server
    To access the server
	cd ..
	source Terminals.sh
    (Open a web browser and navigate to localhost:8080)

WebDNA setup is complete
