"""URL routing for the matches app."""

from django.urls import path
from . import views

urlpatterns = [
    path('matches/', views.match_list, name='match-list'),
    path('matches', views.match_list, name='match-list-no-slash'),
    path('messages/', views.send_message, name='send-message'),
    path('messages', views.send_message, name='send-message-no-slash'),
    path('viewing-requests/', views.create_viewing_request, name='create-viewing-request'),
    path('viewing-requests', views.create_viewing_request, name='create-viewing-request-no-slash'),
]
