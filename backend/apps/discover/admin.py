from django.contrib import admin
from .models import Swipe


@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ['actor', 'target_type', 'decision', 'target_id', 'created_at']
    list_filter = ['target_type', 'decision']
    readonly_fields = ['id', 'created_at']
