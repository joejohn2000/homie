"""URL routing for the notifications app."""

from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_list, name='notification-list'),
    path('audit-events/', views.audit_event_list, name='audit-event-list'),
]
