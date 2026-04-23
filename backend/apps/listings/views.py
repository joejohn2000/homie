"""
Views for property listings.

Endpoints:
  GET  /api/listings/   — List available listings
  POST /api/listings/   — Create a new listing
"""

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Listing
from .serializers import ListingSerializer, CreateListingSerializer
from apps.notifications.models import AuditEvent


@api_view(['GET', 'POST'])
def listing_list_create(request):
    """List all available listings or create a new one."""

    if request.method == 'GET':
        queryset = Listing.objects.filter(availability_status='available')
        serializer = ListingSerializer(queryset, many=True)
        return Response({
            'total': queryset.count(),
            'listings': serializer.data,
        })

    # POST — create listing
    serializer = CreateListingSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    listing = serializer.save()

    # Record audit event
    AuditEvent.objects.create(
        type='listing.created',
        actor=listing.host,
        target_id=str(listing.id),
        metadata={'title': listing.title, 'rent': listing.rent},
    )

    response_serializer = ListingSerializer(listing)
    return Response(
        {'listing': response_serializer.data},
        status=status.HTTP_201_CREATED,
    )
