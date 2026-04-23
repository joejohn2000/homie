# Homie Backend

Production-ready Django REST Framework API for the Homie roommate-matching platform.

## Tech Stack

- **Python 3.13** + **Django 5.1** + **Django REST Framework**
- **PostgreSQL 17** (via Docker)
- **Docker** & **Docker Compose**

## Quick Start

```bash
# Local SQLite fallback
python manage.py migrate --noinput
python manage.py seed_homie --noinput
python manage.py runserver 127.0.0.1:8000

# Start the backend (builds + runs migrations automatically)
docker-compose up --build

# Or use npm scripts
npm run dev
```

The API will be available at `http://localhost:8000/api/`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health/` | Health check |
| `GET` | `/api/users/` | List users (filter by `?role=`) |
| `POST` | `/api/users/` | Create a registered user directly |
| `POST` | `/api/login/` | Login with email/password credentials |
| `POST` | `/api/onboarding/` | Create user via onboarding |
| `GET` | `/api/profile/` | Get user profile (`?userId=`) |
| `GET` | `/api/listings/` | List available listings |
| `POST` | `/api/listings/` | Create a listing |
| `GET` | `/api/discover/` | Get compatibility cards (`?userId=`) |
| `POST` | `/api/swipe/` | Record swipe decision |
| `GET` | `/api/matches/` | Get user matches (`?userId=`) |
| `POST` | `/api/messages/` | Send a message |
| `POST` | `/api/viewing-requests/` | Create viewing request |

## Development

```bash
# Local test run
python manage.py test

# Seed demo users/listings locally
python manage.py seed_homie --noinput

# Run tests
docker-compose exec web python manage.py test

# Open Django shell
docker-compose exec web python manage.py shell

# View logs
docker-compose logs -f web

# Stop everything
docker-compose down
```

## Project Structure

```
backend/
├── homie_core/          # Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/                # All Django apps
│   ├── users/           # User management & onboarding
│   ├── listings/        # Property listings
│   ├── discover/        # Discovery & swiping
│   ├── matches/         # Matches, conversations, messages
│   └── notifications/   # Notifications & audit trail
├── requirements/        # Separated dependency files
├── Dockerfile
├── docker-compose.yml
└── manage.py
```
