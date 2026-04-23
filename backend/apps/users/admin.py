from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'location', 'verification_status', 'created_at']
    list_filter = ['role', 'verification_status']
    search_fields = ['name', 'location', 'job']
    readonly_fields = ['id', 'created_at']
