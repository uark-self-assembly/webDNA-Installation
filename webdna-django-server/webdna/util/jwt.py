from rest_framework_jwt.settings import api_settings
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied


def create_token(user):
    jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
    payload = jwt_payload_handler(user)
    token = jwt_encode_handler(payload)
    return token


class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        raise PermissionDenied({'message': 'User does not have permission to access specified project',
                                'project_id': obj.id})


class IsScriptOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        raise PermissionDenied({'message': 'User does not have permission to access specified script',
                                'script_id': obj.id})
