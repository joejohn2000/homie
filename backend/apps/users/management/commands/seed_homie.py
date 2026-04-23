"""
Seed realistic Homie users and listings for local/demo environments.

The command is idempotent: it creates records only when their known names or
titles do not already exist.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password

from apps.listings.models import Listing
from apps.users.models import User


SEED_USERS = [
    {
        'name': 'Alex Morgan',
        'email': 'alex@homie.local',
        'password_hash': make_password('homie123'),
        'role': User.Role.HOST,
        'age': 31,
        'job': 'Product Designer',
        'location': 'Williamsburg, Brooklyn',
        'budget_min': 1200,
        'budget_max': 1900,
        'habits': ['clean', 'quiet', 'pet-friendly'],
        'preferred_locations': ['Brooklyn', 'Williamsburg'],
        'verification_status': User.VerificationStatus.VERIFIED,
        'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60',
        'bio': 'Verified host with a bright room near transit and a calm home rhythm.',
    },
    {
        'name': 'Jordan Lee',
        'email': 'jordan@homie.local',
        'password_hash': make_password('homie123'),
        'role': User.Role.HOST,
        'age': 29,
        'job': 'Software Engineer',
        'location': 'Soho, Manhattan',
        'budget_min': 1500,
        'budget_max': 2400,
        'habits': ['night-owl', 'social', 'clean'],
        'preferred_locations': ['Soho', 'Manhattan'],
        'verification_status': User.VerificationStatus.VERIFIED,
        'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60',
        'bio': 'Offering a furnished room for someone tidy, friendly, and reliable.',
    },
    {
        'name': 'Priya Shah',
        'email': 'priya@homie.local',
        'password_hash': make_password('homie123'),
        'role': User.Role.SEEKER,
        'age': 27,
        'job': 'Data Analyst',
        'location': 'Brooklyn, NY',
        'budget_min': 1000,
        'budget_max': 1700,
        'habits': ['early-riser', 'clean', 'quiet'],
        'preferred_locations': ['Brooklyn', 'Williamsburg'],
        'verification_status': User.VerificationStatus.VERIFIED,
        'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
        'bio': 'Looking for a respectful shared home with predictable routines.',
    },
]


SEED_LISTINGS = [
    {
        'host_name': 'Alex Morgan',
        'title': 'Sunny Williamsburg Room',
        'rent': 1450,
        'location': 'Williamsburg, Brooklyn',
        'preferred_habits': ['clean', 'quiet', 'pet-friendly'],
        'amenities': ['In-unit laundry', 'Near L train', 'Pet friendly'],
        'image': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
    },
    {
        'host_name': 'Jordan Lee',
        'title': 'Furnished Soho Loft Room',
        'rent': 2100,
        'location': 'Soho, Manhattan',
        'preferred_habits': ['clean', 'social', 'night-owl'],
        'amenities': ['Elevator', 'Doorman', 'Furnished'],
        'image': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
    },
]


class Command(BaseCommand):
    help = 'Seed Homie with demo users and listings.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--noinput',
            action='store_true',
            help='Run without confirmation prompts.',
        )

    def handle(self, *args, **options):
        created_users = 0
        for payload in SEED_USERS:
            user, created = User.objects.get_or_create(
                name=payload['name'],
                defaults=payload,
            )
            if not created:
                user.email = payload['email']
                user.password_hash = payload['password_hash']
                user.save(update_fields=['email', 'password_hash'])
            created_users += int(created)

        created_listings = 0
        for payload in SEED_LISTINGS:
            listing_payload = payload.copy()
            host = User.objects.get(name=listing_payload.pop('host_name'))
            _, created = Listing.objects.get_or_create(
                title=listing_payload['title'],
                defaults={
                    **listing_payload,
                    'host': host,
                },
            )
            created_listings += int(created)

        self.stdout.write(
            self.style.SUCCESS(
                f'Seed complete: {created_users} users, {created_listings} listings created.'
            )
        )
