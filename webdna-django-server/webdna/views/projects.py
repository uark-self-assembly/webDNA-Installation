import shutil

import webdna.tasks as tasks
import webdna.util.file as file_util
import webdna.util.project as project_util

from distutils.dir_util import copy_tree

from django.http import HttpResponse
from rest_framework import generics
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from typing import Dict

from webdna_django_server.celery import app

from webdna.responses import *
from webdna.serializers import *
from webdna.util.jwt import *


# URL: api/projects/<uuid:project_id>/files/upload/
class FileUploadView(generics.GenericAPIView):
    parser_classes = (MultiPartParser,)
    permission_classes = [IsAuthenticated, IsProjectOwner, ]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'project_id'

    def post(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        project_existence_serializer = ProjectExistenceSerializer(data=kwargs)
        if project_existence_serializer.is_valid():
            project_id = kwargs['project_id']
            file_obj = request.data['file']
            file_type_string = request.data['type']  # Any kind of file in project to edit

            try:
                file_type = FileType[file_type_string].value
            except KeyError:
                return ErrorResponse.make(
                    status=status.HTTP_400_BAD_REQUEST,
                    message='Invalid FileType: {}'.format(file_type_string))

            new_file_path = server.get_project_file(project_id, file_type)

            if os.path.isfile(new_file_path):
                os.remove(new_file_path)

            new_file = open(file=new_file_path, mode='wb')
            for line in file_obj.readlines():
                new_file.write(line)
            new_file.close()

            return DefaultResponse.make(status=status.HTTP_204_NO_CONTENT)
        else:
            return ErrorResponse.make(status=status.HTTP_404_NOT_FOUND)


# URL: /api/projects/
class ProjectList(generics.CreateAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated, ]
    serializer_class = ProjectSerializer
    filter_backends = (OrderingFilter,)
    ordering = ('-created_on', )

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user_id=user.id)

    def create(self, request, *args, **kwargs):
        project_data = request.data
        project_data['user'] = request.user.id
        serializer = self.get_serializer(data=project_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get(self, request, *args, **kwargs):
        response = generics.ListAPIView.get(self, request, args, kwargs)
        for project in response.data:
            fetched_job = Job.objects.filter(project_id=project['id'])

            if fetched_job:
                job_serialized = JobSerializer(instance=fetched_job[0])
                project['job'] = job_serialized.data
            else:
                project['job'] = None
        return ObjectResponse.make(response=response)

    def post(self, request, *args, **kwargs):
        response = generics.CreateAPIView.post(self, request, args, kwargs)
        fetched_projects = Project.objects.all().filter(id=response.data['id'])
        project = fetched_projects[0]
        project_util.initialize_project(project)

        return ObjectResponse.make(response=response)


# URL: /api/projects/<uuid:project_id>/
class ProjectView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsProjectOwner, ]
    lookup_field = 'id'
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        response = generics.RetrieveUpdateDestroyAPIView.get(self, request, args, kwargs)
        fetched_job = Job.objects.filter(project_id=response.data['id'])

        if fetched_job:
            job_serialized = JobSerializer(instance=fetched_job[0])
            response.data['job'] = job_serialized.data
        else:
            response.data['job'] = None

        return ObjectResponse.make(response=response)

    def put(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        response = generics.RetrieveUpdateDestroyAPIView.put(self, request, args, kwargs)
        return ObjectResponse.make(response=response)

    def delete(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        project = self.get_object()

        if not project:
            return ErrorResponse.make(message=PROJECT_NOT_FOUND)

        project_id = kwargs['id']
        project_folder_path = server.get_project_folder_path(project_id)
        jobs = Job.objects.filter(project_id=project_id)

        for j in jobs:
            if j.finish_time is None:
                app.control.revoke(j.process_name, terminate=True)

        shutil.rmtree(project_folder_path, ignore_errors=True)

        response = generics.RetrieveUpdateDestroyAPIView.delete(self, request, args, kwargs)
        return ObjectResponse.make(response=response)


class BaseProjectView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsProjectOwner]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'project_id'


# /api/projects/<uuid:project_id>/settings/
class SettingsView(BaseProjectView, generics.RetrieveUpdateAPIView):

    @staticmethod
    def clean_settings_dictionary(settings_dictionary: Dict):
        settings_dictionary.pop('generation_method', None)
        settings_dictionary.pop('lattice_type', None)
        settings_dictionary.pop('execution_time', None)

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = ProjectExistenceSerializer(data=kwargs)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']

            input_data = file_util.parse_input_file(project_id)
            if input_data == MISSING_PROJECT_FILES:
                return ObjectResponse.make(obj={})

            project_util.add_settings(project_id, input_data)

            return ObjectResponse.make(obj=input_data)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)

    def put(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        project_id = kwargs['project_id']

        request.data['project_id'] = project_id

        project_settings_serializer = ProjectSettingsSerializer(data=request.data)
        if project_settings_serializer.is_valid():
            settings_data: Dict = project_settings_serializer.validated_data.copy()
            SettingsView.clean_settings_dictionary(settings_data)

            project_execution_time = project_settings_serializer.validated_data['execution_time']
            if project_execution_time is not None:
                settings_data['steps'] = project_util.MAX_STEPS

            input_file_status = file_util.generate_input_file(project_id, settings_data)

            project_generation = project_util.Generation(
                method=project_settings_serializer.validated_data['generation_method'],
                arguments=project_settings_serializer.gen_args)

            existing_project_settings = project_util.get_project_settings(project_id)
            existing_project_settings.generation = project_generation
            existing_project_settings.execution_time = project_execution_time
            project_util.save_project_settings(project_id, existing_project_settings)

            if input_file_status == MISSING_PROJECT_FILES:
                return ErrorResponse.make(
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    message=MISSING_PROJECT_FILES)

            return DefaultResponse.make(status.HTTP_201_CREATED)
        else:
            return ErrorResponse.make(errors=project_settings_serializer.errors)


# /api/projects/<uuid:project_id>/simulation/execute/
class ExecutionView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        regenerate = request.GET.get('regenerate', False)
        execution_data = {
            'project_id': kwargs['project_id'],
            'regenerate': regenerate
        }

        serialized_body = ExecutionSerializer(data=execution_data)
        if serialized_body.is_valid():
            job = serialized_body.fetched_job
            if job is None:
                job = serialized_body.create(serialized_body.validated_data)

            project_id = serialized_body.validated_data['project_id']
            regenerate = serialized_body.validated_data['regenerate']

            project_folder_path = server.get_project_folder_path(project_id)

            if os.path.isdir(project_folder_path):
                if project_util.is_executable(project_id, regenerate):
                    project_settings = project_util.get_project_settings(project_id)
                    tasks.execute_sim.delay(job.id, project_id, request.user.id, regenerate,
                                            execution_time=project_settings.execution_time)
                    return ExecutionResponse.make()
                else:
                    job.delete()
                    return ErrorResponse.make(status=status.HTTP_409_CONFLICT,
                                              message='Missing required oxDNA files')
            else:
                job.delete()
                return ErrorResponse.make(status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                          message='Unable to execute specified simulation')
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: /api/projects/<uuid:project_id>/simulation/terminate/
class TerminationView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = TerminateSerializer(data=kwargs)
        if serialized_body.is_valid():
            job = serialized_body.fetched_job
            try:
                app.control.revoke(job.process_name, terminate=True)
            except ConnectionResetError as exception:
                print(exception)

            job.terminated = True
            job.finish_time = timezone.now()
            job.process_name = None
            job.save(update_fields=['process_name', 'terminated', 'finish_time'])
            return DefaultResponse.make()
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: /api/projects/<uuid:project_id>/current-output/
class OutputView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = CheckStatusSerializer(data=kwargs)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']
            running = serialized_body.fetched_job.finish_time is None

            stdout_file = server.get_project_file(project_id, ProjectFile.STDOUT)
            if os.path.isfile(stdout_file):
                stdout_string = file_util.get_file_contents_as_string(stdout_file)
            else:
                stdout_string = ''

            log_file = server.get_project_file(project_id, ProjectFile.LOG_DAT)
            if os.path.isfile(log_file):
                log_string = file_util.get_file_contents_as_string(log_file)
            else:
                log_string = ''

            response_data = {'running': running, 'log': log_string, 'stdout': stdout_string}
            return ObjectResponse.make(response_data)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: api/projects/<uuid:project_id>/files/<str:file_type>/download/
class DownloadProjectFileView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = FileSerializer(data=kwargs)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']
            file_type_string = serialized_body.validated_data['file_type']

            try:
                file_type = FileType[file_type_string].value
            except:
                return ErrorResponse.make(message='Invalid file type')

            if not server.project_file_exists(project_id, file_type):
                return ErrorResponse.make(status=http_status.HTTP_404_NOT_FOUND)

            project_file_path = server.get_project_file(project_id, file_type)

            with open(project_file_path, 'r') as project_file:
                response = HttpResponse(project_file, content_type='text/plain')
                response['Content-Disposition'] = 'attachment; filename="project.zip"'

            return response
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: api/projects/<uuid:project_id>/files/<str:file_type>/check/
class CheckProjectFileView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = FileSerializer(data=kwargs)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']
            file_type_string = serialized_body.validated_data['file_type']

            try:
                file_type = FileType[file_type_string].value
            except:
                return ErrorResponse.make(message='Invalid file type')

            file_exists = server.project_file_exists(project_id, file_type)
            return ObjectResponse.make(obj=file_exists)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: /api/projects/<uuid:project_id>/files/trajectory/
class GenerateVisualizationView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = GetPDBSerializer(data=kwargs)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']

            if serialized_body.fetched_job.finish_time is None:
                trajectory_file = server.get_project_file(project_id, ProjectFile.TRAJECTORY_DAT)
                top_file = server.get_project_file(project_id, ProjectFile.GENERATED_TOP)
                if os.path.isfile(trajectory_file) and os.path.isfile(top_file):
                    project_util.generate_sim_files(project_id)
                else:
                    return ErrorResponse.make(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return DefaultResponse.make()
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: api/projects/<uuid:project_id>/files/zip/
class ProjectZipView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = ProjectExistenceSerializer(data=kwargs)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']

            project_util.zip_project(project_id)
            project_zip_file_path = server.get_project_file(project_id, ProjectFile.PROJECT_ZIP)
            with open(project_zip_file_path, 'rb') as archive_file:
                response = HttpResponse(archive_file, content_type='application/zip')
                response['Content-Disposition'] = 'attachment; filename="project.zip"'
                archive_file.close()
            return response
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: api/projects/<uuid:project_id>/duplicate/
class DuplicateProjectView(BaseProjectView):

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(request, self.get_object())
        serialized_body = ProjectExistenceSerializer(data=kwargs)
        if serialized_body.is_valid():
            new_project = Project()
            new_project.name = 'Duplicate of ' + serialized_body.fetched_project.name
            new_project.user_id = serialized_body.fetched_project.user_id

            original_project_id = serialized_body.validated_data['project_id']
            original_project_folder_path = server.get_project_folder_path(original_project_id)
            duplicated_project_folder_path = server.get_project_folder_path(new_project.id)

            copy_tree(original_project_folder_path, duplicated_project_folder_path)

            new_project.save()

            original_project_settings = project_util.get_project_settings(original_project_id)
            original_project_settings.name = new_project.name
            project_util.save_project_settings(new_project.id, original_project_settings)

            project_serializer = ProjectSerializer(instance=new_project)
            return ObjectResponse.make(obj=project_serializer.data)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)
