"""
Views for notifications and audit events.

Endpoints:
  GET /api/notifications/   — List notifications for a user
  GET /api/audit-events/    — List audit events (admin)
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Notification, AuditEvent
from .serializers import NotificationSerializer, AuditEventSerializer


@api_view(['GET'])
def notification_list(request):
    """List notifications for a specific user."""
    user_id = request.query_params.get('userId')
    if not user_id:
        return Response(
            {'error': 'Missing userId'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    notifications = Notification.objects.filter(recipient_id=user_id)
    serializer = NotificationSerializer(notifications, many=True)
    return Response({
        'total': notifications.count(),
        'notifications': serializer.data,
    })


@api_view(['GET'])
def audit_event_list(request):
    """List all audit events (for admin/debugging)."""
    events = AuditEvent.objects.all()[:100]
    serializer = AuditEventSerializer(events, many=True)
    return Response({
        'total': len(serializer.data),
        'events': serializer.data,
    })
