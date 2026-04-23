"""
Serializers for notifications and audit events.
"""

from rest_framework import serializers
from .models import Notification, AuditEvent


class NotificationSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    isRead = serializers.BooleanField(source='is_read', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'type', 'payload', 'isRead', 'createdAt']
        read_only_fields = ['id', 'createdAt']


class AuditEventSerializer(serializers.ModelSerializer):
    targetId = serializers.CharField(source='target_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = AuditEvent
        fields = ['id', 'type', 'actor', 'targetId', 'metadata', 'createdAt']
        read_only_fields = ['id', 'createdAt']
