"""URL routing for the discover app."""

from django.urls import path
from . import views

urlpatterns = [
    path('discover/', views.discover, name='discover'),
    path('discover', views.discover, name='discover-no-slash'),
    path('swipe/', views.swipe, name='swipe'),
    path('swipe', views.swipe, name='swipe-no-slash'),
]
