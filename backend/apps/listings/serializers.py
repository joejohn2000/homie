"""
Serializers for property listings.
"""

from rest_framework import serializers
from .models import Listing
from apps.users.models import User


class ListingSerializer(serializers.ModelSerializer):
    """Full listing representation."""

    hostUserId = serializers.UUIDField(source='host_id', read_only=True)
    availabilityStatus = serializers.CharField(source='availability_status', read_only=True)
    moveInDate = serializers.DateField(source='move_in_date', read_only=True)
    preferredHabits = serializers.JSONField(source='preferred_habits', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'hostUserId', 'title', 'rent', 'location',
            'availabilityStatus', 'moveInDate', 'preferredHabits',
            'amenities', 'image', 'createdAt',
        ]
        read_only_fields = ['id', 'createdAt']


class CreateListingSerializer(serializers.Serializer):
    """
    Write-only serializer for creating a listing.

    Matches the Node.js POST /api/listings payload.
    """

    hostUserId = serializers.UUIDField()
    title = serializers.CharField(max_length=300)
    rent = serializers.IntegerField()
    location = serializers.CharField(max_length=200)
    moveInDate = serializers.DateField(required=False, allow_null=True)
    preferredHabits = serializers.ListField(
        child=serializers.CharField(), required=False, default=list,
    )
    amenities = serializers.ListField(
        child=serializers.CharField(), required=False, default=list,
    )
    image = serializers.URLField(required=False, allow_blank=True)

    def validate_hostUserId(self, value):
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('Host user not found')
        return value

    def create(self, validated_data):
        host = User.objects.get(id=validated_data['hostUserId'])
        listing = Listing.objects.create(
            host=host,
            title=validated_data['title'],
            rent=validated_data['rent'],
            location=validated_data['location'],
            move_in_date=validated_data.get('moveInDate'),
            preferred_habits=validated_data.get('preferredHabits', []),
            amenities=validated_data.get('amenities', []),
            image=validated_data.get('image') or
                  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
        )
        return listing
