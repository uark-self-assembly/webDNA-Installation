import numpy as np

# get the ith 3D vector in a slice of a split line
get_vector = lambda i, words: np.array([float(x) for x in words[i*3:(i+1)*3]])

def get_file_lines(filename):
    inp = open(filename, 'r')
    lines = inp.readlines()
    inp.close()
    return lines

def get_particle_counts(filename):
    topology_lines = get_file_lines(filename)
    nnucl_plus_nnBLOCKS, nstrands = [int(x) for x in topology_lines[0].split()]
    nnBLOCKS = nnucl_plus_nnBLOCKS - len(topology_lines[1:])
    nnucl = nnucl_plus_nnBLOCKS - nnBLOCKS
    return [nnucl_plus_nnBLOCKS, nstrands, nnBLOCKS, nnucl]

def get_topology_data(filename, nb_data):
    topology_lines = get_file_lines(filename)

    i = 0
    j = 0
    for line in topology_lines[1:]:
        splitline = line.split()
        # 0 nblockid
        nb_data[0].append(int(splitline[0]))
        # 1 strandid
        nb_data[1].append(int(splitline[1])-1)
        # 2 basetype
        nb_data[2].append(splitline[2])
        # 3 nn3
        nb_data[3].append(int(splitline[3]))
        # 4 nn5
        nb_data[4].append(int(splitline[4]))
        
        # 5 nblockindex
        # if the list is empty, append 0, the index of the 1st np.
        if not nb_data[5]:
            nb_data[5].append(0)
        
        #else if the current nblockid is diff. from the previous
        elif (len(nb_data[0]) > 1 and nb_data[0][-1] != nb_data[0][-2]):
            # if we have already added nblock indices, account for file size difference, increment j
            if len(nb_data[5]) >= 2:
               j += 1
            nb_data[5].append(topology_lines.index(line) + j)

        # 6 n3index_nblockid, note this is a dict
        if nb_data[3][i] == -1:
           nb_data[6][i] = nb_data[0][-1]

        i += 1


def get_time_and_box(filename):
    config_lines = get_file_lines(filename)
    time = []
    time.append(int(config_lines[0].split()[2]))
    box = np.array([float(x) for x in config_lines[1].split()[2:]])
    return [time, box]


# TLF: TODO combine the next two funcitons 
def get_config_data(filename, nb_index, nb_data):
    global get_vector

    # slice is necessary to align future indexing between configuration and topology files
    config_lines = get_file_lines(filename)[3:]
    
    for line in config_lines:
        splitline = line.split()
        if config_lines.index(line) not in nb_index:
            # 0 rcs
            nb_data[0].append(get_vector(0,splitline))
            # 1 a1s
            nb_data[1].append(get_vector(1,splitline))
            # 3 a3s
            nb_data[3].append(get_vector(2,splitline))
            # 2 a2s == cross product of a1s and a2s
            nb_data[2].append(np.cross(nb_data[3][-1], nb_data[1][-1]))
        else:
            # 4 nb_rcs
            nb_data[4].append(get_vector(0,splitline))

def get_config_data_plus(filename, nb_index, nb_data):
    global get_vector

    # slice is necessary to align future indexing between configuration and topology files
    config_lines = get_file_lines(filename)[3:]
    
    for line in config_lines:
        splitline = line.split()
        if config_lines.index(line) not in nb_index:
            # 0 rcs
            nb_data[0].append(get_vector(0,splitline))
            # 1 a1s
            nb_data[1].append(get_vector(1,splitline))
            # 3 a3s
            nb_data[3].append(get_vector(2,splitline))
            # 2 a2s == cross product of a1s and a2s
            nb_data[2].append(np.cross(nb_data[3][-1], nb_data[1][-1]))
        else:
            # 4 nb_rcs
            nb_data[4].append(get_vector(0,splitline))
            # 5 nb_a1s
            nb_data[5].append(get_vector(1,splitline))
            # 6 nb_a3s
            nb_data[6].append(get_vector(2,splitline))

def get_config_data_section(conffile, particle_num, nb_index, nb_data):
    global get_vector
   
    for i in xrange(particle_num):
        line = conffile.readline()
        splitline = line.split()
        if i not in nb_index:
            # 0 rcs
            nb_data[0].append(get_vector(0,splitline))
            # 1 a1s
            nb_data[1].append(get_vector(1,splitline))
            # 3 a3s
            nb_data[3].append(get_vector(2,splitline))
            # 2 a2s == cross product of a1s and a2s
            nb_data[2].append(np.cross(nb_data[3][-1], nb_data[1][-1]))
        else:
            # 4 nb_rcs
            nb_data[4].append(get_vector(0,splitline))

def main():
    print 'in file io main'

if __name__=="__main__":
    main()
