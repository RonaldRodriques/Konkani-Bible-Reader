# Replit.md

## Overview

This is a **Konkani Bible app** (कोंकणी बायबल) — a mobile-first Bible reader built with Expo/React Native that displays scripture text in the Konkani language (Devanagari script). The app allows users to browse books of the Bible, read chapters with verse-by-verse display, bookmark verses, highlight with colors, add personal notes, search across the Bible, and use text-to-speech for reading aloud. It includes a daily verse feature, dark/light theme support, and adjustable font sizes.

The project uses a dual architecture: an Expo React Native frontend for the mobile/web UI and an Express backend server. User data (bookmarks, highlights, notes, settings) is stored locally via AsyncStorage on the client side.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using expo-router for file-based routing
- **Routing Structure**: Tab-based navigation with 4 tabs (Home, Search, Bookmarks/Saved, Settings) plus modal screens for chapter selection and verse reading
  - `app/(tabs)/` — Main tab screens (index, search, bookmarks, settings)
  - `app/chapters.tsx` — Chapter selection screen for a given book
  - `app/reader.tsx` — Full verse reader with actions (bookmark, highlight, notes, TTS, share)
- **State Management**: React Context for theme (`ThemeContext`) and user data (`UserDataContext`), TanStack React Query for any server data fetching
- **Fonts**: Noto Sans Devanagari (4 weights) loaded via `@expo-google-fonts` for proper Konkani/Devanagari script rendering
- **Local Storage**: AsyncStorage for all user data (bookmarks, highlights, notes, theme preferences, font size). Defined in `lib/storage.ts`
- **Bible Data**: Static data files in `data/` directory:
  - `bible-meta.ts` — Book metadata (names in Konkani and English, chapter counts, testament, category)
  - `bible-content.ts` — Actual verse content and search functionality (referenced but not fully shown)
  - `daily-verses.ts` — Curated collection of daily verses in Konkani
- **UI Features**: Dark/light theme with warm earthy color palette (maroon/gold), haptic feedback, text-to-speech (Hindi TTS as proxy for Konkani), share functionality, verse highlighting with 5 colors
- **Read Aloud (TTS)**: Full chapter read-aloud with expo-speech using `hi-IN` language. Features: play/pause/stop, skip forward/back between verses, 4 speed options (0.6x, 0.85x, 1.0x, 1.3x), auto-scroll to current verse with gold highlight, verse-by-verse sequential reading. Speaker icon in reader header, bottom control bar when active.
- **Voice Search**: Microphone button in search bar opens voice command modal. On web: uses Web Speech API for speech-to-text. On mobile: text input with example command chips. Parses Konkani/English voice commands like "उत्पत्ति अध्याय 1 वाच" or "Psalm 23" to navigate directly to chapters.

### Backend (Express)

- **Framework**: Express 5 running on Node.js
- **Purpose**: Primarily serves as a deployment server. In development, it proxies to Metro bundler. In production, it serves the static web build.
- **Routes**: Defined in `server/routes.ts` — currently minimal, prefixed with `/api`
- **Storage**: In-memory storage (`MemStorage`) with a basic User model. The server-side storage is largely unused — the app is primarily client-side.
- **CORS**: Configured for Replit domains and localhost development
- **Database Schema**: Drizzle ORM with PostgreSQL configured (`shared/schema.ts`) but only has a basic `users` table. The actual Bible data and user annotations are handled client-side, not in the database.

### Key Design Decisions

1. **Client-side data storage over server database**: All user data (bookmarks, highlights, notes) uses AsyncStorage rather than the PostgreSQL database. This means the app works fully offline but data doesn't sync across devices.

2. **Static Bible content**: Bible text is embedded in the app as static TypeScript data files rather than fetched from an API. This enables offline reading and fast access.

3. **Expo Router with file-based routing**: Uses the newer expo-router approach with typed routes for navigation safety.

4. **Hindi TTS for Konkani**: Since dedicated Konkani TTS isn't widely available, the app uses `hi-IN` (Hindi) as the TTS language, which works reasonably well for Devanagari-script Konkani.

5. **Warm, traditional color scheme**: The app uses maroon (`#7B2D26`) and gold (`#C4913D`) as primary colors, giving it a traditional, reverent feel appropriate for a religious text.

## External Dependencies

- **PostgreSQL (via Drizzle ORM)**: Configured in `drizzle.config.ts` and `shared/schema.ts`. Currently only has a `users` table schema. Requires `DATABASE_URL` environment variable. The database is minimally used — most data is client-side.
- **AsyncStorage**: Primary data persistence for bookmarks, highlights, notes, and settings — all stored on-device.
- **Expo Services**: Uses various Expo modules including Speech (TTS), Haptics, Clipboard, Image Picker, Linear Gradient, Blur/Glass effects.
- **TanStack React Query**: Set up for API data fetching via `lib/query-client.ts`, configured to work with Replit's domain system (`EXPO_PUBLIC_DOMAIN`).
- **Replit Environment**: The app is designed to run on Replit with specific environment variables (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `REPLIT_INTERNAL_APP_DOMAIN`) for domain configuration and CORS.
- **No external Bible APIs**: All Bible content is bundled within the app.