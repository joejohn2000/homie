# Homie Diagrams

These diagrams are based on the current implementation in this repository and a recommended next-step production architecture for the same idea.

## Current App Snapshot

Homie is currently a client-side React/Vite prototype with:

- multi-step onboarding
- swipe-based discovery
- matches list
- bottom navigation
- local component state
- mock in-memory data
- remote image assets

There is currently no backend, database, authentication, messaging service, or matching engine implemented in the codebase.

## Current Architecture Diagram

```mermaid
flowchart TD
    U[User] --> B[Browser / Mobile WebView]
    B --> R[React Vite SPA]

    R --> A[App.jsx]
    A --> O[Onboarding]
    A --> D[CardDeck]
    A --> M[Matches]
    A --> N[Navigation]

    O --> S1[Local profile state]
    D --> S2[Local card deck state]
    D --> S3[Local match counter]
    M --> S4[Mock matches data]

    D --> IMG[External image URLs]
    M --> IMG

    subgraph Client Only Prototype
      A
      O
      D
      M
      N
      S1
      S2
      S3
      S4
    end
```

## Recommended Target Architecture

```mermaid
flowchart TD
    U[User] --> FE[Web or Mobile Client]

    FE --> AUTH[Auth Service]
    FE --> API[Backend API]
    FE --> CHAT[Realtime Chat Gateway]

    API --> PROFILE[Profile Service]
    API --> LISTING[Room Listing Service]
    API --> MATCH[Matching Service]
    API --> SEARCH[Search and Filter Service]
    API --> NOTIFY[Notification Service]

    PROFILE --> DB1[(User and Preference DB)]
    LISTING --> DB2[(Listings DB)]
    MATCH --> DB3[(Matches DB)]
    CHAT --> DB4[(Messages Store)]

    LISTING --> MEDIA[Image Storage]
    SEARCH --> GEO[Maps and Geolocation API]
    NOTIFY --> PUSH[Email / Push / SMS Provider]
```

## UML Use Case Diagram

```mermaid
flowchart LR
    user((User))
    seeker((Seeker))
    host((Host))

    user --- onboard[Complete onboarding]
    user --- browse[Browse people or rooms]
    user --- swipeLike[Like a profile or listing]
    user --- swipePass[Pass on a profile or listing]
    user --- viewMatches[View matches]
    user --- openChat[Open conversation]

    seeker --- browse
    host --- browse
    seeker --- onboard
    host --- onboard
```

## UML Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Onboarding
    participant App
    participant CardDeck
    participant Navigation

    User->>Onboarding: Enter name, role, budget
    Onboarding->>App: onComplete(profile)
    App->>App: setUserProfile(profile)
    App->>App: setView("discovery")
    App->>CardDeck: Render discovery cards

    User->>CardDeck: Swipe right or tap heart
    CardDeck->>CardDeck: Evaluate compatibility
    alt Compatibility > 90
        CardDeck->>App: setMatchCount(prev + 1)
        App->>Navigation: Render badge count
    else Compatibility <= 90
        CardDeck->>CardDeck: Remove card only
    end

    User->>Navigation: Tap Matches
    Navigation->>App: setView("matches")
    App-->>User: Show matches list
```

## UML Class Diagram

```mermaid
classDiagram
    class App {
      +view: string
      +userProfile: UserProfile | null
      +matchCount: number
      +handleOnboardingComplete(profile)
    }

    class Onboarding {
      +step: number
      +profile: UserProfile
      +handleNext()
      +onComplete(profile)
    }

    class CardDeck {
      +cards: DiscoveryCard[]
      +lastDirection: string | null
      +swiped(direction, item)
      +setMatchCount(fn)
    }

    class Matches {
      +render()
    }

    class Navigation {
      +currentView: string
      +matchCount: number
      +setView(view)
    }

    class UserProfile {
      +name: string
      +role: string
      +budget: string
      +habits: string[]
    }

    class DiscoveryCard {
      +id: number
      +name: string
      +type: string
      +location: string
      +compat: number
      +image: string
      +tags: string[]
    }

    class MatchItem {
      +id: number
      +name: string
      +lastMsg: string
      +time: string
      +image: string
    }

    App --> Onboarding
    App --> CardDeck
    App --> Matches
    App --> Navigation
    App --> UserProfile
    CardDeck --> DiscoveryCard
    Matches --> MatchItem
    Onboarding --> UserProfile
```

## Notes

- `profile` is collected during onboarding, but the current app does not use it to personalize discovery or matches yet.
- discovery and matches both rely on hardcoded mock data arrays
- the navigation includes a `profile` view trigger, but there is no profile screen implemented in `App.jsx`
- swiping right increments the match count only when compatibility is greater than 90

## Good Next Diagrams To Add Later

- activity diagram for seeker onboarding to first match
- entity relationship diagram for users, listings, matches, and messages
- sequence diagram for real chat and room booking flow
- deployment diagram for frontend, backend, database, storage, and notifications
