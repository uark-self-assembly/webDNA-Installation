#!/usr/bin/env python

import os
import sys
import random

def run_ox():
    # given by MPI
    my_rank = int(sys.argv[1])

    enclosing_dir = os.path.join(os.path.abspath('.'), sys.argv[2])

    exe_path = sys.argv[3]
    abs_exe_path = os.path.abspath(exe_path)

    is_nb_sim = sys.argv[4]

    os.chdir(enclosing_dir)

    min = 1
    max = 2**15 - 1
    seed = random.randint(min, max) 

    conf = '../../generated.dat'
    top = '../../generated.top'

    # create unique directory for this job, also cd into it
    job_dir = 'job_{0}'.format(my_rank)
    os.system('mkdir {0}'.format(job_dir))
    os.chdir(job_dir)

    # copy in shared files for the oxDNA executable
    os.system('cp {0} {1}'.format(conf, '.'))
    os.system('cp {0} {1}'.format(top, '.'))

    # generate unique input (diff. by seed only)
    os.system('../../ox_input.py {0} {1} > input'.format(seed, is_nb_sim))

    # run oxDNA
    os.system('{0} input'.format(abs_exe_path))

if __name__ == '__main__':
    run_ox()
