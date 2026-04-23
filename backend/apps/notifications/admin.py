from django.contrib import admin
from .models import Notification, AuditEvent


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'type', 'is_read', 'created_at']
    list_filter = ['type', 'is_read']
    readonly_fields = ['id', 'created_at']


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ['type', 'actor', 'target_id', 'created_at']
    list_filter = ['type']
    search_fields = ['target_id']
    readonly_fields = ['id', 'created_at']
