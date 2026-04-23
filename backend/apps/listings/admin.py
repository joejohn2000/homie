from django.contrib import admin
from .models import Listing


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'rent', 'location', 'availability_status', 'host', 'created_at']
    list_filter = ['availability_status', 'location']
    search_fields = ['title', 'location']
    readonly_fields = ['id', 'created_at']
