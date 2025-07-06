# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **Universal Book Challenge Mini App** - a Russian book reading challenge application that works as both a VKontakte mini-app and a Telegram mini-app. The system consists of three main components:

1. **Frontend** (React/TypeScript/VKUI): Universal Mini App with platform detection and adaptive UI
2. **Backend** (Node.js/Express): API layer that interfaces between frontend and PocketBase  
3. **PocketBase**: Database backend with custom hooks for Google Books API integration

### Key Architecture Points
- **Three-tier architecture**: Frontend → Backend API → PocketBase DB
- **Universal Mini App**: Automatically detects and supports both VK and Telegram platforms
- **Platform Integration**: Uses VK Bridge for VK platform, Telegram WebApp SDK for Telegram
- **Adaptive Authentication**: Platform-specific user authentication (VK signatures vs Telegram auth)
- **Book data**: Integrated with Google Books API through PocketBase hooks for searching/importing books
- **User system**: Universal user management supporting both VK and Telegram users
- **Badge system**: Achievement system for reading milestones and challenges

## Development Commands

### Quick Start Development
```bash
# Start all services in development mode (recommended)
./start-dev.sh
# or
docker-compose -f docker-compose.dev.yaml up --build --watch
# Note: In dev mode, only PocketBase runs in Docker. Frontend and Backend run locally via start-dev.sh
```

### Production Deployment  
```bash
# Deploy to production
./deploy-prod.sh
# or  
docker-compose up --build -d
```

### Individual Service Commands

**Frontend (React/Vite/TypeScript):**
```bash
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run lint         # ESLint
npm test             # Run tests with Vitest
npm run test:run     # Run tests once without watch mode
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Test coverage
npm run tunnel       # VK tunnel for sharing localhost
npm run deploy       # Deploy to VK hosting
npm run prepare      # Husky Git hooks setup
```

**Backend (Node.js/Express):**
```bash
cd backend  
npm run dev          # Development with nodemon
npm start            # Production start
npm test             # Run Jest tests
```

### Service URLs
- Frontend: http://localhost:8080 (production) or http://localhost:5173 (dev)
- Backend API: http://localhost:3000
- PocketBase Admin: http://localhost:8080/_/ (dev mode) or http://localhost:8090/_/ (production)
- PocketBase API: http://localhost:8080/api/ (dev mode) or http://localhost:8090/api/ (production)

## Mock Data System

The frontend has a comprehensive mock system controlled by `frontend/src/config/mockConfig.ts`:
- Set `ENABLE_MOCK_MODE = true` to use mock data instead of real API calls
- Mock data is centralized and predictable - never falls back automatically on API errors
- Located in `frontend/src/mocks/` directory

## Key Files and Directories

**Frontend Structure:**
- `src/App.tsx` - Main app component with routing
- `src/panels/` - VKUI panels (screens)
- `src/components/` - Reusable components  
- `src/hooks/` - Custom React hooks for API integration
  - `useUniversalUser.ts` - Universal user hook supporting both VK and Telegram
  - `useVKUser.ts` - Legacy VK-specific user hook (still available)
- `src/types/index.ts` - TypeScript type definitions (extended for both platforms)
- `src/utils/` - Utility functions including badge criteria
  - `platformDetection.ts` - Platform detection utilities (VK vs Telegram)

**Backend Structure:**
- `index.js` - Express server entry point
- `routes/` - API route handlers (books, users, badges, etc.)
  - `vkUsers.js` - Universal user routes supporting both VK and Telegram users
- `utils/` - Utility functions including badge awarding logic
- `__tests__/` - Jest test files

**PocketBase:**
- `pb_hooks/` - Server-side JavaScript hooks for database events
  - `main.pb.js` - Google Books API integration and book search functionality
  - `bookManagement.pb.js` - Additional book management endpoints (create, get by ID)
- `pb_migrations/` - Database schema migrations (extended for Telegram support)
  - `1687801091_create_vk_users_collection.js` - User collection with telegram_user_id field
- `pb_public/` - Public assets (badge images in PNG/WebP formats)

## Testing

- **Frontend**: Vitest + Testing Library (`npm test` in frontend/)
- **Backend**: Jest (`npm test` in backend/)
- **End-to-end**: No e2e tests currently configured

## Important Notes

- The app is in **Russian language** - this is a Russian book reading challenge
- **Universal Platform Support**: Automatically detects and works on both VK and Telegram platforms
- **Platform Integration**: 
  - VK: Uses VK Bridge for user auth and platform features
  - Telegram: Uses Telegram WebApp SDK (@twa-dev/sdk) for platform integration
- **User Authentication**: Platform-specific authentication (VK signatures for VK, Telegram auth for Telegram)
- **Book Search**: Powered by Google Books API through PocketBase hooks with manual book filtering and enhanced search capabilities
- **Badge System**: Complex achievement system with criteria in `frontend/src/utils/badgeCriteria.ts`
- **PDF Generation**: Backend can generate reading lists as PDFs using @react-pdf/renderer
- **Enhanced Book Management**: Support for manual book additions, improved search filtering, and book categorization
- **Performance Optimization**: Caching mechanisms for book searches and improved database query performance

## Platform-Specific Development

### VK Mini App
- Uses VKUI components for native VK styling
- VK Bridge integration for platform features
- VK signature verification for security

### Telegram Mini App  
- Uses same VKUI components (works well in Telegram WebView)
- Telegram WebApp SDK for platform features
- Telegram's built-in authentication

### Universal Development
- Use `useUniversalUser()` hook for cross-platform user management
- Use `detectPlatform()` utility for platform-specific logic
- Platform detection is automatic - no manual configuration needed

### Testing Different Platforms
```javascript
// For development testing
localStorage.setItem('debug_platform', 'telegram'); // Test Telegram mode
localStorage.setItem('debug_platform', 'vk');       // Test VK mode
localStorage.removeItem('debug_platform');          // Test auto-detection
```