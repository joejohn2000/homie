"""
Serializers for matches, conversations, messages, and viewing requests.
"""

from rest_framework import serializers
from .models import Match, Conversation, Message, ViewingRequest


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual messages."""

    class Meta:
        model = Message
        fields = ['id', 'sender_id', 'body', 'sent_at']
        read_only_fields = ['id', 'sent_at']


class MatchListSerializer(serializers.Serializer):
    """
    Read-only serializer for match list items.

    Includes resolved target info (name, image) and last message preview.
    """

    id = serializers.UUIDField()
    targetId = serializers.CharField(source='target_id')
    name = serializers.CharField()
    image = serializers.CharField()
    conversationId = serializers.CharField(allow_null=True)
    lastMsg = serializers.CharField()
    time = serializers.DateTimeField()
    type = serializers.CharField()


class SendMessageSerializer(serializers.Serializer):
    """
    Write-only serializer for sending a message.

    Matches the Node.js POST /api/messages payload.
    """

    conversationId = serializers.UUIDField()
    senderUserId = serializers.CharField(max_length=100)
    messageText = serializers.CharField()


class CreateViewingRequestSerializer(serializers.Serializer):
    """
    Write-only serializer for creating a viewing request.

    Matches the Node.js POST /api/viewing-requests payload.
    """

    conversationId = serializers.UUIDField()
    listingId = serializers.UUIDField()
    requesterUserId = serializers.UUIDField()
    proposedSlots = serializers.ListField(
        child=serializers.DictField(), required=False, default=list,
    )
    note = serializers.CharField(required=False, allow_blank=True, default='')


class ViewingRequestSerializer(serializers.ModelSerializer):
    """Read-only serializer for viewing request responses."""

    conversationId = serializers.UUIDField(source='conversation_id', read_only=True)
    listingId = serializers.UUIDField(source='listing_id', read_only=True)
    requesterUserId = serializers.UUIDField(source='requester_id', read_only=True)
    proposedSlots = serializers.JSONField(source='proposed_slots', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = ViewingRequest
        fields = [
            'id', 'conversationId', 'listingId', 'requesterUserId',
            'proposedSlots', 'note', 'status', 'createdAt',
        ]
