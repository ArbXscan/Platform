# ArbXscan Coding Standards

**Product:** ArbXscan  
**Version:** 1.0.0  
**Status:** Final Draft  
**Last Updated:** June 2026

---

# Overview

This document defines coding standards for ArbXscan.

All code must follow these rules to ensure consistency, scalability, and maintainability.

---

# General Principles

- Write clean and readable code.
- Avoid unnecessary complexity.
- Prefer clarity over clever tricks.
- Keep components modular.
- Follow consistent patterns across the project.

---

# Language Rules

## Frontend

- Use TypeScript (strict mode enabled)
- Avoid using `any` unless absolutely necessary

## Backend

- Use TypeScript
- All API responses must be typed

---

# React Rules

## Component Structure

Every component must follow this structure:

```text
1. Imports
2. Types / Interfaces
3. Component logic
4. Hooks
5. Return JSX
6. Export
```

---

## Functional Components Only

- Do NOT use class components
- Use hooks for all logic

---

## Hooks Rules

- Custom hooks must start with `use`
- Hooks must not be called conditionally
- Business logic should be moved into custom hooks when possible

---

## Component Size

- Max 300–400 lines per component
- If larger → split into sub-components or hooks

---

# File Organization Rules

- One feature per folder
- No mixed responsibilities in one file
- UI, logic, and API must be separated

Example:

```text
features/arbitrage/
├── arbitrage.page.tsx
├── arbitrage.hook.ts
├── arbitrage.service.ts
├── arbitrage.types.ts
```

---

# Naming Conventions

## Files

- Components: `PascalCase.tsx`
- Hooks: `useFeatureName.ts`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE.ts`

---

## Variables

- Use `camelCase`
- Boolean variables must start with:
  - `is`
  - `has`
  - `can`

Example:

```ts
const isLoading = true;
const hasData = false;
```

---

# API Rules

- All API calls must go through `services/`
- Never call fetch/axios directly inside components
- All API responses must be validated

---

# State Management Rules

- Use Zustand for global state
- Avoid overusing global state
- Keep state minimal and modular

---

# Styling Rules

- Use Tailwind CSS only
- No inline CSS
- No CSS files unless absolutely necessary
- Follow consistent spacing system

---

# Data Handling Rules

- Never trust external API data directly
- Always validate before usage
- Always include fallback values
- Handle loading / error / empty states

---

# Error Handling

Every async operation must include:

- try/catch block
- fallback UI state
- meaningful error message

---

# Performance Rules

- Avoid unnecessary re-renders
- Use memoization when needed
- Lazy load heavy components
- Cache API responses when possible

---

# Anti-Patterns (Forbidden)

- Large monolithic files
- Direct API calls in UI components
- Duplicate logic across files
- Hardcoded values instead of constants
- Missing error handling
- Ignoring TypeScript types

---

# Security Rules

- Never store sensitive data in frontend
- Never expose private keys
- Validate all inputs
- Sanitize API responses
- Use environment variables for secrets

---

# Code Quality Rules

- Run lint before commit
- Follow consistent formatting
- Remove unused code
- Avoid commented-out code in production

---

# Git Rules

- Small, meaningful commits
- Clear commit messages
- Example:

```text
feat: add arbitrage scanner module
fix: correct token price calculation
refactor: optimize API service layer
```

---

# Testing Rules

- Test critical logic (scanner, pricing, API layer)
- Avoid untested core features
- Ensure error cases are tested

---

# Guiding Principle

> "Code should be written once, understood by many, and maintained easily over time."
