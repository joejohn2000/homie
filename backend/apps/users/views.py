"""
Views for user management and onboarding.

Endpoints:
  GET  /api/users/           — List users, filterable by ?role=
  POST /api/users/           — Create a user directly
  POST /api/login/           — Login with email and password
  POST /api/onboarding/      — Create user via onboarding flow
  GET  /api/profile/         — Get full user profile by ?userId=
  PATCH /api/profile/        — Update editable profile fields
"""

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import User
from .serializers import (
    LoginSerializer,
    OnboardingSerializer,
    ProfileUpdateSerializer,
    UserListSerializer,
    UserProfileSerializer,
)
from apps.notifications.models import AuditEvent


def _create_user_response(user):
    AuditEvent.objects.create(
        type='user.created',
        actor=user,
        target_id=str(user.id),
        metadata={'role': user.role},
    )

    return {
        'userId': str(user.id),
        'token': f'homie-session-{user.id}',
        'onboardingStatus': 'completed',
        'profileCompleteness': 82,
        'verificationStatus': user.verification_status,
        'matchCount': 0,
        'profile': UserProfileSerializer(user).data,
    }


@api_view(['GET', 'POST'])
def user_list_create(request):
    """List registered users or create a new user."""
    if request.method == 'POST':
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_create_user_response(user), status=status.HTTP_201_CREATED)

    role = request.query_params.get('role')
    queryset = User.objects.all()
    if role:
        queryset = queryset.filter(role=role)

    serializer = UserListSerializer(queryset, many=True)
    return Response({
        'total': queryset.count(),
        'users': serializer.data,
    })


@api_view(['POST'])
def login(request):
    """Authenticate a registered user with email/password credentials."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']

    return Response({
        'userId': str(user.id),
        'token': f'homie-session-{user.id}',
        'profile': UserProfileSerializer(user).data,
        'matchCount': user.matches.count(),
    })


@api_view(['POST'])
def onboarding(request):
    """
    Create a new user through the onboarding flow.

    Returns the new user's profile, a session token, and onboarding metadata.
    """
    serializer = OnboardingSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    payload = _create_user_response(user)
    AuditEvent.objects.filter(actor=user, target_id=str(user.id), type='user.created').update(type='user.onboarded')

    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH'])
def user_profile(request):
    """Get or update full user profile."""
    user_id = request.query_params.get('userId') if request.method == 'GET' else request.data.get('userId')
    if not user_id:
        return Response(
            {'error': 'Missing userId'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == 'PATCH':
        serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        AuditEvent.objects.create(
            type='user.profile_updated',
            actor=user,
            target_id=str(user.id),
            metadata={'fields': sorted(request.data.keys())},
        )

    serializer = UserProfileSerializer(user)
    return Response({'profile': serializer.data})
