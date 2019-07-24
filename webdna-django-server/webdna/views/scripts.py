from rest_framework import generics
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated

import webdna.tasks as tasks
from webdna.defaults import ProjectFile, AnalysisFile
from webdna.util.project import get_project_settings, save_project_settings
from ..responses import *
from ..serializers import *
from ..util.jwt import *


# URL: /api/scripts/<uuid:id>
class ScriptView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsScriptOwner, ]
    queryset = Script.objects.all()
    serializer_class = ScriptSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        self.check_permissions(request)
        self.check_object_permissions(request, self.get_object())
        response = generics.RetrieveUpdateDestroyAPIView.get(self, request, args, kwargs)
        return ObjectResponse.make(response=response)

    def delete(self, request, *args, **kwargs):
        self.check_permissions(request)
        self.check_object_permissions(request, self.get_object())
        delete_data = {
            'script_id': kwargs['id']
        }
        serialized_body = ScriptDeleteSerializer(data=delete_data)
        if serialized_body.is_valid():
            response = generics.RetrieveUpdateDestroyAPIView.delete(self, request, args, kwargs)
            os.remove(server.get_user_script(user_id=kwargs['user_id'],
                                             script_file_name=serialized_body.fetched_script.file_name))
            return ObjectResponse.make(response=response)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: /api/scripts/
class ScriptList(generics.CreateAPIView, generics.ListAPIView):
    permission_classes = [IsAuthenticated, ]
    serializer_class = ScriptSerializer
    parser_classes = (MultiPartParser,)
    lookup_field = 'user_id'

    def get_queryset(self):
        user = self.request.user
        return Script.objects.filter(user_id=user.id)

    def post(self, request, *args, **kwargs):
        self.check_permissions(request)
        upload_data = request.data
        upload_data['user'] = str(request.user.id)

        serialized_body = ScriptUploadSerializer(data=upload_data)
        if serialized_body.is_valid():
            script = serialized_body.create(serialized_body.validated_data)
            file_obj = serialized_body.validated_data['file']
            user_id = serialized_body.validated_data['user']
            script_name = serialized_body.validated_data['file_name']

            new_script_file_path = server.get_user_script(user_id, script_name)

            if os.path.isfile(new_script_file_path):
                os.remove(new_script_file_path)

            new_script_file = open(file=new_script_file_path, mode='wb')
            for line in file_obj.readlines():
                new_script_file.write(line)
            new_script_file.close()

            serialized_script = ScriptSerializer(script)
            return ObjectResponse.make(serialized_script.data)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)

    def get(self, request, *args, **kwargs):
        response = generics.ListAPIView.get(self, request, args, kwargs)
        return ObjectResponse.make(response=response)


# URL: /api/projects/<uuid:project_id>/userlog
class AnalysisOutputView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsProjectOwner, ]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'project_id'

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(self.request, self.get_object())
        log_data = {
            'project_id': kwargs['project_id']
        }

        serialized_body = UserOutputRequestSerializer(data=log_data)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']
            file_path = server.get_analysis_file_path(project_id, AnalysisFile.LOG)

            if os.path.isfile(file_path):
                with open(file_path, 'rb') as output_file:
                    response = output_file.read()

                return ObjectResponse.make(obj=response)
            else:
                return ErrorResponse.make(status=status.HTTP_404_NOT_FOUND,
                                          message='analysis.log does not exist for given project')
        else:
            return ErrorResponse.make(status=status.HTTP_400_BAD_REQUEST, message=PROJECT_NOT_FOUND)


# URL: /api/projects/<uuid:project_id>/execute-analysis
class AnalysisExecutionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsProjectOwner, ]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'project_id'

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(self.request, self.get_object())
        analysis_data = {
            'project_id': kwargs['project_id']
        }
        serialized_body = RunAnalysisSerializer(data=analysis_data)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']
            user_id = serialized_body.fetched_project.user_id

            tasks.execute_output_analysis.delay(project_id, user_id)
            return DefaultResponse.make()
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: /api/projects/<uuid:project_id>/scriptchain/
class ScriptChainView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsProjectOwner, ]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'project_id'

    def get(self, request, *args, **kwargs):
        self.check_object_permissions(self.request, self.get_object())
        request_data = {
            'project_id': kwargs['project_id']
        }
        serialized_body = ScriptChainRequestSerializer(data=request_data)
        if serialized_body.is_valid():

            project_id = str(serialized_body.project_id)
            project_settings = get_project_settings(project_id)
            response = project_settings.script_chain

            return ObjectResponse.make(obj=response)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)

    def post(self, request, *args, **kwargs):
        self.check_object_permissions(self.request, self.get_object())
        request_data = {
            'project_id': kwargs['project_id'],
            'scripts': request.data.get('scripts', None)
        }
        serialized_body = ScriptChainSerializer(data=request_data)
        if serialized_body.is_valid():
            project_id = serialized_body.validated_data['project_id']
            project_settings = get_project_settings(project_id)
            scripts = serialized_body.validated_data['scripts']

            project_settings.script_chain = scripts
            save_project_settings(project_id, project_settings)

            return DefaultResponse.make()
        else:
            return ErrorResponse.make(errors=serialized_body.errors)
