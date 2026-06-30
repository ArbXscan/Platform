# ArbXscan Folder Structure

**Product:** ArbXscan  
**Version:** 1.0.0  
**Status:** Final Draft  
**Last Updated:** June 2026

---

# Overview

This document defines the official folder structure for the ArbXscan frontend and backend system.

All developers (including AI agents like Claude) must follow this structure strictly.

---

# Root Structure

```text
arbxscan/
│
├── docs/
├── public/
├── src/
├── server/
├── scripts/
├── tests/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

# Frontend Structure (src/)

```text
src/
│
├── app/                # App entry & providers
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
│
├── components/        # Reusable UI components
│   ├── ui/            # Base UI components (buttons, inputs)
│   ├── layout/        # Layout components (navbar, sidebar)
│   └── shared/        # Shared components
│
├── pages/             # Page-level components
│   ├── home/
│   ├── dashboard/
│   ├── token/
│   ├── arbitrage/
│   └── market/
│
├── features/         # Feature modules (business logic)
│   ├── token/
│   ├── arbitrage/
│   ├── market/
│   └── watchlist/
│
├── services/         # API calls & external services
│   ├── api/
│   ├── dex/
│   ├── blockchain/
│   └── providers/
│
├── store/            # Zustand state management
│   ├── useUserStore.ts
│   ├── useMarketStore.ts
│   └── useAppStore.ts
│
├── hooks/            # Custom React hooks
│   ├── useToken.ts
│   ├── useArbitrage.ts
│   └── useMarketData.ts
│
├── utils/            # Utility functions
│   ├── format.ts
│   ├── calculate.ts
│   └── validation.ts
│
├── types/            # TypeScript types
│   ├── token.ts
│   ├── market.ts
│   └── api.ts
│
├── constants/        # App constants
│   ├── chains.ts
│   ├── dex.ts
│   └── config.ts
│
└── assets/           # Static assets
    ├── icons/
    ├── images/
    └── logos/
```

---

# Backend Structure (server/)

```text
server/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│
│   ├── routes/        # API routes
│   ├── controllers/   # Request handlers
│   ├── services/      # Business logic
│   ├── providers/     # External API integrations
│   ├── engines/       # Arbitrage engine
│   ├── workers/       # Background jobs
│   ├── middleware/    # Auth, logging, rate limit
│   ├── utils/         # Helper functions
│   └── config/        # Environment config
│
├── database/
│   ├── migrations/
│   └── models/
│
└── tests/
```

---

# Key Architectural Rules

## 1. Separation of Concerns

- UI logic stays in `components` and `pages`
- Business logic stays in `features`
- API calls stay in `services`
- Backend logic stays in `server`

---

## 2. No Monolithic Files

- No single file should exceed 300–400 lines
- Large logic must be split into modules

---

## 3. Feature-Based Structure

Each feature must be self-contained:

Example:
```text
features/arbitrage/
├── arbitrage.service.ts
├── arbitrage.hook.ts
├── arbitrage.types.ts
└── arbitrage.utils.ts
```

---

## 4. Shared Logic Rules

- Shared UI → `components/shared`
- Shared logic → `utils`
- Shared state → `store`

---

## 5. API Layer Rules

All API calls must go through:

```text
services/api/
```

No direct API calls inside components.

---

## 6. Naming Conventions

- Components → PascalCase
- Functions → camelCase
- Files → kebab-case or feature-based naming
- Constants → UPPER_SNAKE_CASE

---

## 7. Scalability Rule

Every new feature must:

- Be modular
- Be reusable
- Not break existing structure
- Follow feature-based architecture

---

# Design Philosophy

- Clean structure over fast shortcuts
- Maintainability over hacky solutions
- Scalability over simplicity when needed

---

# Guiding Principle

> "A good architecture makes future development easier, not harder."
