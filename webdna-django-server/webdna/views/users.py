from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from ..responses import *
from ..serializers import *
from webdna.util import user as user_util


# URL: /api/users/
# Data: None
class UserView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        if request.user.is_superuser:
            users = User.objects.all()
            serializer = UserSerializer(users, many=True)
            return ObjectResponse.make(obj=serializer.data)
        else:
            return PermissionDeniedResponse.make()


# URL: /api/users/login/
# Data: in request body
class LoginView(APIView):
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        serialized_body = LoginSerializer(data=request.data)
        if serialized_body.is_valid():
            serialized_user = UserSerializer(serialized_body.fetched_user)
            return AuthenticationResponse.make(serialized_body.fetched_user, serialized_user.data)
        else:
            return ErrorResponse.make(status=status.HTTP_400_BAD_REQUEST, errors=serialized_body.errors)


# URL: /api/users/register/
# Data: in request body
class RegistrationView(APIView):
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        serialized_body = RegistrationSerializer(data=request.data)
        if serialized_body.is_valid():
            created_user = serialized_body.save()
            serialized_user = UserSerializer(created_user)
            user_id = str(created_user.id)
            scripts_folder_path = server.get_user_scripts_folder_path(user_id)
            os.makedirs(scripts_folder_path, exist_ok=True)
            return RegistrationResponse.make(created_user, serialized_user.data)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


# URL: /api/users/profile
class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, ]
    serializer_class = UserProfileSerializer

    def get(self, request, *args, **kwargs):
        profile = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name
        }
        return ObjectResponse.make(profile)

    def put(self, request, *args, **kwargs):
        serialized_body = UserProfileSerializer(data=request.data)
        if serialized_body.is_valid():
            updated_user = user_util.update_user(request.user.id, serialized_body.validated_data)
            profile = {
                'id': updated_user.id,
                'username': updated_user.username,
                'email': updated_user.email,
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name
            }
            return ObjectResponse.make(profile)
        else:
            return ErrorResponse.make(errors=serialized_body.errors)


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated, ]

    def post(self, request, *args, **kwargs):
        request_data = request.data.copy()
        request_data['user_id'] = request.user.id
        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid():
            request.user.set_password(serializer.data.get("new_password"))
            request.user.save()
            return ObjectResponse.make()
        else:
            return ErrorResponse.make(errors=serializer.errors)


