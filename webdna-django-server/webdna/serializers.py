import re
import os
import random

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

import webdna.util.server as server

from webdna.models import *
from webdna.messages import *
from webdna.defaults import FileType, ProjectFile


class UserOutputRequestSerializer(serializers.Serializer):
    class Meta:
        model = Project
        fields = 'id'

    project_id = serializers.UUIDField()

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    def validate(self, request_data):
        project_id = request_data['project_id']
        query_set = Project.objects.all()
        fetched = query_set.filter(id=project_id)
        if not fetched:
            raise serializers.ValidationError(PROJECT_NOT_FOUND)

        return request_data


class ExecutionSerializer(serializers.Serializer):
    class Meta:
        model = Job
        fields = 'project_id'

    project_id = serializers.UUIDField()
    regenerate = serializers.BooleanField()
    fetched_job = None

    def create(self, validated_data):
        job = Job.objects.create(project_id=validated_data['project_id'])
        job.save()
        return job

    def update(self, instance, validated_data):
        pass

    def validate(self, execution_data):
        project_id = execution_data['project_id']

        query_set = Project.objects.all()
        fetched = query_set.filter(id=project_id)
        if not fetched:
            raise serializers.ValidationError(PROJECT_NOT_FOUND)

        query_set = Job.objects.all()
        fetched = query_set.filter(project_id=project_id)
        if not fetched:
            return execution_data
        else:
            self.fetched_job = fetched[0]
            if self.fetched_job.finish_time is None:
                raise serializers.ValidationError(JOB_ALREADY_EXECUTING)
            else:
                return execution_data


class TerminateSerializer(serializers.Serializer):
        class Meta:
            model = Job
            fields = 'project_id'

        project_id = serializers.UUIDField()
        fetched_job = None

        def create(self, validated_data):
            pass

        def update(self, instance, validated_data):
            pass

        def validate(self, execution_data):
            project_id = execution_data['project_id']

            query_set = Job.objects.all()
            fetched = query_set.filter(project_id=project_id)
            if not fetched:
                raise serializers.ValidationError(JOB_NOT_FOUND)
            else:
                self.fetched_job = fetched[0]
                if self.fetched_job.finish_time is not None:
                    raise serializers.ValidationError(JOB_NOT_EXECUTING)
                else:
                    return execution_data


class ScriptUploadSerializer(serializers.Serializer):
    file_name = serializers.CharField(max_length=128)
    user = serializers.CharField(max_length=36)
    file = serializers.FileField()
    description = serializers.CharField(max_length=512)

    class Meta:
        model = Script
        fields = ('file_name', 'user', 'description')

    def create(self, validated_data):
        script = Script.objects.create(file_name=validated_data['file_name'], user_id=validated_data['user'],
                                       description=validated_data['description'])
        script.save()
        return script

    def update(self, instance, validated_data):
        pass

    def validate(self, script_data):
        self.file_name = script_data['file_name']
        self.file = script_data['file']
        self.description = script_data['description']
        self.user = script_data['user']

        # make sure it doesn't already exist
        query_set = Script.objects.all()
        fetched = query_set.filter(file_name=self.file_name, user=self.user)
        if fetched:
            raise serializers.ValidationError(SCRIPTS_ALREADY_EXISTS)

        # make the directory
        path = os.path.join(os.getcwd(), 'server-data', 'server-users', str(self.user), 'scripts')
        if not os.path.isdir(path):
            os.makedirs(path)

        return script_data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class ScriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Script
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'


class LoginSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = ('username', 'password')

    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    fetched_user = None

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    def validate(self, login_data):
        username = login_data['username']
        password = login_data['password']

        self.fetched_user = authenticate(username=username, password=password)

        if self.fetched_user is None:
            raise serializers.ValidationError(INVALID_LOGIN)

        return login_data


class UserScriptSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = 'id'

    user_id = serializers.CharField(max_length=36)

    def validate(self, user_data):
        user_id = user_data['user_id']

        query_set = User.objects.all()
        fetched = query_set.filter(id=user_id)

        if not fetched:
            raise serializers.ValidationError(USER_NOT_FOUND)

        path = os.path.join('server-data', 'server-users', str(user_id), 'scripts')
        if not os.path.isdir(path):
            raise serializers.ValidationError(SCRIPTS_NOT_FOUND)

        return user_data


class ProjectExistenceSerializer(serializers.Serializer):
    class Meta:
        model = Project
        fields = 'id'

    project_id = serializers.UUIDField()
    fetched_project = None

    def validate(self, data):
        project_id = data['project_id']

        query_set = Project.objects.all()
        fetched = query_set.filter(id=project_id)

        if not fetched:
            raise serializers.ValidationError(PROJECT_NOT_FOUND)

        self.fetched_project = fetched[0]
        return data


class FileSerializer(ProjectExistenceSerializer):
    file_type = serializers.CharField(max_length=128)
    project_file = None

    def validate(self, execution_data):
        try:
            validated_execution_data = ProjectExistenceSerializer.validate(self, execution_data)
        except serializers.ValidationError as error:
            raise error

        project_id = validated_execution_data['project_id']
        file_type_string = validated_execution_data['file_type']
        try:
            self.project_file = FileType[file_type_string].value
        except KeyError:
            raise serializers.ValidationError(INVALID_FILE_TYPE)

        if not server.project_file_exists(project_id, self.project_file):
            raise serializers.ValidationError(MISSING_PROJECT_FILES)

        return execution_data


class RegistrationSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password')

    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    password = serializers.CharField(max_length=128, write_only=True)

    def validate_password(self, password):
        flag = False
        if len(str(password)) < 8:
            flag = True
        elif re.search('[0-9]', str(password)) is None:
            flag = True
        elif re.search('[a-z]', str(password)) is None:
            flag = True
        elif re.search('[A-Z]', str(password)) is None:
            flag = True

        if flag:
            raise serializers.ValidationError(INVALID_PASSWORD_FORMAT)

        return password

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        pass


class CheckStatusSerializer(serializers.Serializer):
    class Meta:
        model = Job
        fields = 'project_id'

    project_id = serializers.UUIDField()
    fetched_job = None

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    def validate(self, data):
        project_id = data['project_id']
        query_set = Job.objects.all()
        fetched = query_set.filter(project_id=project_id)

        if not fetched:
            raise(serializers.ValidationError(JOB_NOT_FOUND))

        self.fetched_job = fetched[0]

        return data


def randint():
    return random.randint(0, 1000000000)


class ProjectSettingsSerializer(serializers.Serializer):
    gen_args = []

    def validate(self, project_settings_data):
        project_id = project_settings_data['project_id']

        query_set = Project.objects.all()
        fetched = query_set.filter(id=project_id)
        if not fetched:
            raise serializers.ValidationError(PROJECT_NOT_FOUND)

        project_path = os.path.join('server-data', 'server-projects', str(project_id))

        # Settings for project json file:
        json_settings_valid = False
        if project_settings_data['generation_method'] == 'cadnano-interface':
            if project_settings_data['lattice_type'] == 'he' or project_settings_data['lattice_type'] == 'sq':
                json_settings_valid = True
                self.gen_args = [project_settings_data['lattice_type'], str(project_settings_data['box_size'])]
        elif project_settings_data['generation_method'] == 'generate-sa':
            json_settings_valid = True
            self.gen_args = [str(project_settings_data['box_size'])]
        elif project_settings_data['generation_method'] == 'generate-folded':
            json_settings_valid = True
            self.gen_args = ['-b', str(project_settings_data['box_size'])]

        if not json_settings_valid:
            raise serializers.ValidationError(INVALID_GENERATION_SETTINGS)

        # if 1, must set external_forces_file
        external_forces = project_settings_data['external_forces']
        if external_forces or int(external_forces) == 1:
            project_settings_data['external_forces_file'] = ProjectFile.EXTERNAL_FORCES.value
            if not server.project_file_exists(project_id, ProjectFile.EXTERNAL_FORCES):
                raise serializers.ValidationError(INPUT_SETTINGS_INVALID)

        # If sequence dependence is to be used, set this to 0 and specify seq_dep_file.
        use_average_seq = project_settings_data['use_average_seq']
        if not use_average_seq or int(use_average_seq) == 0:
            project_settings_data['seq_dep_file'] = ProjectFile.SEQUENCE_DEPENDENT_PARAMETERS.value
            if not server.project_file_exists(project_id, ProjectFile.SEQUENCE_DEPENDENT_PARAMETERS):
                raise serializers.ValidationError(INPUT_SETTINGS_INVALID)

        # if print_red_conf_every > 0
        print_reduced_conf_every = project_settings_data['print_reduced_conf_every']
        if int(print_reduced_conf_every) > 0:
            conf_path = os.path.join(os.getcwd(), project_path, 'reduced_conf_output_dir')
            project_settings_data['reduced_conf_output_dir'] = conf_path

        return project_settings_data

    project_id = serializers.UUIDField()

    # Project json file settings
    generation_method = serializers.CharField(max_length=20, required=True)
    lattice_type = serializers.CharField(max_length=2, default='')
    execution_time = serializers.IntegerField(default=None)

    # Generation options
    box_size = serializers.IntegerField(min_value=1, default=20)  # box side

    # Generic Options
    interaction_type = serializers.CharField(max_length=10, default='DNA')
    sim_type = serializers.CharField(max_length=10, default='MD')
    backend = serializers.CharField(max_length=10, default='CPU')
    backend_precision = serializers.CharField(max_length=10)
    debug = serializers.IntegerField(default=0, read_only=True, min_value=0, max_value=1)

    # Simulation Options
    steps = serializers.IntegerField()
    restart_step_counter = serializers.IntegerField(default=0, min_value=0, max_value=1)
    seed = serializers.IntegerField(default=randint)
    T = serializers.CharField(max_length=20)
    fix_diffusion = serializers.IntegerField(default=1, min_value=0, max_value=1)
    verlet_skin = serializers.FloatField()
    back_in_box = serializers.IntegerField(default=0, min_value=0, max_value=1)
    salt_concentration = serializers.FloatField(required=False)  # only used with DNA2
    use_average_seq = serializers.IntegerField(default=1, min_value=0, max_value=1)  # If sequence dependence is to be used, set this to 0 and specify seq_dep_file.
    seq_dep_file = serializers.CharField(max_length=128, required=False)
    external_forces = serializers.IntegerField(default=0, min_value=0, max_value=1)  # if 1, must set external_forces_file
    external_forces_file = serializers.CharField(max_length=128, required=False)

    # Molecular Dynamics Simulations Options
    dt = serializers.FloatField(required=True)
    thermostat = serializers.CharField(max_length=10)
    newtonian_steps = serializers.IntegerField()  # required if thermostat != "no"
    pt = serializers.FloatField(required=False)  # only used if thermostat == "john"
    diff_coeff = serializers.FloatField(required=True)  # required if pt is not specified

    # NOT USING MONTE CARLO SIMULATION SETTINGS

    # Input/Output
    conf_file = serializers.CharField(max_length=128, required=False, default='generated.dat')
    topology = serializers.CharField(max_length=128, default='generated.top')
    trajectory_file = serializers.CharField(default='trajectory.dat', max_length=128)
    confs_to_skip = serializers.IntegerField(default=0)  # only used if conf_file is a trajectory
    lastconf_file = serializers.CharField(max_length=128, default='last_conf.dat')
    lastconf_file_bin = serializers.CharField(max_length=0, required=False)
    binary_initial_conf = serializers.IntegerField(default=0, min_value=0, max_value=1)
    refresh_vel = serializers.IntegerField(default=0, min_value=0, max_value=1)
    energy_file = serializers.CharField(default='energy.dat', max_length=128)
    print_energy_every = serializers.IntegerField(default=1000)
    no_stdout_energy = serializers.IntegerField(default=0, min_value=0, max_value=1)
    time_scale = serializers.CharField(default='linear', max_length=128)
    print_conf_ppc = serializers.IntegerField(required=False)  # mandatory only if time_scale==log_line
    print_conf_interval = serializers.IntegerField(required=False)
    print_reduced_conf_every = serializers.IntegerField(default=0, min_value=0)
    reduced_conf_output_dir = serializers.CharField(max_length=128, required=False)  # if print_red_conf_every > 0
    log_file = serializers.CharField(default='log.dat', max_length=128)
    print_timings = serializers.IntegerField(default=0, min_value=0, max_value=1)
    timings_filename = serializers.CharField(max_length=128, required=False)
    output_prefix = serializers.CharField(default='', max_length=128)
    print_input = serializers.IntegerField(default=0, min_value=0, max_value=1)
    equilibration_steps = serializers.IntegerField(default=0, min_value=0)


class GetPDBSerializer(serializers.Serializer):
    class Meta:
        model = Job
        fields = 'project_id'

    project_id = serializers.UUIDField()
    fetched_job = None

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    def validate(self, data):
        project_id = data['project_id']
        query_set = Job.objects.all()
        fetched = query_set.filter(project_id=project_id)

        if not fetched:
            raise(serializers.ValidationError(JOB_NOT_FOUND))

        self.fetched_job = fetched[0]

        return data


class ScriptChainSerializer(serializers.Serializer):
    class Meta:
        model = Project
        fields = 'id'

    project_id = serializers.UUIDField()
    scripts = serializers.ListField(required=True, child=serializers.CharField())
    fetched_project = None

    def validate(self, data):
        project_id = data['project_id']

        query_set = Project.objects.all()
        fetched = query_set.filter(id=project_id)
        if not fetched:
            raise serializers.ValidationError(PROJECT_NOT_FOUND)

        self.fetched_project = fetched[0]
        script_ids = data['scripts']

        for script_id in script_ids:
            fetched_script = Script.objects.all().filter(id=script_id)
            if not fetched_script:
                raise serializers.ValidationError(CHAIN_SCRIPT_NOT_FOUND)

        return data

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class RunAnalysisSerializer(serializers.Serializer):
    class Meta:
        model = Project
        fields = 'id'

    project_id = serializers.UUIDField()
    fetched_project = None

    def validate(self, data):
        project_id = data['project_id']

        query_set = Project.objects.all()
        fetched = query_set.filter(id=project_id)
        if not fetched:
            raise serializers.ValidationError(PROJECT_NOT_FOUND)

        self.fetched_project = fetched[0]

        query_set = Job.objects.all()
        fetched = query_set.filter(project_id=project_id)

        if not fetched:
            raise serializers.ValidationError(JOB_NOT_FOUND)

        job = fetched[0]
        if job.finish_time is None:
            raise serializers.ValidationError(JOB_CURRENTLY_EXECUTING)

        return data

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class ScriptDeleteSerializer(serializers.Serializer):
    class Meta:
        model = Script
        fields = 'id'

    script_id = serializers.UUIDField()
    fetched_script = None

    def validate(self, data):
        script_id = data['script_id']

        query_set = Script.objects.all()
        fetched = query_set.filter(id=script_id)
        if not fetched:
            raise serializers.ValidationError(SCRIPTS_NOT_FOUND)

        self.fetched_script = fetched[0]
        return data

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class ScriptChainRequestSerializer(serializers.Serializer):
    class Meta:
        model = Project
        fields = 'id'

    project_id = serializers.UUIDField()
    fetched_project = None

    def validate(self, data):
        project_id = data['project_id']

        query_set = Project.objects.all()
        fetched = query_set.filter(id=project_id)
        if not fetched:
            raise serializers.ValidationError(PROJECT_NOT_FOUND)

        self.fetched_project = fetched[0]
        self.project_id = project_id
        return data

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class UserProfileSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')

    username = serializers.CharField(
        required=False,
        validators=[UniqueValidator(queryset=User.objects.all())]
        )
    email = serializers.EmailField(
        required=False,
        validators=[UniqueValidator(queryset=User.objects.all())]
        )

    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=30, required=False)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    user_id = serializers.UUIDField()

    def validate_new_password(self, new_password):
        flag = False
        if len(str(new_password)) < 8:
            flag = True
        elif re.search('[0-9]', str(new_password)) is None:
            flag = True
        elif re.search('[a-z]', str(new_password)) is None:
            flag = True
        elif re.search('[A-Z]', str(new_password)) is None:
            flag = True

        if flag:
            raise serializers.ValidationError(INVALID_PASSWORD_FORMAT)

        return new_password

    def validate(self, data):
        user = User.objects.all().filter(id=data['user_id'])[0]
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError(INVALID_PASSWORD)

        return data
