#!/usr/bin/env python
import sys, os
from nb_fileio import * 
from nb_simdata import *
from nb_visfunctions import *

# TLF: TODO write a function that checks 
#      that data isnt in movie format

def main(conffile, topfile):
    sd = NBSimulationData()

    sd.load_all_sim_data(topfile, conffile)

    pdb_str = get_pdb_str(sd)
    pdbfile = conffile + '.pdb'
    out = open(pdbfile, 'w')
    out.write(pdb_str)
    out.close()

    com_list = get_chimera_commands(sd)
    chimera_file = conffile + '.com'
    out = open(chimera_file, "w")
    for command in com_list: 
        print >> out, command
    out.close() 

if __name__=="__main__":
    conffile = sys.argv[1]
    topfile = sys.argv[2]
    main(conffile, topfile)
