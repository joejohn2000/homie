"""
Compatibility scoring engine — ported from domain.js.

Implements budget scoring, habit matching, and location bonuses
to compute compatibility between users and between users and listings.
"""


def _to_title_case(value):
    """Convert hyphenated/spaced string to Title Case."""
    return ' '.join(
        word.capitalize()
        for word in value.replace('-', ' ').split()
        if word
    )


def _overlap_count(left, right):
    """Count how many items in left appear in right (case-insensitive)."""
    right_set = {item.lower() for item in (right or [])}
    return sum(1 for item in (left or []) if item.lower() in right_set)


def budget_score(user, range_min, range_max):
    """
    Score budget compatibility (40–100).

    Full overlap → 100, no overlap → 40.
    """
    if user.budget_max < range_min or user.budget_min > range_max:
        return 40

    overlap_min = max(user.budget_min, range_min)
    overlap_max = min(user.budget_max, range_max)
    overlap = max(0, overlap_max - overlap_min)
    user_range = max(1, user.budget_max - user.budget_min)
    return min(100, 65 + round((overlap / user_range) * 35))


def habit_score(user_habits, candidate_habits):
    """Score habit compatibility (0–25). 8 points per overlapping habit."""
    overlap = _overlap_count(user_habits, candidate_habits)
    return min(25, overlap * 8)


def location_bonus(user, location):
    """Return 8 if candidate location matches any preferred location, else 0."""
    preferred = user.preferred_locations or []
    return 8 if any(loc in (location or '') for loc in preferred) else 0


def compute_user_compat(user, candidate):
    """Compute compatibility score between two users (65–99)."""
    budget = budget_score(user, candidate.budget_min, candidate.budget_max)
    habits = habit_score(user.habits, candidate.habits)
    score = min(99, budget + habits + location_bonus(user, candidate.location))
    return max(65, score)


def compute_listing_compat(user, listing):
    """Compute compatibility score between a user and a listing (68–99)."""
    price = budget_score(user, listing.rent - 200, listing.rent + 100)
    habits = habit_score(user.habits, listing.preferred_habits)
    score = min(99, price + habits + location_bonus(user, listing.location))
    return max(68, score)


def build_person_card(user, candidate):
    """Build a discover card for a person candidate."""
    return {
        'id': str(candidate.id),
        'type': 'person',
        'name': candidate.name,
        'age': candidate.age,
        'job': candidate.job,
        'location': candidate.location,
        'compat': compute_user_compat(user, candidate),
        'image': candidate.avatar,
        'tags': [_to_title_case(h) for h in (candidate.habits or [])[:3]],
    }


def build_listing_card(user, listing):
    """Build a discover card for a place listing."""
    return {
        'id': str(listing.id),
        'type': 'place',
        'name': listing.title,
        'rent': f'${listing.rent:,}/mo',
        'location': listing.location,
        'compat': compute_listing_compat(user, listing),
        'image': listing.image,
        'tags': (listing.amenities or [])[:3],
    }


def build_discover_cards(user, users_qs, listings_qs):
    """
    Build all discover cards for a user.

    Shows opposite-role users and available listings,
    sorted by compatibility score (highest first).
    """
    # People: opposite role only
    people = [
        build_person_card(user, candidate)
        for candidate in users_qs
        if candidate.id != user.id and candidate.role != user.role
    ]

    # Places: available listings not owned by user
    places = [
        build_listing_card(user, listing)
        for listing in listings_qs
        if listing.availability_status == 'available' and listing.host_id != user.id
    ]

    combined = people + places
    combined.sort(key=lambda card: card['compat'], reverse=True)
    return combined
