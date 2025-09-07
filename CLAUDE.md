# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EMBREL is a React Native/Expo app for airline boarding pass scanning and passenger management. Built with Expo Router, SQLite/Drizzle ORM, and TypeScript. The app scans QR codes on boarding passes to register passengers for specific flights.

## Development Commands

### Core Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run web version
- `npm run lint` - Run ESLint (prefer this for TypeScript validation)
- `npm run db:gen` - Generate Drizzle database migrations
- `tsc --noEmit` - Type check without building

### Database Management
- Database migrations are auto-applied on app startup via `useMigrations` hook
- Schema located at `src/db/schema.ts`
- Generated migrations in `drizzle/` directory
- Always run `npm run db:gen` after schema changes

## Architecture

### Database Layer
- **Drizzle ORM** with SQLite via expo-sqlite
- **Tables**: passengers, sessions, userFlights, settings
- **Service Pattern**: All DB operations go through `DatabaseService` class in `src/services/database-service.ts`
- Auto-migrations handled in root layout (`src/app/_layout.tsx`)

### Data Management
- **React Query** for server state and caching
- **Custom hooks** in `src/hooks/` for data operations
- Query keys follow pattern: `['resource', 'identifier']`
- Mutations auto-invalidate related queries

### Navigation
- **Expo Router** with file-based routing in `src/app/`
- Stack navigation with sessions supporting nested routes
- Route structure: `/` → `/create-flight` → `/session/[sessionId]/scan`

### Component Architecture
- **UI Components**: Reusable components in `src/components/ui/`
- **Feature Components**: Domain-specific in `src/components/{feature}/`
- **Shared Theme**: Constants in `src/constants/theme.ts`
- **Path Mapping**: `@/*` maps to `src/*`
- **Styling**: Native StyleSheet (85% migrated from nativewind)

### QR Code Processing
- **Parser**: `src/utils/qr-parser.ts` handles IATA BCBP and PDF417 formats
- **Validation**: Flight number validation, duplicate detection
- **Audio Feedback**: Success/error sounds via `audioService`
- **Test QR Codes**: Available in `docs/test-qr-codes.md`

### Key Patterns
- **Type Safety**: Full TypeScript with strict mode
- **Error Handling**: Try-catch with user-friendly error messages
- **State Management**: React Query + local component state
- **Focus Management**: Camera lifecycle tied to screen focus

### Session Management
Sessions represent individual flight boarding operations:
- **Status Flow**: ready → active → completed → archived
- **Session Creation**: Links to flight data (number, route, date, time)
- **Passenger Tracking**: All scanned passengers linked to sessions

## File Structure Context

```
src/
├── app/                    # Expo Router pages
├── components/            
│   ├── ui/                # Reusable UI components
│   ├── scanner/           # QR scanning components
│   └── passenger/         # Passenger display components
├── db/                    # Database schema and connection
├── hooks/                 # React Query hooks for data
├── services/              # Business logic services
├── types/                 # TypeScript type definitions
└── utils/                 # Pure utility functions
```

## Important Notes

- **Camera Permissions**: Always handle gracefully with fallback UI
- **Single Camera Rule**: Only one CameraView can be active (Expo limitation)
- **Flight Validation**: QR codes must match expected flight numbers
- **Offline First**: App works without network, SQLite-based
- **Spanish UI**: All user-facing text is in Spanish
- **No Dark Mode**: Simple light theme only
- **PostHog Analytics**: Optional telemetry with environment variables
- **Type Checking**: Use `npm run lint` or `tsc --noEmit` instead of build commands

## Testing

No test framework currently configured. When adding tests, check for existing patterns in the codebase first. Test QR codes and scenarios available in `docs/test-qr-codes.md`.