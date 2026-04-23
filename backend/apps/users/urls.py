"""URL routing for the users app."""

from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.user_list_create, name='user-list-create'),
    path('users', views.user_list_create, name='user-list-create-no-slash'),
    path('login/', views.login, name='login'),
    path('login', views.login, name='login-no-slash'),
    path('onboarding/', views.onboarding, name='onboarding'),
    path('onboarding', views.onboarding, name='onboarding-no-slash'),
    path('profile/', views.user_profile, name='user-profile'),
    path('profile', views.user_profile, name='user-profile-no-slash'),
]
