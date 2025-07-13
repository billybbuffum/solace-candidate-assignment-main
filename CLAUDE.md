# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development server:**
```bash
npm run dev
```

**Build and deployment:**
```bash
npm run build
npm run start
```

**Linting:**
```bash
npm run lint
```

**Database operations:**
```bash
# Generate migrations
npm run generate

# Apply migrations
npm run migrate:up

# Seed database (via API endpoint)
curl -X POST http://localhost:3000/api/seed
```

**Database setup with Docker:**
```bash
docker compose up -d
npx drizzle-kit push
```

## Architecture Overview

This is a **Next.js 14** application with PostgreSQL database using **Drizzle ORM** for database operations. The app manages a list of advocates (mental health professionals) with search and filtering capabilities.

### Key Components

**Database Layer (`src/db/`):**
- `schema.ts`: Defines the advocates table with fields like firstName, lastName, city, degree, specialties (JSONB), yearsOfExperience, phoneNumber
- `index.ts`: Database connection setup with fallback mock for when DATABASE_URL is not configured
- `seed/advocates.ts`: Contains static advocate data for seeding/development

**API Layer (`src/app/api/`):**
- `advocates/route.ts`: GET endpoint that returns advocate data (defaults to mock data, can be switched to database)
- `seed/route.ts`: POST endpoint for seeding database with advocate data

**Frontend (`src/app/`):**
- `page.tsx`: Main React component with advocate search/filter functionality and table display
- Uses client-side rendering with useState/useEffect
- Implements real-time search filtering across multiple fields

### Database Configuration

The app is designed to work with or without database setup:
- **Without database**: Uses mock data from `src/db/seed/advocates.ts`
- **With database**: Uncomment DATABASE_URL in `.env` and the database query line in `src/app/api/advocates/route.ts`
- PostgreSQL connection details are in `docker-compose.yml` and `.env`

### Important Notes

- The main search functionality filters advocates by firstName, lastName, city, degree, specialties, and yearsOfExperience
- Specialties are stored as JSONB arrays in the database
- The app includes comprehensive seed data with 15 advocates covering various mental health specialties
- Database migrations use Drizzle Kit: `npx drizzle-kit push` to sync schema changes