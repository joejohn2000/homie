"""Filters for the users app."""

import django_filters
from .models import User


class UserFilter(django_filters.FilterSet):
    role = django_filters.ChoiceFilter(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ['role', 'verification_status']
