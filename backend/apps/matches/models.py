"""
Models for matches, conversations, messages, and viewing requests.
"""

import uuid
from django.db import models


class Match(models.Model):
    """A compatibility match between a user and a person/place."""

    class TargetType(models.TextChoices):
        PERSON = 'person', 'Person'
        PLACE = 'place', 'Place'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        ARCHIVED = 'archived', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='matches',
    )
    target_id = models.CharField(max_length=100)
    target_type = models.CharField(max_length=10, choices=TargetType.choices)
    compat_score = models.IntegerField(default=0)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Match'
        verbose_name_plural = 'Matches'

    def __str__(self):
        return f'Match: {self.user} → {self.target_type}:{self.target_id} ({self.compat_score}%)'


class Conversation(models.Model):
    """A conversation thread associated with a match."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    match = models.OneToOneField(
        Match,
        on_delete=models.CASCADE,
        related_name='conversation',
    )
    participant_ids = models.JSONField(default=list)
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_message_at']
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'

    def __str__(self):
        return f'Conversation for {self.match}'


class Message(models.Model):
    """A message within a conversation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender_id = models.CharField(max_length=100)
    body = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sent_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    def __str__(self):
        return f'Message from {self.sender_id}: {self.body[:50]}'


class ViewingRequest(models.Model):
    """A request to view a listing, created from a conversation."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='viewing_requests',
    )
    listing = models.ForeignKey(
        'listings.Listing',
        on_delete=models.CASCADE,
        related_name='viewing_requests',
    )
    requester = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='viewing_requests',
    )
    proposed_slots = models.JSONField(default=list, blank=True)
    note = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Viewing Request'
        verbose_name_plural = 'Viewing Requests'

    def __str__(self):
        return f'Viewing: {self.requester} → {self.listing} ({self.status})'
