"""
Views for discovery and swiping.

Endpoints:
  GET  /api/discover/   — Get compatibility cards for a user
  POST /api/swipe/      — Record a swipe decision
"""

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.users.models import User
from apps.listings.models import Listing
from apps.matches.models import Match, Conversation, Message
from apps.notifications.models import AuditEvent, Notification

from .models import Swipe
from .serializers import SwipeSerializer
from .compat import build_discover_cards, compute_user_compat, compute_listing_compat


def _build_system_message(target_type):
    """Generate the initial system message for a new conversation."""
    if target_type == 'place':
        return 'Available for viewing this Friday.'
    return 'Hey! When are you free to chat?'


@api_view(['GET'])
def discover(request):
    """
    Get compatibility cards for a user.

    Returns people (opposite role) and places (available listings),
    sorted by compatibility score.
    """
    user_id = request.query_params.get('userId')
    if not user_id:
        return Response(
            {'error': 'Missing userId'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    all_users = User.objects.all()
    all_listings = Listing.objects.all()
    cards = build_discover_cards(user, all_users, all_listings)

    return Response({
        'cards': cards,
        'total': len(cards),
        'filtersApplied': {
            'role': user.role,
        },
    })


@api_view(['POST'])
def swipe(request):
    """
    Record a swipe decision.

    If the decision is 'like' and compatibility is >= 88,
    automatically creates a Match, Conversation, and Notification.
    """
    serializer = SwipeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        actor = User.objects.get(id=data['userId'])
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Record the swipe
    swipe_obj = Swipe.objects.create(
        actor=actor,
        target_id=str(data['targetId']),
        target_type=data['targetType'],
        decision=data['decision'],
    )

    # Record audit event
    AuditEvent.objects.create(
        type='swipe.recorded',
        actor=actor,
        target_id=str(data['targetId']),
        metadata={
            'decision': data['decision'],
            'targetType': data['targetType'],
        },
    )

    # Resolve the target and compute compatibility.
    compat_score = 70
    target_participant_id = str(data['targetId'])
    if data['targetType'] == 'person':
        try:
            target_user = User.objects.get(id=data['targetId'])
            compat_score = compute_user_compat(actor, target_user)
            target_participant_id = str(target_user.id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Target user not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
    elif data['targetType'] == 'place':
        try:
            target_listing = Listing.objects.select_related('host').get(id=data['targetId'])
            compat_score = compute_listing_compat(actor, target_listing)
            target_participant_id = str(target_listing.host_id)
        except Listing.DoesNotExist:
            return Response(
                {'error': 'Target listing not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

    if str(actor.id) == target_participant_id:
        return Response(
            {'error': 'Users cannot match with themselves or their own listings'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check for match creation
    match_created = False
    match_id = None
    conversation_id = None

    existing_match = Match.objects.filter(
        user=actor,
        target_id=str(data['targetId']),
    ).first()

    if not existing_match and data['decision'] == 'like' and compat_score >= 88:
        match_created = True

        match = Match.objects.create(
            user=actor,
            target_id=str(data['targetId']),
            target_type=data['targetType'],
            compat_score=compat_score,
            status='active',
        )
        match_id = str(match.id)

        conversation = Conversation.objects.create(
            match=match,
            participant_ids=[str(actor.id), target_participant_id],
        )
        conversation_id = str(conversation.id)

        # Create initial system message
        Message.objects.create(
            conversation=conversation,
            sender_id=target_participant_id,
            body=_build_system_message(data['targetType']),
        )

        # Update conversation last_message_at
        conversation.last_message_at = conversation.created_at
        conversation.save()

        # Send notification
        Notification.objects.create(
            recipient=actor,
            type='match.created',
            payload={
                'matchId': match_id,
                'conversationId': conversation_id,
            },
        )

    badge_count = Match.objects.filter(user=actor).count()

    return Response({
        'decisionAccepted': True,
        'matchCreated': match_created,
        'matchId': match_id,
        'conversationId': conversation_id,
        'newBadgeCount': badge_count,
    })
