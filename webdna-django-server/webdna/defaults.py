from enum import Enum

DEFAULT_SEQUENCE_FILE_NAME = 'sequence.txt'
DEFAULT_UPLOADED_DAT_NAME = 'generated.dat'
DEFAULT_UPLOADED_TOP_NAME = 'generated.top'
DEFAULT_INPUT_FILE_NAME = 'input.txt'
DEFAULT_STDOUT_FILE_NAME = 'stdout.log'
DEFAULT_LOG_DAT_NAME = 'log.dat'
DEFAULT_TRAJECTORY_PDB_NAME = 'trajectory.pdb'
DEFAULT_TRAJECTORY_DAT_NAME = 'trajectory.dat'
DEFAULT_GENERATED_TOP_NAME = 'generated.top'
DEFAULT_GENERATED_DAT_NAME = 'generated.dat'
DEFAULT_SIMULATION_ZIP_NAME = 'simulation.zip'
DEFAULT_PROJECT_ZIP_NAME = 'project.zip'
DEFAULT_SCRIPT_CHAIN_FILE_NAME = 'scriptchain.txt'
DEFAULT_JSON_FILE_NAME = 'project.json'
DEFAULT_CADNANO_FILE_NAME = 'cadnano-project.json'
DEFAULT_EXTERNAL_FORCES_FILE_NAME = 'external-forces.txt'
DEFAULT_SEQUENCE_DEPENDENT_PARAMETERS_FILE_NAME = 'sequence_dependent_parameters.txt'

DEFAULT_ANALYSIS_LOG_FILE_NAME = 'analysis.log'
DEFAULT_ANALYSIS_OUTPUT_FILE_NAME = 'output.txt'


class ProjectFile(Enum):
    SEQUENCE = DEFAULT_SEQUENCE_FILE_NAME
    UPLOADED_DAT = DEFAULT_UPLOADED_DAT_NAME
    UPLOADED_TOP = DEFAULT_UPLOADED_TOP_NAME
    INPUT = DEFAULT_INPUT_FILE_NAME
    STDOUT = DEFAULT_STDOUT_FILE_NAME
    LOG_DAT = DEFAULT_LOG_DAT_NAME
    TRAJECTORY_PDB = DEFAULT_TRAJECTORY_PDB_NAME
    TRAJECTORY_DAT = DEFAULT_TRAJECTORY_DAT_NAME
    GENERATED_TOP = DEFAULT_GENERATED_TOP_NAME
    GENERATED_DAT = DEFAULT_GENERATED_DAT_NAME
    SIMULATION_ZIP = DEFAULT_SIMULATION_ZIP_NAME
    PROJECT_ZIP = DEFAULT_PROJECT_ZIP_NAME
    SCRIPT_CHAIN = DEFAULT_SCRIPT_CHAIN_FILE_NAME
    SETTINGS = DEFAULT_JSON_FILE_NAME
    CADNANO = DEFAULT_CADNANO_FILE_NAME
    EXTERNAL_FORCES = DEFAULT_EXTERNAL_FORCES_FILE_NAME
    SEQUENCE_DEPENDENT_PARAMETERS = DEFAULT_SEQUENCE_DEPENDENT_PARAMETERS_FILE_NAME


class FileType(Enum):
    """
    Defines the types of files that are upload-able by the user
    """
    SEQUENCE = ProjectFile.SEQUENCE
    UPLOADED_DAT = ProjectFile.UPLOADED_DAT
    UPLOADED_TOP = ProjectFile.UPLOADED_TOP
    TRAJECTORY_DAT = ProjectFile.TRAJECTORY_DAT
    EXTERNAL_FORCES = ProjectFile.EXTERNAL_FORCES
    SEQUENCE_DEPENDENT_PARAMETERS = ProjectFile.SEQUENCE_DEPENDENT_PARAMETERS


class AnalysisFile(Enum):
    LOG = DEFAULT_ANALYSIS_LOG_FILE_NAME
    OUTPUT = DEFAULT_ANALYSIS_OUTPUT_FILE_NAME