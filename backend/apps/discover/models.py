"""
Swipe model for tracking user discovery decisions.
"""

import uuid
from django.db import models


class Swipe(models.Model):
    """Records a user's swipe decision on a person or place."""

    class TargetType(models.TextChoices):
        PERSON = 'person', 'Person'
        PLACE = 'place', 'Place'

    class Decision(models.TextChoices):
        LIKE = 'like', 'Like'
        PASS = 'pass', 'Pass'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='swipes',
    )
    target_id = models.CharField(max_length=100)
    target_type = models.CharField(max_length=10, choices=TargetType.choices)
    decision = models.CharField(max_length=10, choices=Decision.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Swipe'
        verbose_name_plural = 'Swipes'

    def __str__(self):
        return f'{self.actor} → {self.decision} on {self.target_type}:{self.target_id}'
