"""
Serializers for User management and onboarding.
"""

from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from .models import User

# Budget range mapping from the original Node.js domain logic
BUDGET_RANGES = {
    '500-1000': {'min': 500, 'max': 1000},
    '1000-1500': {'min': 1000, 'max': 1500},
    '1500+': {'min': 1500, 'max': 2400},
}

DEFAULT_HABITS = ['clean', 'quiet']

DEFAULT_AVATARS = {
    'host': 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&auto=format&fit=crop&q=60',
    'seeker': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60',
}

DEFAULT_LOCATIONS = {
    'host': ['Brooklyn', 'Williamsburg'],
    'seeker': ['Brooklyn', 'Soho'],
}

DEFAULT_BIOS = {
    'host': 'New host profile created through Homie onboarding.',
    'seeker': 'New seeker profile created through Homie onboarding.',
}

DEFAULT_JOBS = {
    'host': 'Property Host',
    'seeker': 'Room Seeker',
}

DEFAULT_AGES = {
    'host': 30,
    'seeker': 28,
}


class UserListSerializer(serializers.ModelSerializer):
    """Compact user representation for list endpoints."""

    habits = serializers.SerializerMethodField()
    verificationStatus = serializers.CharField(source='verification_status', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role', 'age', 'job', 'location',
            'avatar', 'verificationStatus', 'habits', 'createdAt',
        ]

    def get_habits(self, obj):
        return obj.habit_tags


class UserProfileSerializer(serializers.ModelSerializer):
    """Full profile representation with budget range and all details."""

    budgetRange = serializers.CharField(source='budget_range', read_only=True)
    preferredLocations = serializers.JSONField(source='preferred_locations', read_only=True)
    verificationStatus = serializers.CharField(source='verification_status', read_only=True)
    habits = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role', 'job', 'location', 'budgetRange',
            'habits', 'preferredLocations', 'verificationStatus',
            'bio', 'avatar',
        ]

    def get_habits(self, obj):
        return obj.habit_tags


class OnboardingSerializer(serializers.Serializer):
    """
    Write-only serializer for user onboarding.

    Accepts the same payload as the Node.js POST /api/onboarding endpoint
    and applies the same default-filling logic from domain.js.
    """

    name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    fullName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.Role.choices)
    budget = serializers.CharField(max_length=20, required=False, allow_blank=True)
    budgetMin = serializers.IntegerField(required=False, min_value=0)
    budgetMax = serializers.IntegerField(required=False, min_value=0)

    # Optional fields with smart defaults
    age = serializers.IntegerField(required=False, allow_null=True)
    job = serializers.CharField(max_length=200, required=False, allow_blank=True)
    location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    habits = serializers.ListField(
        child=serializers.CharField(), required=False, default=list,
    )
    preferred_locations = serializers.ListField(
        child=serializers.CharField(), required=False, default=list,
    )
    preferredLocations = serializers.ListField(
        child=serializers.CharField(), required=False, default=list,
    )
    avatar = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        name = attrs.get('name') or attrs.get('fullName')
        if not name:
            raise serializers.ValidationError({'name': 'This field is required.'})

        if User.objects.filter(email__iexact=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'A Homie account already exists for this email.'})

        has_budget_range = attrs.get('budgetMin') is not None and attrs.get('budgetMax') is not None
        if not attrs.get('budget') and not has_budget_range:
            raise serializers.ValidationError({'budget': 'Provide budget or budgetMin/budgetMax.'})

        if has_budget_range and attrs['budgetMin'] > attrs['budgetMax']:
            raise serializers.ValidationError({'budgetMax': 'budgetMax must be greater than budgetMin.'})

        required_selections = {
            'avatar': 'Upload a profile photo.',
            'habits': 'Select at least one lifestyle habit.',
        }
        for field, message in required_selections.items():
            if not attrs.get(field):
                raise serializers.ValidationError({field: message})

        preferred_locations = attrs.get('preferred_locations') or attrs.get('preferredLocations')
        if not preferred_locations:
            raise serializers.ValidationError({'preferredLocations': 'Select at least one preferred place.'})

        return attrs

    def create(self, validated_data):
        role = validated_data['role']
        password = validated_data.pop('password')
        budget_key = validated_data.pop('budget', '')
        budget = BUDGET_RANGES.get(
            budget_key,
            {
                'min': validated_data.pop('budgetMin', 1000),
                'max': validated_data.pop('budgetMax', 1500),
            },
        )

        preferred_locs = (
            validated_data.get('preferred_locations')
            or validated_data.get('preferredLocations')
            or DEFAULT_LOCATIONS.get(role, [])
        )
        name = validated_data.get('name') or validated_data.get('fullName')

        user = User.objects.create(
            email=validated_data['email'].lower(),
            password_hash=make_password(password),
            name=name,
            role=role,
            age=validated_data.get('age') or DEFAULT_AGES.get(role, 28),
            job=validated_data.get('job') or DEFAULT_JOBS.get(role, 'Room Seeker'),
            location=validated_data.get('location') or '',
            budget_min=budget['min'],
            budget_max=budget['max'],
            habits=validated_data.get('habits') or DEFAULT_HABITS,
            preferred_locations=preferred_locs,
            verification_status='pending',
            avatar=validated_data.get('avatar') or DEFAULT_AVATARS.get(role, ''),
            bio=validated_data.get('bio') or DEFAULT_BIOS.get(role, ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Validate email/password login credentials."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            user = User.objects.get(email__iexact=attrs['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError({'credentials': 'Invalid email or password.'})

        if not user.check_password(attrs['password']):
            raise serializers.ValidationError({'credentials': 'Invalid email or password.'})

        attrs['user'] = user
        return attrs


class ProfileUpdateSerializer(serializers.Serializer):
    """Update editable profile fields from the frontend profile page."""

    userId = serializers.UUIDField()
    name = serializers.CharField(max_length=200, required=False, allow_blank=False)
    job = serializers.CharField(max_length=200, required=False, allow_blank=True)
    location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)
    budgetMin = serializers.IntegerField(required=False, min_value=0)
    budgetMax = serializers.IntegerField(required=False, min_value=0)
    habits = serializers.ListField(child=serializers.CharField(), required=False)
    preferredLocations = serializers.ListField(child=serializers.CharField(), required=False)

    def validate(self, attrs):
        budget_min = attrs.get('budgetMin')
        budget_max = attrs.get('budgetMax')
        if budget_min is not None and budget_max is not None and budget_min > budget_max:
            raise serializers.ValidationError({'budgetMax': 'budgetMax must be greater than budgetMin.'})
        return attrs

    def update(self, instance, validated_data):
        field_map = {
            'name': 'name',
            'job': 'job',
            'location': 'location',
            'bio': 'bio',
            'avatar': 'avatar',
            'budgetMin': 'budget_min',
            'budgetMax': 'budget_max',
            'habits': 'habits',
            'preferredLocations': 'preferred_locations',
        }

        for payload_key, model_field in field_map.items():
            if payload_key in validated_data:
                setattr(instance, model_field, validated_data[payload_key])

        instance.save()
        return instance
