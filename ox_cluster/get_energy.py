#!/usr/bin/env python

import os
import sys
from subprocess import *

def get_energy():
    enclosing_dir = os.path.join(os.path.abspath('.'), sys.argv[1])
    os.chdir(enclosing_dir)

    cmd_str = 'ls | grep "job_[0-9]" | wc -l'
    number_of_jobs = int(get_shell_cmd_output(cmd_str))

    energy_file = 'energy.dat'

    summary = 'energy_by_job.txt'
    f = open(summary, 'w+')

    sum = 0
    count = 0.
    survivors = 0
    neighbors = []

    for i in range(number_of_jobs):
        job_dir = 'job_{0}'.format(i)
        os.chdir(job_dir)
        energy_exists = (os.path.isfile(energy_file) == True)

        if energy_exists:
            print >> f, '\n'
            print >> f, job_dir

            xs0 = ['TIME']
            xs1 = ['TOTAL']
            xs2 = ['KINETIC']
            xs3 = ['POTENTIAL']
            #lines = open(energy_file).readlines()
            #for l in lines:
            with open(energy_file) as e_file:
                for line in e_file:
                    m = line.strip().split('  ')
                    xs0.append(m[0])
                    xs1.append(m[1])
                    xs2.append(m[2])
                    xs3.append(m[3])
            
            for l in zip(xs0, xs1, xs2, xs3):
                #     time,  total, kin.,  pot.
                s = '{0:>11}\t{1:>11}\t{2:>11}\t{3:>11}'.format(l[0], l[1], l[2], l[3])
                print >> f, s
                
            print >> f, '\n'

        else:
            print 'No {0} in {1}'.format(energy_file, job_dir)
            
        os.chdir('..')

    f.close()

def get_shell_cmd_output(cmd_str):
    return Popen(cmd_str, stdout=PIPE, shell=True).communicate()[0]

if __name__ == '__main__':
    if len(sys.argv[1:]) != 1:
        print 'Usage {0} <dir. of jobs>'.format(sys.argv[0])
        sys.exit()
    else:
        get_energy()
