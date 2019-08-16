#!/usr/bin/env python

import sys, os
import numpy as np
from nb_fileio import * 
from nb_simdata import *
from nb_model_misc import * 

strtypes = ["ALA","GLY","CYS","TYR","ARG","PHE","LYS","SER","PRO","VAL","ASN","ASP"]

# TLF : TODO
# potentially change get_pdb_str up so that if there are multiple nblocks 
# they aren't considered one molecule in chimera.
# this would allow us to move them individually

def get_pdb_str(sd, conf_num=0):

    global strtypes

    # nblock-wise periodic boundary conditions
    # when no nBLOCK lies outside of box, sd.overall_cdm is just the average of the nBLOCK mass centers
    # if there is a nBLOCK outside of the box, then the nBLOCK is adjusted back inside

    # sd.nb_cdm == centre de mass of each nBLOCK 
    #   or the sum of the position vectors of each particle associated to an NB 
    #   divided by the number of particles in the nBLOCK
    #sd.nb_cdm = [np.array([0.,0.,0.]) for x in xrange(sd.nnblocks)]
    sd.nb_cdm = [np.array([0.,0.,0.]) for x in xrange(sd.nnblocks)]
    particle_num_byNB = [0 for x in xrange(sd.nnblocks)]

    for i in xrange(sd.nnucleot):
        sd.nb_cdm[sd.nblockid[i]-1] += sd.rcs[i]
        particle_num_byNB[sd.nblockid[i]-1] += 1

    for i in xrange(sd.nnblocks):
        sd.nb_cdm[i] += sd.nb_rcs[i]
        particle_num_byNB[i] += 1

    # sd.overall_cdm == overall centre de mass of the system 
    #   the summed cmds adjusted by a box factor if necessary, divided by total number of nBLOCKS
    sd.overall_cdm = np.array([0.,0.,0.])
    for i in xrange(sd.nnblocks):
        sd.nb_cdm[i] /= particle_num_byNB[i]
        sd.overall_cdm += sd.nb_cdm[i] - sd.box * np.rint(sd.nb_cdm[i] / sd.box)
    sd.overall_cdm /= float(sd.nnblocks)

    # header
    pdb_str = 'HEADER\tframe t = {0}\nMODEL {1}\n'.format(sd.times[-1], conf_num)

    # nano-particles
    recordName = "HET"
    hetID = "AU"
    chainID = "A"
    seqNum = 1
    iCode = ' '
    numHetAtoms = sd.nnblocks
    pdb_str += '{0:6} {1:>3}{2:>3}{3:4}{4:1}{5:3}\n'.format(recordName, hetID, chainID, seqNum, iCode, numHetAtoms) 

    recordName = 'HETNAM'
    hetID = 'AU'
    text = 'GOLD ION' # 'chemical name' in PDB format
    pdb_str +='{0:6}      {1:3}{2:54}\n'.format(recordName, hetID, text)

    # TLF: eventually fix format specifiers.
    pdb_str += 'FORMUL   2  AU     2(AU 1+)\n'


    index_jump = 2
    for i in xrange(sd.nnucleot):
        nbid = sd.nblockid[i] - 1
        rnow = sd.rcs[i] - sd.nb_cdm[nbid] + (sd.nb_cdm[nbid] - sd.overall_cdm) - sd.box * np.rint((sd.nb_cdm[nbid] - sd.overall_cdm) / sd.box) 

        # start: backbone site pdb spec
        serial = (index_jump * i) + sd.nnblocks + 1 
        name = 'A'
        resName = strtypes[((sd.strandid[i] + 1) % len(strtypes))]
        chainID = 'A'
        resSeq = i + sd.nnblocks + 1
        iCode = ' '
        x, y, z = rnow + POS_BACK * sd.a1s[i]

        occupancy = 1
        tempFactor = 7.895

        pdb_str += 'ATOM  %5d %4s %3s %c%4d%c   %8.3f%8.3f%8.3f%6.2f%6.2f\n' % (serial, name, resName, chainID, resSeq, iCode, x, y, z, occupancy, tempFactor)
        pdb_str += 'ANISOU%5d %4s %3s %c%4d%c %7i%7i%7i%7i%7i%7i\n' % (serial, name, resName, chainID, resSeq, iCode, 1000, 1000, 1000, 0, 0, 0)
        # end: backbone site pdb spec

            
        # start: base site pdb spec
        serial = (index_jump * i) + sd.nnblocks + 3  
        name = base_number_to_name[base_to_number[sd.basetype[i]]] 
        resName = strtypes[((sd.strandid[i] + 1) % len(strtypes))]
        chainID = 'C'
        resSeq = i + sd.nnblocks + 1
        iCode = ' '
        x, y, z = rnow + (POS_BACK + 0.68) * sd.a1s[i]
        occupancy = 1
        tempFactor = 6.316 
        U = anisotropic_temperature_factors(i, sd.a1s, sd.a2s, sd.a3s) 

        pdb_str += 'ATOM  %5d %4s %3s %c%4d%c   %8.3f%8.3f%8.3f%6.2f%6.2f\n' % (serial, name, resName, chainID, resSeq, iCode, x, y, z, occupancy, tempFactor)
        pdb_str += 'ANISOU%5d %4s %3s %c%4d%c %7i%7i%7i%7i%7i%7i\n' % (serial, name, resName, chainID, resSeq, iCode, U[0,0], U[1,1], U[2,2], U[0,1], U[0,2], U[1,2])
        # end: base site pdb spec

    for i in xrange(sd.nnblocks):
        nb_xyz = sd.nb_rcs[i] - sd.nb_cdm[i] + (sd.nb_cdm[i] - sd.overall_cdm) - sd.box * np.rint((sd.nb_cdm[i] - sd.overall_cdm) / sd.box) 
        serial = i + 1
        name = 'AU'
        resName = 'AU' 
        chainID = 'A'
        resSeq = i + 1 
        iCode = ' '
        occupancy = 1
        element = 'AU' 
        pdb_str += 'HETATM%5d%3s  %4s %c%4d%c   %8.3f%8.3f%8.3f%6.2f%18s\n' % (serial, name, resName, chainID, resSeq, iCode, nb_xyz[0], nb_xyz[1], nb_xyz[2], occupancy, element)

    #pdb_res += "REMARK  ######### \n\nTER \nENDML \n "
    return pdb_str

def get_chimera_commands(sd, model_num=0):
    global strtypes

    # generate commands.com to read with UCSF Chimera
    chimera_colors = ['sandy brown', 'blue', 'red', 'green', 'yellow', 'plum', 'sandy brown']
    mycolors = [chimera_colors[i % len(chimera_colors)] for i in range(len(strtypes))]
    com_list = []

    com_list.append('set bg_color white')
    com_list.append('~bond #%d' % model_num)

    # make the bonds within each nucleotide
    for i in xrange(sd.nnucleot):
        com_list.append('bond #%d:%i' % (model_num, i + sd.nnblocks + 1))

    # make the bonds between nucleotide backbones
    for i in xrange(sd.nnucleot):
        if sd.nn5[i] >= 0:
            com_list.append('bond #%d:%i.A,%i.A' % (model_num, i + sd.nnblocks + 1, i + sd.nnblocks + 2))
        if sd.nn3[i] == -1 and i in sd.n3index_nblockid:
            com_list.append('bond #%d:%i.A,%i.A' % (model_num, i + sd.nnblocks + 1, sd.n3index_nblockid[i]))
            
    for i in range (len(strtypes)):
        com_list.append('color %s #%d:%s' % (mycolors[i], model_num, strtypes[i]))
        com_list.append('col cyan #%d:%s@O' % (model_num, strtypes[i]))
        com_list.append('col coral #%d:%s@S' % (model_num, strtypes[i]))
        com_list.append('col yellow #%d:%s@K' % (model_num, strtypes[i]))
        com_list.append('col cornflower blue #%d:%s@P' % (model_num, strtypes[i]))
        com_list.append('bondcolor %s #%d:%s' % (mycolors[i], model_num, strtypes[i]))

    com_list.append('aniso scale 0.75 smoothing 1')
    com_list.append('setattr m stickScale 0.6 #%d' % (model_num))

    return com_list
