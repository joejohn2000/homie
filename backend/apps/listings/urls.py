"""URL routing for the listings app."""

from django.urls import path
from . import views

urlpatterns = [
    path('listings/', views.listing_list_create, name='listing-list-create'),
    path('listings', views.listing_list_create, name='listing-list-create-no-slash'),
]
