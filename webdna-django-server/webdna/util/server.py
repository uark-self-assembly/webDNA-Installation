import os
import webdna.defaults as defaults


##
# Getters for project folders/files
##
def get_project_folder_path(project_id):
    return os.path.join('server-data', 'server-projects', str(project_id))


def get_project_file(project_id, project_file):
    if isinstance(project_file, str):
        return os.path.join(get_project_folder_path(project_id), project_file)
    else:
        return os.path.join(get_project_folder_path(project_id), project_file.value)


def get_simulation_folder_path():
    return os.path.join('server-data', 'server-sims')


def get_simulation_file_paths(project_id):
    sim_output_path = get_simulation_folder_path()
    pdb_file_path = os.path.join(sim_output_path, str(project_id) + '.pdb')
    xtc_file_path = os.path.join(sim_output_path, str(project_id) + '.xtc')
    return pdb_file_path, xtc_file_path


def get_analysis_folder_path(project_id):
    return os.path.join(get_project_folder_path(project_id), 'analysis')


def get_analysis_file_path(project_id, analysis_file):
    if isinstance(analysis_file, str):
        return os.path.join(get_analysis_folder_path(project_id), analysis_file)
    else:
        return os.path.join(get_analysis_folder_path(project_id), analysis_file.value)


def get_analysis_script_file_path(project_id, script_name):
    return os.path.join(get_analysis_folder_path(project_id), script_name)


def get_user_folder_path(user_id):
    return os.path.join('server-data', 'server-users', str(user_id))


def get_user_scripts_folder_path(user_id):
    return os.path.join(get_user_folder_path(user_id), 'scripts')


def get_user_script(user_id, script_file_name):
    return os.path.join(get_user_scripts_folder_path(user_id), script_file_name)


##
# Check the existence of project folders/files
##
def project_folder_exists(project_id):
    return os.path.exists(get_project_folder_path(project_id))


def project_file_exists(project_id, project_file):
    return os.path.exists(get_project_file(project_id, project_file))


def simulation_files_exist(project_id):
    (pdb_file_path, xtc_file_path) = get_simulation_file_paths(project_id)
    return os.path.exists(pdb_file_path) and os.path.exists(xtc_file_path)


def analysis_folder_exists(project_id):
    return os.path.exists(get_analysis_folder_path(project_id))


def analysis_file_exists(project_id, analysis_file):
    return os.path.exists(get_analysis_file_path(project_id, analysis_file))


def analysis_script_file_exists(project_id, script_name):
    return os.path.exists(get_analysis_script_file_path(project_id, script_name))


def user_folder_exists(user_id):
    return os.path.exists(get_user_folder_path(user_id))


def user_scripts_folder_exists(user_id):
    return os.path.exists(get_user_scripts_folder_path(user_id))


def user_script_exists(user_id, script_file_name):
    return os.path.exists(get_user_script(user_id, script_file_name))


##
# Utility functions for projects
##
def clean_project(project_id):
    files = [
        'trajectory.pdb',
        'trajectory.dat',
        'last_conf.dat',
        'log.dat',
        defaults.DEFAULT_STDOUT_FILE_NAME,
        'energy.dat',
        os.path.join('analysis', 'output.txt')]

    project_folder_path = get_project_folder_path(project_id)

    for file in files:
        file_path = os.path.join(project_folder_path, file)
        if os.path.isfile(file_path):
            os.remove(file_path)
        else:
            continue


##
# Utility functions for the server
##
def initialize_all_folders():
    # TODO (jace) initialize folders like:
    #     server-data/server-projects/
    #     server-data/server-sims/
    #     server-data/server-users/
    pass
