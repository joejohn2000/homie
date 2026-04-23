"""
Serializers for discover and swipe endpoints.
"""

from rest_framework import serializers
from .models import Swipe


class SwipeSerializer(serializers.Serializer):
    """
    Write-only serializer for recording a swipe.

    Matches the Node.js POST /api/swipe payload.
    """

    userId = serializers.UUIDField()
    targetId = serializers.CharField(max_length=100)
    targetType = serializers.ChoiceField(choices=Swipe.TargetType.choices)
    decision = serializers.CharField(max_length=10)

    def validate_decision(self, value):
        decision_map = {
            'right': Swipe.Decision.LIKE,
            'like': Swipe.Decision.LIKE,
            'left': Swipe.Decision.PASS,
            'pass': Swipe.Decision.PASS,
        }

        normalized = decision_map.get(value)
        if not normalized:
            raise serializers.ValidationError("Use 'like'/'pass' or 'right'/'left'.")
        return normalized


class DiscoverCardSerializer(serializers.Serializer):
    """Read-only serializer for discover cards."""

    id = serializers.CharField()
    type = serializers.CharField()
    name = serializers.CharField()
    age = serializers.IntegerField(required=False)
    job = serializers.CharField(required=False)
    rent = serializers.CharField(required=False)
    location = serializers.CharField()
    compat = serializers.IntegerField()
    image = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
