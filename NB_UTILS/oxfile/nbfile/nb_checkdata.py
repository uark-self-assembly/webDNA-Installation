import sys
from nb_simdata import *
from nb_fileio import *

def check_np_loc_against_strandheads(config_file, topology_file):
   
    # sd = simulation data
    sd = NBSimulationData()
    sd.load_all_sim_data(topology_file, config_file)

    strandheads = {x+1:[] for x in xrange(sd.nnblocks)} 
   
    for i in xrange(sd.nnblocks):
        for j in xrange(sd.nnucleot):
            if sd.nn3[j] == -1 and j in sd.n3index_nblockid:
                nb_id = sd.n3index_nblockid[j]
                strandheads[nb_id].append(sd.rcs[j])
    nb_xyz = [] 
    for i in strandheads:
        xyz = []
        for head in strandheads[i]:
            distances_from_head = [np.linalg.norm(head-other_head) for other_head in strandheads[i]] 
            farthest_head = strandheads[i][distances_from_head.index(max(distances_from_head))]
            xyz.append([(h1+h2)/2. for h1, h2 in zip(head,farthest_head)])
        nb_xyz.append(np.array([sum(k)/float(len(xyz)) for k in zip(*xyz)]))

    for i,j in zip(sd.nb_rcs, nb_xyz):
        print 'Actual:\t\t{0}\nExpected:\t{1}\n'.format(i, j)

def main():
    check_np_loc_against_strandheads(sys.argv[1], sys.argv[2])

if __name__=="__main__":
    main()
