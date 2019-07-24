#!/usr/bin/env python

# to execute 'chmod +x filename'

import sys

def main():

    input_seed = sys.argv[1]
    is_nb_sim = bool(sys.argv[2] == 'True')

    # set input file parameters, start
    nb_str = ''
    if is_nb_sim:
        nb_str += 'interaction_type = NBLOCK\nallow_pivot = true\n'
  
    sim_steps = 10**5
    temp = '293 k'
    print_interval = sim_steps / 1

    monte_sim = False

    if monte_sim:
        dt = 0.005
    else:
        dt = 0.000001
    # set input file parameters, end

    program_param = """##############################
        ####  PROGRAM PARAMETERS  ####
        ##############################
        backend = CPU
        backend_precision = double
        #debug = 1
        seed = {0} 
        {1}""".format(input_seed, nb_str) 


    sim_param = ''
    if monte_sim: 
        sim_param = """##############################
            ####    SIM PARAMETERS    ####
            ##############################
            sim_type = MC
            ensemble = NVT
            steps = {0}
            check_energy_every = 10000
            check_energy_threshold = 1.e-4

            refresh_vel = 0

            delta_translation = 0.10
            delta_rotation = 0.25
            T = {1}
            verlet_skin = 0.20\n""".format(sim_steps, temp) #consider raising verletskin
    else:
        sim_param = """##############################
            ####    SIM PARAMETERS    ####
            ##############################
            steps = {0}
            newtonian_steps = 103
            diff_coeff = 2.50
            thermostat = john

            refresh_vel = 1

            T = {1}
            dt = {2}
            verlet_skin = 0.05\n""".format(sim_steps, temp, dt)

 
    input_output = """##############################
        ####    INPUT / OUTPUT    ####
        ##############################
        topology = generated.top
        conf_file = generated.dat 
        lastconf_file = last_conf.dat
        trajectory_file = trajectory.dat
        log_file = sim_log.dat
        no_stdout_energy = 1
        restart_step_counter = 1
        energy_file = energy.dat
        print_conf_interval = {0}
        print_energy_every = {0}
        time_scale = linear
        external_forces = 0""".format(print_interval) # changed refresh_vel to 0 for MC sim


    input_file_as_str = program_param + sim_param + input_output

    res = ''
    # the following is necessary to remove leading spaces
    for line in input_file_as_str.split('\n'):
        res += line.strip() + '\n'

    sys.stdout.write(res)
    sys.stdout.flush()

if __name__ == '__main__':
    main()
