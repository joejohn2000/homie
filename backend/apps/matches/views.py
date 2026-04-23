"""
Views for matches, messages, and viewing requests.

Endpoints:
  GET  /api/matches/           — Get user's matches with last message preview
  POST /api/messages/          — Send a message in a conversation
  POST /api/viewing-requests/  — Create a viewing request for a listing
"""

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.users.models import User
from apps.listings.models import Listing
from apps.notifications.models import AuditEvent, Notification

from .models import Match, Conversation, Message, ViewingRequest
from .serializers import (
    SendMessageSerializer,
    CreateViewingRequestSerializer,
    MessageSerializer,
    ViewingRequestSerializer,
)


@api_view(['GET'])
def match_list(request):
    """
    Get all matches for a user.

    Returns matches with resolved target info (name, image)
    and last message preview — same contract as Node.js GET /api/matches.
    """
    user_id = request.query_params.get('userId')
    if not user_id:
        return Response(
            {'error': 'Missing userId'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    matches = Match.objects.filter(user_id=user_id).select_related('conversation')
    result = []

    for match in matches:
        # Resolve target info
        name = 'Match'
        image = ''
        match_type = match.target_type

        if match.target_type == 'person':
            try:
                target_user = User.objects.get(id=match.target_id)
                name = target_user.name
                image = target_user.avatar
            except User.DoesNotExist:
                name = 'Unknown User'
        else:
            try:
                listing = Listing.objects.get(id=match.target_id)
                name = listing.title
                image = listing.image
            except Listing.DoesNotExist:
                name = 'Listing Match'

        # Get conversation and last message
        conversation = getattr(match, 'conversation', None)
        conversation_id = str(conversation.id) if conversation else None
        last_msg = (
            'New compatibility match created.'
            if match.target_type == 'person'
            else 'Viewing request ready to send.'
        )
        time = match.created_at

        if conversation:
            last_message = conversation.messages.order_by('-sent_at').first()
            if last_message:
                last_msg = last_message.body
                time = conversation.last_message_at or last_message.sent_at

        result.append({
            'id': str(match.id),
            'targetId': match.target_id,
            'name': name,
            'image': image,
            'conversationId': conversation_id,
            'lastMsg': last_msg,
            'time': time,
            'type': match_type,
        })

    return Response({
        'total': len(result),
        'matches': result,
    })


@api_view(['POST'])
def send_message(request):
    """
    Send a message in a conversation.

    Matches the Node.js POST /api/messages contract.
    """
    serializer = SendMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        conversation = Conversation.objects.get(id=data['conversationId'])
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    message = Message.objects.create(
        conversation=conversation,
        sender_id=str(data['senderUserId']),
        body=data['messageText'],
    )

    # Update conversation timestamp
    conversation.last_message_at = message.sent_at
    conversation.save(update_fields=['last_message_at'])

    # Record audit event
    try:
        actor = User.objects.get(id=data['senderUserId'])
        AuditEvent.objects.create(
            type='message.sent',
            actor=actor,
            target_id=str(data['conversationId']),
            metadata={'bodyLength': len(data['messageText'])},
        )
    except User.DoesNotExist:
        pass

    message_serializer = MessageSerializer(message)
    return Response(
        {'message': message_serializer.data},
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
def create_viewing_request(request):
    """
    Create a viewing request for a listing.

    Matches the Node.js POST /api/viewing-requests contract.
    """
    serializer = CreateViewingRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        conversation = Conversation.objects.get(id=data['conversationId'])
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        listing = Listing.objects.get(id=data['listingId'])
    except Listing.DoesNotExist:
        return Response(
            {'error': 'Listing not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        requester = User.objects.get(id=data['requesterUserId'])
    except User.DoesNotExist:
        return Response(
            {'error': 'Requester not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    viewing = ViewingRequest.objects.create(
        conversation=conversation,
        listing=listing,
        requester=requester,
        proposed_slots=data.get('proposedSlots', []),
        note=data.get('note', ''),
    )

    # Send notification
    Notification.objects.create(
        recipient=requester,
        type='viewing.requested',
        payload={
            'requestId': str(viewing.id),
            'listingId': str(listing.id),
        },
    )

    response_serializer = ViewingRequestSerializer(viewing)
    return Response(
        {'request': response_serializer.data},
        status=status.HTTP_201_CREATED,
    )
