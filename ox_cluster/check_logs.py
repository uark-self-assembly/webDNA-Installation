#!/usr/bin/env python

import os
import sys
from subprocess import *

# TODO: allow arg. for summarized results, organize data to be more readable.

def check_logs():
    enclosing_dir = os.path.join(os.path.abspath('.'), sys.argv[1])
    os.chdir(enclosing_dir)

    cmd_str = 'ls | grep "job_[0-9]" | wc -l'
    number_of_jobs = int(get_shell_cmd_output(cmd_str))

    log_file = 'sim_log.dat'

    sum = 0
    count = 0.
    survivors = 0
    neighbors = []

    for i in range(number_of_jobs):
        job_dir = 'job_{0}'.format(i)
        os.chdir(job_dir)
        log_exists = (os.path.isfile(log_file) == True)

        if log_exists:
            # report status
            with open(log_file) as log_f:
                job_status = 'crashed!' if 'ERROR' in log_f.read() else 'no errors.'
                print '{0} has {1}'.format(job_dir, job_status)
            # init lines
            with open(log_file) as log_f: lines = log_f.readlines()

            error_line = ''
            seed_line = ''
            list_updates = ''
            for l in lines:
                error_line = l if 'ERROR' in l else error_line
                seed_line = l if 'RNG' in l else seed_line
                list_updates = l if 'Lists updated' in l else list_updates

            if error_line: 
                nucl0 = error_line.split()[10]
                nucl1 = error_line.split()[12]
                neighbors.append((nucl0, nucl1))
                print '\t{0}'.format(error_line.strip())
            else:
                survivors += 1

            if list_updates: 
                updates = int([x for x in list_updates.split()][3])
                sum += updates
                count += 1.
                print '\tList updates:\t{0}'.format(updates)

            if seed_line: 
                seed = [x for x in seed_line.split()][-1]
                print '\tSeed:\t\t{0}'.format(seed)

            print

        else:
            print 'No {0} in {1}'.format(log_file, job_dir)
            
        os.chdir('..')

    print '='*20
    print 'OVERALL STATS'
    print '='*20

    if sum and count:
        print '\n\tAverage number of list updates: {0}\n'.format(sum / count)

    print '\tNumber of survivors: {0} out of {1}\n'.format(survivors, number_of_jobs)

    neighbors_set = set(neighbors)
    neighbors_res = []
    for pair in neighbors_set:
        pair_count = neighbors.count(pair)
        str = '{0:12} caused {1} error(s).'.format(pair, pair_count)
        neighbors_res.append((pair_count, str, pair))

    with open('job_0/generated.top') as f:
        lines = f.readlines()[1:]

    nucl_type = dict((lines.index(l) + int(l.split()[0]), l.split()[2]) for l in lines)

    for t in sorted(neighbors_res, key=lambda tup: tup[0]):
        type0 = '{0:3}= {1}'.format(t[2][0], nucl_type[int(t[2][0])])
        type1 = '{0:3}= {1}'.format(t[2][1], nucl_type[int(t[2][1])])
        print '\t', t[1], type0, type1
        

def get_shell_cmd_output(cmd_str):
    return Popen(cmd_str, stdout=PIPE, shell=True).communicate()[0]

if __name__ == '__main__':
    if len(sys.argv[1:]) != 1:
        print 'Usage {0} <dir. of jobs>'.format(sys.argv[0])
        sys.exit()
    else:
        check_logs()
