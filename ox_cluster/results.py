#!/usr/bin/env python

import os
import sys
import random
from subprocess import *

base_h_bonds_script = '../../../oxDNA/UTILS/nb_h_bonds.py'


def results():
    enclosing_dir = os.path.join(os.path.abspath('.'), sys.argv[1])
    os.chdir(enclosing_dir)

    ox_input = ''
    trajectory = ''

    f = open('h_bonds_by_job.txt', 'w+')

    cmd_str = 'ls | grep "job_[0-9]" | wc -l'
    number_of_jobs = int(get_shell_cmd_output(cmd_str))

    for i in range(number_of_jobs):
        job_dir = 'job_{0}'.format(i)
        print >> f, '\n'
        print >> f, job_dir

        if job_data_exists(job_dir, f):
            os.chdir(job_dir)
            is_nb_job = get_job_scope()
            if is_nb_job:
                analysis_dir = '{0}_analysis'.format(job_dir)
                # make new directory for analysis files.
                if not os.path.isdir(analysis_dir):
                    os.system('mkdir {0}'.format(analysis_dir))
                os.chdir(analysis_dir)
                ox_input, traj = format_analysis_input_files()
                h_bonds_script = '../' + base_h_bonds_script
            else:
                ox_input = 'input'
                traj = 'trajectory.dat'
                h_bonds_script = base_h_bonds_script

            cmd_str = '{0} {1} {2}'.format(h_bonds_script, ox_input, traj)
            job_result = get_shell_cmd_output(cmd_str)

            print >> f, job_result 
            print 'Finished {0}'.format(job_dir)

            if is_nb_job: os.chdir('..')
            os.chdir('..')

    f.close()

def get_shell_cmd_output(cmd_str):
    return Popen(cmd_str, stdout=PIPE, shell=True).communicate()[0]

def job_data_exists(job_dir, file):
    a_job_exists = os.path.isdir(job_dir)
    # check that the necessary files exist
    input_exists = os.path.isfile(job_dir + '/input')
    traj_exists = os.path.isfile(job_dir + '/trajectory.dat')

    def check_for_sim_data():
        with open('./{0}/trajectory.dat'.format(job_dir)) as f: 
            if 't =' not in f.read(): return True
            else: False

    if not (a_job_exists and input_exists and traj_exists):
        print >> file, '# Insufficient data to analyze {0}'.format(job_dir)
        return False
    elif check_for_sim_data():
        print >> file, '# No simulation data in trajectory.dat, cannot perform analysis for {0}'.format(job_dir)
        return False
    else:
        return True

def get_job_scope():
    with open('input') as f:
        return True if 'NBLOCK' in f.read() else False

def get_lines(file_name):
    with open(file_name) as f:
        return f.readlines()

def make_seq_from_topo(xs):
    xss = []
    max = 0
    for i in xs[1:]:
        i_split = i.split()
        nb_id = int(i_split[0])
        if max < nb_id:
            xss.append('N')
            max = nb_id
        xss.append(i_split[2])
    return xss

def write_str_to_file(file_name, s):
    with open(file_name, 'w+') as f:
        f.write(s)

def format_analysis_input_files():
    new_topo_file = 'gen_analysis.top'
    new_input_file = 'input_analysis'
    new_traj_file = 'traj_analysis.dat'

    input_lines = get_lines('../input')

    topo_lines = get_lines('../generated.top')  
    traj_lines = get_lines('../trajectory.dat')
    base_len = len(get_lines('../generated.dat'))

    # get sequences.sqs data, START
    seq_lines = make_seq_from_topo(topo_lines)

    # make new input file, START
    for i in range(len(input_lines)):
        line = input_lines[i].strip()
        if not line.startswith('#'):
            if 'topology' in line:
                input_lines[i] = 'topology = {0}\n'.format(new_topo_file)
            elif 'trajectory_file' in line:
                input_lines[i] = 'trajectory_file = {0}\n'.format(new_traj_file)
            elif 'interaction_type = NBLOCK' in line:
                input_lines[i] = '#{0}'.format(input_lines[i])
            elif 'allow_pivot = true' in line:
                input_lines[i] = '#{0}'.format(input_lines[i])

    write_str_to_file(new_input_file, ''.join(input_lines))
    # make new input file, END

    # make new topology file, START
    nnucl_plus_nnBLOCKS, nstrands = [int(x) for x in topo_lines[0].split()]
    nnBLOCKS = nnucl_plus_nnBLOCKS - len(topo_lines[1:])
    nnucl = nnucl_plus_nnBLOCKS - nnBLOCKS
    new_topo_str = '{0} {1}\n'.format(nnucl, nstrands)
    for l in topo_lines[1:]:
        new_topo_str += ' '.join(l.split()[1:]) + '\n'
   
    write_str_to_file(new_topo_file, new_topo_str) 
    # make new topology file, END

    # make new trajectory file, START    

    # begin by cleaning up seq_lines
    f0 = lambda s : s.strip()
    f1 = lambda s : list(s)
    seq_xs = [j for i in seq_lines for j in f1(f0(i))]

    config_number = len(traj_lines) / base_len
    assert config_number * base_len == len(traj_lines) 

    configs = [(i * base_len, (i+1) * base_len) for i in range(config_number)]
    traj_configs = [traj_lines[i:j] for (i, j) in configs]
    
    new_traj_str = '' 
    for traj_xs in traj_configs:
        tuple_xs = zip(seq_xs, traj_xs[3:])
        # filter out the nano-particle trajectories.
        xs = traj_xs[:3] + [data for (seq_nucl, data) in tuple_xs if seq_nucl != 'N']
        new_traj_str += ''.join(xs)

    write_str_to_file(new_traj_file, new_traj_str)
    # make new trajectory file, END

    return new_input_file, new_traj_file
        

if __name__ == '__main__':
    if len(sys.argv[1:]) != 1:
        print 'Usage {0} <dir. of jobs to analyze>'.format(sys.argv[0])
        sys.exit()
    else:
        results()
