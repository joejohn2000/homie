# Homie

Homie is now organized as a simple full-stack workspace:

- `frontend/` - React + Vite client
- `backend/` - Django REST Framework API with structured apps and database persistence
- `docs/` - architecture, data-flow, and Draw.io artifacts

## Run the App

From the `homie` root:

1. `npm run migrate:backend`
2. `npm run seed:backend`
3. `npm run dev:backend`
4. `npm run dev:frontend`

Frontend runs through Vite at `http://127.0.0.1:5173/` and proxies `/api` calls to the Django backend on port `8000`.

## Main Backend Flows

- onboarding and profile creation
- direct user creation and registered-user listing
- discovery and recommendation retrieval
- swipe and match creation
- conversation messaging
- viewing request creation
- audit and notification side effects

## Verification

- `npm run test:backend`
- `npm run lint`
- `npm run build`
