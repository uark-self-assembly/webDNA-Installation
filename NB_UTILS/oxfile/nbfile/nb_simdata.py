import nb_fileio as io
import numpy as np

class NBSimulationData:
    def __init__(self):
        # topology data
        self.nparticles = None
        self.nstrands = None
        self.nnblocks = None
        self.nnucleot = None

        self.nblockid = []
        self.strandid = []
        self.basetype = []
        self.nn3 = []
        self.nn5 = []
        self.nblockindex = []
        self.n3index_nblockid = {}

        # configuration data
        self.times = []
        self.box = np.array([1., 1., 1.]) 
        # nucleotide
        self.rcs = []
        self.a1s = []
        self.a2s = []
        self.a3s = []
        # nBLOCK
        self.nb_rcs = []
        self.nb_cdm = []
        # nucleotides + nBLOCKs
        self.overall_cdm = []

    def load_particle_counts(self, topfile):
        [self.nparticles, self.nstrands, self.nnblocks, self.nnucleot] = io.get_particle_counts(topfile)

    def load_topology_data(self, topfile):
        self.load_particle_counts(topfile)
        nb_data = [self.nblockid, self.strandid, self.basetype, self.nn3, self.nn5, self.nblockindex, self.n3index_nblockid]
        io.get_topology_data(topfile, nb_data)

    def load_time_and_boxdim(self, conffile):
        self.times, self.box = io.get_time_and_box(conffile)

    def load_config_data(self, conffile):
        nb_data = [self.rcs, self.a1s, self.a2s, self.a3s, self.nb_rcs]
        io.get_config_data(conffile, self.nblockindex, nb_data)

    # plus
    def load_config_data_plus(self, conffile):
        nb_data = [self.rcs, self.a1s, self.a2s, self.a3s, self.nb_rcs, self.nb_a1s, self.nb_a3s]
        io.get_config_data_plus(conffile, self.nblockindex, nb_data)

    def load_all_sim_data(self, topfile, conffile):
        self.load_particle_counts(topfile)
        self.load_topology_data(topfile)
        self.load_time_and_boxdim(conffile)
        self.load_config_data(conffile)

    # plus
    def load_all_sim_data_plus(self, topfile, conffile):
        self.nb_a1s = []
        self.nb_a3s = []

        self.load_particle_counts(topfile)
        self.load_topology_data(topfile)
        self.load_time_and_boxdim(conffile)
        self.load_config_data_plus(conffile)

    def stream_config_data(self, conffile, outfile, nconfs):
        try:
            # time
            self.times.append(int(conffile.readline().split()[2]))
            # box
            self.box = np.array([float(x) for x in conffile.readline().split()[2:]])
            # remove energy line
            conffile.readline() 
            print "## conf %i, time %i" % (nconfs, self.times[nconfs])

            if (nconfs == 0):
                print 'number of particles: {0}'.format(self.nparticles)
                print 'number of strands: {0}'.format(self.nstrands)
                print 'number of nBLOCKS: {0}'.format(self.nnblocks)
                print 'number of nucleotides: {0}'.format(self.nnucleot)
            else:
                del self.rcs[:]
                del self.a1s[:]
                del self.a2s[:]
                del self.a3s[:]
                del self.nb_rcs[:]

            nb_data = [self.rcs, self.a1s, self.a2s, self.a3s, self.nb_rcs]
            io.get_config_data_section(conffile, self.nparticles, self.nblockindex, nb_data)
            return True 
        except:
            conffile.close()
            outfile.close()
            print '## There is no conf %i, Finished!!' % (nconfs)
            return False 

