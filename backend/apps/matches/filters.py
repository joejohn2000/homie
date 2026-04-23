"""Filters for the matches app."""

import django_filters
from .models import Match


class MatchFilter(django_filters.FilterSet):
    class Meta:
        model = Match
        fields = ['target_type', 'status']
