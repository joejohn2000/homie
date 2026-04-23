"""
URL configuration for Homie Core project.

All API endpoints are routed under /api/.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    return Response({'ok': True, 'service': 'homie-backend'})


@api_view(['GET'])
def api_root(request):
    """API Root showing available endpoints."""
    return Response({
        'message': 'Welcome to the Homie API',
        'endpoints': {
            'health': request.build_absolute_uri('health/'),
            'users': request.build_absolute_uri('users/'),
            'onboarding': request.build_absolute_uri('onboarding/'),
            'profile': request.build_absolute_uri('profile/'),
            'listings': request.build_absolute_uri('listings/'),
            'discover': request.build_absolute_uri('discover/'),
            'swipe': request.build_absolute_uri('swipe/'),
            'matches': request.build_absolute_uri('matches/'),
            'messages': request.build_absolute_uri('messages/'),
            'notifications': request.build_absolute_uri('notifications/'),
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.listings.urls')),
    path('api/', include('apps.discover.urls')),
    path('api/', include('apps.matches.urls')),
    path('api/', include('apps.notifications.urls')),
]
