"""Custom permissions for the listings app."""

from rest_framework.permissions import BasePermission


class IsListingHost(BasePermission):
    """Allow modification only by the listing's host."""

    def has_object_permission(self, request, view, obj):
        user_id = request.query_params.get('userId') or request.data.get('hostUserId')
        return str(obj.host_id) == str(user_id)
