"""Custom permissions for the discover app."""

from rest_framework.permissions import BasePermission


class IsSwipeActor(BasePermission):
    """Allow access only to the swipe's actor."""

    def has_object_permission(self, request, view, obj):
        user_id = request.data.get('userId')
        return str(obj.actor_id) == str(user_id)
