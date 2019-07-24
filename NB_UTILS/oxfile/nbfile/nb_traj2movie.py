#!/usr/bin/env python

'''
HOW TO USE THIS SCRIPT WITH UCSF CHIMERA:
   -To view simulation movies in UCSF Chimera, from the dropdown menu go to
        Tools -> MD/Ensemble Analysis -> MD Movie
   -This will open a pop-up window labeled 'Get Ensemble Info' (as of Chimera 1.9).
   -Make sure the parameters of this window are as follows:
        Trajectory format: PDB
        PDB frames contained in: single file
        File: browse to the .pdb file generated by this script, which 
              will be in the same directory that your trajectory.dat is in
        Use frames 'first' through 'last'
   -Once ready hit 'OK', which will bring up a second pop-up window, 'MD Movie: ...'.
   -To apply the Chimera commands file to your movie, from the dropdown menu go to
        Per-Frame -> Define Script
   -This will bring up another window 'Per-Frame Commands'. At the top of this window
   make sure 'Interpret script as ' is set to 'Chimera commands'. Next, in the bottom
   left of this window click 'Insert Text File'. Browse to the .com file generated by
   this script that is paired with the appropriate .pdb file.
   -And finally, select 'Apply' and then 'OK'.
'''

import sys, os
from nb_simdata import *
from nb_visfunctions import *

def main(conffile_name, topfile_name):
    sd = NBSimulationData()
    sd.load_topology_data(topfile_name)

    # chimera commands
    com_list = get_chimera_commands(sd)
    chimera_file = conffile_name + '.com'
    out = open(chimera_file, 'w')
    for command in com_list:
        print >> out, command
    out.close()

    conffile = open(conffile_name, 'r')
    outfile_name = conffile_name + '.pdb'
    outfile = open (outfile_name, 'w')
    conf_num = 0

    # 'stream_config_data' will return true while there are still
    # configurations to read from the file.
    # it also takes care of file closing
    while sd.stream_config_data(conffile, outfile, conf_num):
        pdb_str = get_pdb_str(sd, conf_num) 
        outfile.write(pdb_str)
        conf_num += 1

if __name__ == "__main__":
    conffile_name = sys.argv[1]
    topfile_name = sys.argv[2]
    main(conffile_name, topfile_name)
