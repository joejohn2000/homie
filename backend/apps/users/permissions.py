"""Custom permissions for the users app."""

from rest_framework.permissions import BasePermission


class IsProfileOwner(BasePermission):
    """Allow access only if the requesting user owns the profile."""

    def has_object_permission(self, request, view, obj):
        user_id = request.query_params.get('userId')
        return str(obj.id) == user_id
