"""Filters for the notifications app."""

import django_filters
from .models import Notification, AuditEvent


class NotificationFilter(django_filters.FilterSet):
    class Meta:
        model = Notification
        fields = ['type', 'is_read']


class AuditEventFilter(django_filters.FilterSet):
    class Meta:
        model = AuditEvent
        fields = ['type']
