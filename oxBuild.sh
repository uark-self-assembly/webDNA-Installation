#!/bin/bash
cd oxDNA
sed -i 's/-6//g' CMakeLists.txt
mkdir build
cd build
cmake ..
make -j4

export PATH="/usr/local/bin/oxDNA/build/bin:/usr/local/bin/oxDNA/UTILS:$PATH"

cd ../UTILS
chmod +wx *.py
sed -i '1i #!/usr/bin/env python2' *.py
cd ../..
