"""
Listing model for property listings on the Homie platform.
"""

import uuid
from django.db import models


class Listing(models.Model):
    """A property listing posted by a host."""

    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        TAKEN = 'taken', 'Taken'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='listings',
    )
    title = models.CharField(max_length=300)
    rent = models.IntegerField()
    location = models.CharField(max_length=200)
    availability_status = models.CharField(
        max_length=12,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE,
    )
    move_in_date = models.DateField(null=True, blank=True)
    preferred_habits = models.JSONField(default=list, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    image = models.URLField(
        max_length=500,
        blank=True,
        default='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Listing'
        verbose_name_plural = 'Listings'

    def __str__(self):
        return f'{self.title} — ${self.rent}/mo'
