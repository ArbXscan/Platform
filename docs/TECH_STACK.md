# ArbXscan Tech Stack

**Product:** ArbXscan  
**Version:** 1.0.0  
**Status:** Final Draft  
**Last Updated:** June 2026

---

# Overview

This document defines the official technology stack used to build ArbXscan.

All development decisions must follow this stack unless explicitly updated in future versions.

---

# Frontend

## Core Framework

- React (Vite)

Reason:
- Fast development
- Lightweight build system
- Strong ecosystem

---

## Language

- TypeScript

Reason:
- Type safety
- Better maintainability
- Reduces runtime errors

---

## Styling

- Tailwind CSS

Reason:
- Fast UI development
- Consistent design system
- Highly customizable

---

## UI Components

- shadcn/ui

Reason:
- Professional UI components
- Accessible design
- Easy customization

---

## Icons

- Lucide Icons

Reason:
- Clean design
- Lightweight
- Consistent style

---

## State Management

- Zustand

Reason:
- Simple
- Lightweight
- Scalable for medium complexity apps

---

## Data Fetching

- TanStack Query (React Query)

Reason:
- Caching
- Background refetching
- Optimized API handling

---

## Charts & Visualization

- Recharts

Reason:
- Simple integration
- Suitable for analytics dashboards

---

## Routing

- React Router

Reason:
- Standard routing solution for React apps

---

## Animation

- Framer Motion

Reason:
- Smooth UI transitions
- Professional user experience

---

# Backend (Planned)

## Runtime

- Node.js

Reason:
- JavaScript ecosystem alignment
- High compatibility with Web3 APIs

---

## Framework

- Express.js OR Fastify (final decision later)

Reason:
- Lightweight backend service
- Easy API creation

---

## Architecture Style

- Modular Service Architecture

---

# Database

## Primary Database

- PostgreSQL

Reason:
- Reliable relational database
- Scalable
- Strong consistency

---

## Cache Layer

- Redis

Reason:
- Fast data retrieval
- Reduces API calls
- Improves performance

---

# Data Layer

## External Data Sources

- DexScreener API
- GeckoTerminal API
- CoinGecko API
- Jupiter API
- Uniswap on-chain data
- 1inch API
- LI.FI API

---

# Blockchain Interaction

## RPC Providers

- Ethereum RPC
- BNB Chain RPC
- Solana RPC
- Arbitrum RPC
- Optimism RPC
- Base RPC
- Polygon RPC

---

# Background Processing

## Job System

- Node.js Workers (initial)
- Later upgrade to queue system (BullMQ / Redis Queue)

---

# API Communication

- REST API (MVP)
- WebSocket (future real-time updates)

---

# Dev Tools

- ESLint (code quality)
- Prettier (formatting)
- Vitest (testing)
- Docker (deployment ready environment)

---

# Deployment (Planned)

## Frontend Hosting

- Vercel / Netlify

## Backend Hosting

- AWS / Digital Ocean / Railway

---

# Monitoring (Future)

- Sentry (error tracking)
- Prometheus (metrics)
- Grafana (visualization)

---

# Architecture Philosophy

- Keep it simple first
- Scale only when needed
- Avoid over-engineering
- Prioritize performance and clarity

---

# Key Principle

> "The best stack is not the most complex one, but the one that is easiest to maintain while scaling."
