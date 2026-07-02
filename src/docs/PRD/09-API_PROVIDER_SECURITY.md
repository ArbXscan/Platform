# API Provider Strategy

**Product:** ArbXscan

**Version:** 1.0.0

**Status:** Draft

**Last Updated:** June 2026

---

# Purpose

This document defines the strategy for collecting, validating, and presenting market data within ArbXscan.

The objective is to ensure users receive accurate, transparent, and reliable information from multiple trusted sources.

---

# Core Principle

ArbXscan does not rely on a single data provider.

Every important market value should be validated using multiple independent sources whenever possible.

---

# Supported Data Providers

## Market Data

- DexScreener
- GeckoTerminal
- CoinGecko
- CoinMarketCap (optional)

---

## DEX Data

- Uniswap
- PancakeSwap
- Raydium
- Orca
- Aerodrome
- Camelot
- Trader Joe
- SushiSwap

---

## Aggregators

- Jupiter
- 1inch
- OpenOcean
- KyberSwap
- Odos

---

## Blockchain RPC

- Ethereum RPC
- BNB Chain RPC
- Base RPC
- Arbitrum RPC
- Optimism RPC
- Polygon RPC
- Solana RPC
- Sui RPC

---

## Bridge Providers

- LI.FI
- Across
- Stargate
- Relay
- deBridge

---

# Data Priority

Whenever multiple providers return different values, ArbXscan should prioritize:

1. On-chain data
2. Official DEX quotes
3. Trusted aggregators
4. Analytics platforms

---

# Data Validation

Every market value should include:

- Source
- Timestamp
- Validation Status
- Confidence Score

---

# Confidence Levels

High

- Multiple providers agree.

Medium

- Minor differences between providers.

Low

- Only one provider available.

Unknown

- Unable to verify.

---

# API Failover

If one provider becomes unavailable:

- Automatically switch to backup providers.
- Continue serving available information.
- Notify users if validation is incomplete.

---

# Rate Limiting

The platform should:

- Cache frequently requested data.
- Minimize duplicate API calls.
- Respect provider rate limits.

---

# Data Freshness

Target refresh intervals:

- Prices: 5–15 seconds
- Liquidity: 30–60 seconds
- Token Metadata: Daily
- Supported Chains: Daily

---

# Error Handling

If data cannot be verified:

- Display warning.
- Show available sources.
- Never fabricate missing values.

---

# Future Expansion

Future providers may include:

- Hyperliquid
- Pendle
- Drift
- Meteora
- Cetus
- Bluefin
- Vertex
- GMX

---

# Guiding Principle

> "Trust is built through verification, not assumption."
