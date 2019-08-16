import os

import webdna.defaults as defaults
import webdna.messages as messages
import webdna.util.server as server

from webdna.defaults import ProjectFile
from typing import Dict, Union


def generate_input_file(project_id: str, data: Union[Dict, object]):
    project_folder_path = server.get_project_folder_path(project_id)
    input_path = os.path.join(project_folder_path, defaults.DEFAULT_INPUT_FILE_NAME)

    os.makedirs(project_folder_path, exist_ok=True)

    input_file = open(file=input_path, mode='w')
    for key, value in data.items():
        if key == 'output_prefix' and value == '':
            continue
        if key == 'project_id':
            continue
        if key == 'T':
            value = value + ' K'
        input_file.write(key + ' = ' + str(value) + '\n')
    input_file.close()

    return messages.INPUT_GENERATED


def parse_input_file(project_id: str) -> Union[str, Dict]:
    input_file_path = server.get_project_file(project_id, ProjectFile.INPUT)

    if not os.path.isfile(input_file_path):
        return messages.MISSING_PROJECT_FILES

    input_file = open(file=input_file_path, mode='r')
    input_dictionary = {}
    for line in input_file.readlines():
        if line[len(line) - 1] == '\n':
            line = line[:-1]
        key_and_value = line.split(' = ')
        input_dictionary[key_and_value[0]] = key_and_value[1]

    return input_dictionary


def write_string_to_file(string_value: str, file_path: str):
    with open(file=file_path, mode='w') as file:
        file.write(string_value)


def get_file_contents_as_string(file_path: str) -> str:
    with open(file=file_path, mode='r') as file:
        files_contents_string = file.read()

    return files_contents_string
