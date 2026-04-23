"""Filters for the listings app."""

import django_filters
from .models import Listing


class ListingFilter(django_filters.FilterSet):
    min_rent = django_filters.NumberFilter(field_name='rent', lookup_expr='gte')
    max_rent = django_filters.NumberFilter(field_name='rent', lookup_expr='lte')

    class Meta:
        model = Listing
        fields = ['availability_status', 'location']
