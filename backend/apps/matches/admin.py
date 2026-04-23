from django.contrib import admin
from .models import Match, Conversation, Message, ViewingRequest


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['user', 'target_type', 'compat_score', 'status', 'created_at']
    list_filter = ['target_type', 'status']
    readonly_fields = ['id', 'created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['match', 'last_message_at', 'created_at']
    readonly_fields = ['id', 'created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender_id', 'conversation', 'body', 'sent_at']
    readonly_fields = ['id', 'sent_at']


@admin.register(ViewingRequest)
class ViewingRequestAdmin(admin.ModelAdmin):
    list_display = ['requester', 'listing', 'status', 'created_at']
    list_filter = ['status']
    readonly_fields = ['id', 'created_at']
