from rest_framework import status
from rest_framework.test import APITestCase

from apps.matches.models import Conversation


class HomieDataFlowTests(APITestCase):
    def test_user_listing_discovery_and_place_match_flow(self):
        seeker_response = self.client.post(
            '/api/users/',
            {
                'name': 'Maya Chen',
                'email': 'maya@example.com',
                'password': 'homie123',
                'role': 'seeker',
                'budget': '1000-1500',
                'location': 'Brooklyn',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
                'habits': ['clean', 'quiet'],
                'preferredLocations': ['Brooklyn'],
            },
            format='json',
        )
        self.assertEqual(seeker_response.status_code, status.HTTP_201_CREATED)
        seeker_id = seeker_response.data['userId']

        host_response = self.client.post(
            '/api/users/',
            {
                'fullName': 'Noah Patel',
                'email': 'noah@example.com',
                'password': 'homie123',
                'role': 'host',
                'budgetMin': 1000,
                'budgetMax': 1600,
                'location': 'Brooklyn',
                'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60',
                'habits': ['clean', 'quiet'],
                'preferredLocations': ['Brooklyn'],
            },
            format='json',
        )
        self.assertEqual(host_response.status_code, status.HTTP_201_CREATED)
        host_id = host_response.data['userId']

        users_response = self.client.get('/api/users/')
        self.assertEqual(users_response.status_code, status.HTTP_200_OK)
        self.assertEqual(users_response.data['total'], 2)

        login_response = self.client.post(
            '/api/login/',
            {
                'email': 'maya@example.com',
                'password': 'homie123',
            },
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data['userId'], seeker_id)

        profile_response = self.client.patch(
            '/api/profile/',
            {
                'userId': seeker_id,
                'name': 'Maya Chen',
                'job': 'UX Researcher',
                'location': 'Williamsburg, Brooklyn',
                'bio': 'Looking for a calm, clean shared home.',
                'budgetMin': 1100,
                'budgetMax': 1500,
                'habits': ['clean', 'quiet'],
                'preferredLocations': ['Williamsburg', 'Brooklyn'],
            },
            format='json',
        )
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['profile']['job'], 'UX Researcher')

        listing_response = self.client.post(
            '/api/listings/',
            {
                'hostUserId': host_id,
                'title': 'Calm Brooklyn Room',
                'rent': 1300,
                'location': 'Brooklyn',
                'preferredHabits': ['clean', 'quiet'],
                'amenities': ['Laundry', 'Near subway'],
            },
            format='json',
        )
        self.assertEqual(listing_response.status_code, status.HTTP_201_CREATED)
        listing_id = str(listing_response.data['listing']['id'])

        discover_response = self.client.get(f'/api/discover/?userId={seeker_id}')
        self.assertEqual(discover_response.status_code, status.HTTP_200_OK)
        target_cards = [
            card
            for card in discover_response.data['cards']
            if card['id'] == listing_id and card['type'] == 'place'
        ]
        self.assertEqual(len(target_cards), 1)

        swipe_response = self.client.post(
            '/api/swipe/',
            {
                'userId': seeker_id,
                'targetId': listing_id,
                'targetType': 'place',
                'decision': 'like',
            },
            format='json',
        )
        self.assertEqual(swipe_response.status_code, status.HTTP_200_OK)
        self.assertTrue(swipe_response.data['matchCreated'])

        conversation = Conversation.objects.get(id=swipe_response.data['conversationId'])
        self.assertEqual(conversation.participant_ids, [seeker_id, host_id])

        viewing_response = self.client.post(
            '/api/viewing-requests/',
            {
                'conversationId': str(conversation.id),
                'listingId': listing_id,
                'requesterUserId': seeker_id,
                'proposedSlots': [
                    {
                        'startAt': '2026-04-24T10:00:00Z',
                        'endAt': '2026-04-24T10:30:00Z',
                    }
                ],
                'note': 'Can I see the room this week?',
            },
            format='json',
        )
        self.assertEqual(viewing_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(viewing_response.data['request']['listingId'], listing_id)
