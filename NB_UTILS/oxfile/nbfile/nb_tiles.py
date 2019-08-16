import sys
from nb_fileio import *
from nb_simdata import *

class Glue:
    def __init__(self, glue_list):
        self.glue_seq = [nucl.upper() for nucl in glue_list]
        self.glue_compliment = self.find_compliment()

    def find_compliment(self):
        comp = { 'A' : 'G', 'G' : 'A', 'C' : 'T', 'T' : 'C' }
        f = lambda nucl: comp[nucl]
        return map(f, self.glue_seq)

class Tile:
    def __init__(self, n, e, s, w):
        self.n_glue = n #None
        self.e_glue = e #None
        self.s_glue = s #None
        self.w_glue = w #None
        #self.glues = {} 
 
#class Tile

def main(topfile):
    sd = NBSimulationData()
    sd.load_particle_counts(topfile)
    sd.load_topology_data(topfile)

    #tiles = {

    print sd.nblockid
    print sd.strandid
    print sd.basetype
    

if __name__=="__main__":
    main(sys.argv[1])
