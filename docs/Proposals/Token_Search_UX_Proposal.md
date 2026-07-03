# Token Search UX Proposal

## Objective
Improve the token search experience so users always find the correct asset across multiple chains while keeping the architecture compatible with future roadmap items.

## Problem
The current implementation selects a single result based primarily on liquidity. This can produce incorrect matches.

## Goals
- Prioritize search relevance before liquidity.
- Allow users to choose between multiple valid assets.
- Preserve compatibility with future roadmap items.

## Recommended UX
1. Search.
2. Single high-confidence result -> open Token Detail.
3. Multiple results -> Search Results page.
4. User selects the intended asset.

Each result should display:
- Token logo
- Token name
- Symbol
- Chain logo
- Chain name
- Liquidity
- Primary DEX
- Short contract address

## Ranking Strategy
1. Contract address
2. Exact symbol + name
3. Exact symbol
4. Exact name
5. Partial match
6. Liquidity
7. Volume

## Development Rules
- All project documentation must be written in English.
- All source code comments must be written in English.
- Preserve the existing architecture.
- Build must pass after every implementation stage.
