"""Custom permissions for the notifications app."""

from rest_framework.permissions import BasePermission


class IsNotificationRecipient(BasePermission):
    """Allow access only to the notification's recipient."""

    def has_object_permission(self, request, view, obj):
        user_id = request.query_params.get('userId')
        return str(obj.recipient_id) == str(user_id)
