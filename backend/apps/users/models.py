"""
User model for the Homie roommate-matching platform.

Represents both seekers (people looking for rooms) and hosts (people listing rooms).
"""

import uuid
from django.contrib.auth.hashers import check_password
from django.db import models


class User(models.Model):
    """A Homie platform user — either a seeker or a host."""

    class Role(models.TextChoices):
        SEEKER = 'seeker', 'Seeker'
        HOST = 'host', 'Host'

    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=True, blank=True)
    password_hash = models.CharField(max_length=255, blank=True, default='')
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=10, choices=Role.choices)
    age = models.IntegerField(null=True, blank=True)
    job = models.CharField(max_length=200, blank=True, default='')
    location = models.CharField(max_length=200, blank=True, default='')
    budget_min = models.IntegerField(default=1000)
    budget_max = models.IntegerField(default=1500)
    habits = models.JSONField(default=list, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    verification_status = models.CharField(
        max_length=10,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    avatar = models.TextField(blank=True, default='')
    bio = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.name} ({self.role})'

    def check_password(self, raw_password):
        return bool(self.password_hash) and check_password(raw_password, self.password_hash)

    @property
    def budget_range(self):
        return f'${self.budget_min:,} - ${self.budget_max:,}'

    @property
    def habit_tags(self):
        """Return first 3 habits in title case."""
        return [
            ' '.join(word.capitalize() for word in h.replace('-', ' ').split())
            for h in (self.habits or [])[:3]
        ]
