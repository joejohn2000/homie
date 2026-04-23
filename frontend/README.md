# Homie

Homie is a React + Vite prototype for roommate and room discovery.

## Current Product Shape

- onboarding flow for seeker / host setup
- swipe-based discovery experience
- matches list
- bottom navigation
- documentation artifacts for architecture, UML, and data-flow diagrams in `docs/`

## Tech Stack

- React 19
- Vite 5
- Framer Motion
- Lucide React

## Scripts

- `npm run dev` - start the frontend development server
- `npm run server` - start the backend API on port `3001`
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally

## Notes

The repository now includes a lightweight production-oriented backend in `backend/` with file-backed persistence and API flows for:

- onboarding and profile creation
- discovery and recommendation retrieval
- swipe and match creation
- conversation messaging
- viewing requests

Run the stack locally with two terminals:

1. `npm run server`
2. `npm run dev`
