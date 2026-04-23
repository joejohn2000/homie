"""Filters for the discover app."""

import django_filters
from .models import Swipe


class SwipeFilter(django_filters.FilterSet):
    class Meta:
        model = Swipe
        fields = ['target_type', 'decision']
