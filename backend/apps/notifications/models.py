"""
Models for notifications and audit events.
"""

import uuid
from django.db import models


class Notification(models.Model):
    """A notification sent to a user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    type = models.CharField(max_length=50)
    payload = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f'{self.type} → {self.recipient}'


class AuditEvent(models.Model):
    """An audit trail event recording system activity."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=50)
    actor = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='audit_events',
    )
    target_id = models.CharField(max_length=100)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Audit Event'
        verbose_name_plural = 'Audit Events'

    def __str__(self):
        return f'{self.type} by {self.actor} on {self.target_id}'
