"""Custom permissions for the matches app."""

from rest_framework.permissions import BasePermission


class IsMatchParticipant(BasePermission):
    """Allow access only to match participants."""

    def has_object_permission(self, request, view, obj):
        user_id = request.query_params.get('userId') or request.data.get('userId')
        return str(obj.user_id) == str(user_id)
