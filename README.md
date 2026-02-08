# Village

A neighborhood-based social media app built for NYC residents to connect with their neighbors, share posts, and chat within their buildings.

**Note:** This project is no longer actively maintained. This repo has been made public for reference purposes.

## What is Village?

Village was a hyperlocal social network where everything — posts, feeds, and chat — was scoped to your neighborhood and building. Users signed up with their phone number, picked their neighborhood, and could immediately start posting, commenting, and chatting with neighbors.

### Features

- **Neighborhood feeds** with hot/new sorting and infinite scroll
- **Building-level group chat** powered by Stream Chat (real-time WebSocket messaging)
- **Phone-based auth** via Twilio OTP — no emails or passwords
- **Post engagement** — likes, dislikes, comments with nested replies
- **Content moderation** — profanity filtering, AI abuse detection (OpenAI), community reporting, auto-ban at -5 downvotes
- **Push notifications** via Firebase Cloud Messaging
- **User profiles** with follow/unfollow, blocking, and contact syncing
- **Image uploads** with automatic HEIC conversion and compression

## Tech Stack

### Mobile App (`VillageApp/`)

- **React Native** 0.73 + **Expo** v50 with file-based routing (Expo Router)
- **Stream Chat Expo** for real-time building chat
- **TanStack React Query** for data fetching and infinite pagination
- **React Context** for state management
- Firebase Cloud Messaging + Notifee for push notifications
- Sentry for error tracking

### Backend API (`VillageBackend/`)

- **Node.js 20** + **Express** + **TypeScript**
- **PostgreSQL** with **Prisma** ORM
- **JWT** authentication
- **Twilio** for SMS OTP
- **Stream Chat** server SDK for chat channel management
- **Supabase** for image storage
- **Sharp** for image processing

### Workers (Event-Driven Architecture)

Village uses **RabbitMQ** for async processing across 4 workers:

| Worker | Purpose |
|---|---|
| `VillageEventPublisher` | Receives webhooks, publishes events to RabbitMQ, sends support emails via Resend |
| `VillageEventConsumer` | Processes events — AI content moderation (OpenAI), push notifications, account deletion |
| `VillageNeighborhoodCountsWorker` | Cron job to update neighborhood member counts |
| `VillageRecommendationWorker` | Recommendation engine backed by Redis |

### Infrastructure

- Docker containerized
- PostgreSQL (Supabase-hosted)
- RabbitMQ message broker
- Redis for caching/recommendations

## Project Structure

```
├── VillageApp/                  # React Native / Expo mobile app
│   ├── app/                     # File-based routing (screens)
│   │   ├── (auth)/              # Onboarding & login flow
│   │   └── (drawer)/tabs/       # Main tabs: Feed, Chat, Profile, Notifications
│   ├── components/              # Reusable UI components
│   ├── context/                 # React Context providers
│   ├── lib/                     # API client & utilities
│   └── mutations/               # API mutation hooks
├── VillageBackend/              # Express API server
│   ├── src/
│   │   ├── controllers/         # Route handlers (auth, posts, users, chat, admin)
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Data access layer
│   │   ├── clients/             # External service clients
│   │   └── middleware/          # Auth & upload middleware
│   └── prisma/                  # Database schema & migrations
├── VillageEventPublisher/       # Event publisher worker
├── VillageEventConsumer/        # Event consumer worker
├── VillageNeighborhoodCountsWorker/
├── VillageRecommendationWorker/
└── scripts/                     # Seed & utility scripts
```

## API Overview

| Area | Endpoints |
|---|---|
| **Auth** | Phone OTP login, token verification, version check |
| **Posts** | CRUD, likes/dislikes, reporting, hiding, image attachments |
| **Comments** | Nested comments, likes, reporting |
| **Users** | Profiles, follow/unfollow, blocking, notifications, account deletion |
| **Neighborhoods** | Feed (hot/new), member counts, locked access |
| **Buildings** | CRUD, building-level chat channels |
| **Chat** | Send/edit/delete messages within building channels |
| **Admin** | Post/user/comment moderation, neighborhood management |

## License

This project is provided as-is for reference purposes. No license is granted for commercial use.
