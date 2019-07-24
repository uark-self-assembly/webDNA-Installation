import os
import jsonpickle
import subprocess
import webdna.util.server as server
import webdna.util.file as file_util

from zipfile import ZipFile
from typing import List, Dict, Optional

from webdna.defaults import ProjectFile
from webdna.models import Project

MAX_STEPS = 2000000000


class Generation:
    def __init__(self, method: str = None, arguments: List = None, orig: 'Generation' = None, dictionary: Dict = None):
        if orig is not None:
            self.copy(orig)
        elif dictionary is not None:
            self.load(dictionary)
        else:
            self.method: str = method
            self.arguments: List = []
            self.files = []
            if method == 'generate-sa':
                self.files = [ProjectFile.SEQUENCE.value]
                self.arguments = ['generate-sa.py'] + arguments + self.files
            elif method == 'generate-folded':
                self.files = [ProjectFile.SEQUENCE.value]
                self.arguments = ['generate-folded.py'] + arguments + self.files
            elif method == 'cadnano-interface':
                self.files = [ProjectFile.CADNANO.value]
                self.arguments = ['cadnano_interface.py'] + self.files + arguments

            if self.files is None:
                raise ValueError('Value of method argument not valid')

    def copy(self, orig: 'Generation'):
        self.method = orig.method
        self.files = orig.files
        self.arguments = orig.arguments

    def load(self, dictionary: Dict):
        self.method = dictionary['method']
        self.files = dictionary['files']
        self.arguments = dictionary['arguments']


class ProjectSettings:
    def __init__(self, name: str, generation: Optional[Generation] = None, script_chain: Optional[List[str]] = None,
                 execution_time: Optional[int] = None):
        self.name = name
        if generation:
            self.generation = Generation(orig=generation)
        else:
            self.generation = None
        if script_chain:
            self.script_chain = script_chain
        else:
            self.script_chain = None
        if execution_time:
            self.execution_time = execution_time
        else:
            self.execution_time = None


def get_project_settings(project_id: str) -> ProjectSettings:
    project_settings_file_path = server.get_project_file(project_id, ProjectFile.SETTINGS)
    return jsonpickle.decode(file_util.get_file_contents_as_string(project_settings_file_path))


def save_project_settings(project_id: str, project_settings: ProjectSettings):
    project_settings_file_path = server.get_project_file(project_id, ProjectFile.SETTINGS)
    file_util.write_string_to_file(jsonpickle.encode(project_settings), project_settings_file_path)


def add_settings(project_id: str, settings: Dict):
    project_settings = get_project_settings(project_id)
    if project_settings is not None and project_settings.generation is not None:
        if project_settings.generation.method:
            settings['generation_method'] = project_settings.generation.method


def initialize_project(project: Project):
    project_folder_path = server.get_project_folder_path(project.id)
    os.makedirs(project_folder_path, exist_ok=True)

    analysis_folder_path = server.get_analysis_folder_path(project.id)
    os.makedirs(analysis_folder_path, exist_ok=True)

    default_project_settings = ProjectSettings(name=project.name, generation=None)
    save_project_settings(project.id, default_project_settings)


def is_executable(project_id: str, regenerate: bool) -> bool:
    input_file = server.get_project_file(project_id, ProjectFile.INPUT)

    if not os.path.isfile(input_file):
        return False

    project_settings = get_project_settings(project_id)
    generation_method = project_settings.generation.method

    if generation_method == 'generate-sa' or generation_method == 'generate-folded':
        if regenerate:
            sequence_file = server.get_project_file(project_id, ProjectFile.SEQUENCE)
            if os.path.isfile(sequence_file):
                return True
            else:
                return False
        else:
            generated_top = server.get_project_file(project_id, ProjectFile.GENERATED_TOP)
            generated_dat = server.get_project_file(project_id, ProjectFile.GENERATED_DAT)
            if os.path.isfile(generated_dat) and os.path.isfile(generated_top):
                return True
            else:
                return False
    elif generation_method == 'cadnano-interface':
        if regenerate:
            cadnano_project_file = server.get_project_file(project_id, ProjectFile.CADNANO)
            if os.path.isfile(cadnano_project_file):
                return True
            else:
                return False
        else:
            generated_top = server.get_project_file(project_id, ProjectFile.GENERATED_TOP)
            generated_dat = server.get_project_file(project_id, ProjectFile.GENERATED_DAT)
            if os.path.isfile(generated_dat) and os.path.isfile(generated_top):
                return True
            else:
                return False
    else:
        return False


def zip_simulation(project_id: str) -> Optional[str]:
    project_zip_path = server.get_project_file(project_id, ProjectFile.SIMULATION_ZIP)
    if server.simulation_files_exist(project_id):
        (pdb_file_path, xtc_file_path) = server.get_simulation_file_paths(project_id)

        with ZipFile(project_zip_path, 'w') as archive:
            archive.write(pdb_file_path, 'trajectory.pdb')
            archive.write(xtc_file_path, 'trajectory.xtc')
        return project_zip_path
    return None


def zip_project(project_id: str) -> Optional[str]:
    project_folder_path = server.get_project_folder_path(project_id)
    project_zip_path = server.get_project_file(project_id, ProjectFile.PROJECT_ZIP)

    if server.project_folder_exists(project_id):
        if os.path.exists(project_zip_path):
            os.remove(project_zip_path)

        with ZipFile(project_zip_path, 'w') as archive:
            for (dir_path, dir_names, file_names) in os.walk(project_folder_path):
                file_names_len = len(file_names)
                for i in range(0, file_names_len):
                    if '.zip' in file_names[i]:
                        continue
                    archive.write(os.path.join(dir_path, file_names[i]), file_names[i])
        return project_zip_path
    return None


def convert_dat_to_pdb(project_id: str) -> bool:
    if not server.project_file_exists(project_id, ProjectFile.TRAJECTORY_DAT) \
            or not server.project_file_exists(project_id, ProjectFile.GENERATED_TOP):
        return False

    project_folder_path = server.get_project_folder_path(project_id)
    process = subprocess.Popen(["traj2pdb.py", "trajectory.dat", "generated.top", "trajectory.pdb"],
                               cwd=project_folder_path)
    process.wait()
    return True


def convert_pdb_to_xtc(input_file_path: str, output_file_path: str):
    print('gmx trjconv -f {} -o {}'.format(input_file_path, output_file_path))
    process = subprocess.Popen(["gmx", "trjconv", "-f", input_file_path, "-o", output_file_path],
                               cwd=os.getcwd(), stdout=subprocess.DEVNULL,
                               stderr=subprocess.DEVNULL)
    process.wait()


def convert_pdb_to_single_frame(input_file_path: str, output_file_path: str):
    output_file = open(output_file_path, 'w')

    try:
        with open(input_file_path) as infile:
            for line in infile:
                if 'ENDMDL' not in line:
                    output_file.write(line)
                else:
                    output_file.write('ENDMDL')
                    break
    except FileNotFoundError:
        pass

    output_file.close()


def generate_sim_files(project_id: str) -> bool:
    # Firstly, convert the 'trajectory.dat' file to 'trajectory.pdb'
    if not convert_dat_to_pdb(project_id):
        return False

    # If the 'server-sims' directory doesn't exist, make it here
    os.makedirs(server.get_simulation_folder_path(), exist_ok=True)

    # Get the file paths for the output simulation PDB and XTC files
    (pdb_file_path, xtc_file_path) = server.get_simulation_file_paths(project_id)

    # The original 'trajectory.pdb' that will be converted to simulation files
    original_pdb_path = server.get_project_file(project_id, ProjectFile.TRAJECTORY_PDB)

    try:
        os.remove(pdb_file_path)
        os.remove(xtc_file_path)
    except OSError:
        pass

    convert_pdb_to_xtc(input_file_path=original_pdb_path, output_file_path=xtc_file_path)
    convert_pdb_to_single_frame(input_file_path=original_pdb_path, output_file_path=pdb_file_path)
    return True
