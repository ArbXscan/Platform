import {
  FiActivity,
  FiZap,
  FiShield,
  FiTrendingUp,
  FiLayers,
  FiGlobe,
  FiCpu,
  FiBarChart2,
} from "react-icons/fi"
import {
  FaXTwitter,
  FaDiscord,
  FaTelegram,
  FaGithub,
} from "react-icons/fa6"
import type {
  NavLink,
  FeatureItem,
  HowItWorksStep,
  SupportedChain,
  WhyReason,
  FaqItem,
  CommunityLink,
  StatItem,
} from "../types/landing"

export const APP_ROUTE = "/app"
export const DOCS_ROUTE = "/docs"

export const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Chains", href: "#chains" },
  { label: "FAQ", href: "#faq" },
  { label: "Community", href: "#community" },
  { label: "Docs", href: DOCS_ROUTE },
]

export const HERO_STATS: StatItem[] = [
  { id: "dex", value: 40, suffix: "+", label: "DEXs Aggregated" },
  { id: "chains", value: 8, suffix: "+", label: "Chains Supported" },
  { id: "pairs", value: 250, suffix: "K+", label: "Pairs Scanned Daily" },
  { id: "uptime", value: 99.9, suffix: "%", label: "Engine Uptime" },
]

export const FEATURES: FeatureItem[] = [
  {
    id: "scanner",
    title: "Real-Time Arbitrage Scanner",
    description:
      "Continuously scans price spreads across DEXs and surfaces profitable routes the instant they appear.",
    icon: FiZap,
  },
  {
    id: "confidence",
    title: "Confidence Engine",
    description:
      "Each opportunity is scored on liquidity, slippage, gas and route stability so you act on signal, not noise.",
    icon: FiShield,
  },
  {
    id: "market",
    title: "Live Market Intelligence",
    description:
      "Unified token analytics, price feeds and volume metrics aggregated from multiple providers in one view.",
    icon: FiActivity,
  },
  {
    id: "aggregation",
    title: "Multi-DEX Aggregation",
    description:
      "DexScreener, Jupiter, GeckoTerminal and RPC sources normalized into a single, reliable data layer.",
    icon: FiLayers,
  },
  {
    id: "analytics",
    title: "Deep Token Analytics",
    description:
      "Drill into any token: liquidity depth, holders, momentum and cross-DEX pricing at a glance.",
    icon: FiBarChart2,
  },
  {
    id: "performance",
    title: "Lightning Performance",
    description:
      "Edge-cached data and an optimized engine keep latency low so opportunities never go stale.",
    icon: FiTrendingUp,
  },
]

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    id: "aggregate",
    step: 1,
    title: "Aggregate",
    description:
      "ArbXscan pulls live data from multiple DEXs and providers, normalizing every feed into one clean data layer.",
  },
  {
    id: "scan",
    step: 2,
    title: "Scan",
    description:
      "The Scanner Engine compares prices across venues in real time to detect arbitrage spreads as they form.",
  },
  {
    id: "score",
    step: 3,
    title: "Score",
    description:
      "The Confidence Engine ranks each opportunity by profitability, liquidity and execution risk.",
  },
  {
    id: "act",
    step: 4,
    title: "Act",
    description:
      "You get a clear, ranked dashboard of opportunities and market insights — ready to move on.",
  },
]

export const SUPPORTED_CHAINS: SupportedChain[] = [
  { id: "ethereum", name: "Ethereum", logo: "/chains/ethereum.svg" },
  { id: "solana", name: "Solana", logo: "/chains/solana.svg" },
  { id: "arbitrum", name: "Arbitrum", logo: "/chains/arbitrum.svg" },
  { id: "base", name: "Base", logo: "/chains/base.svg" },
  { id: "bnb", name: "BNB Chain", logo: "/chains/bnb.svg" },
  { id: "polygon", name: "Polygon", logo: "/chains/polygon.svg" },
  { id: "optimism", name: "Optimism", logo: "/chains/optimism.svg" },
  { id: "avalanche", name: "Avalanche", logo: "/chains/avalanche.svg" },
]

export const WHY_REASONS: WhyReason[] = [
  {
    id: "speed",
    title: "Built for Speed",
    description:
      "Sub-second data refresh and an optimized engine mean you see opportunities before they vanish.",
    icon: FiZap,
  },
  {
    id: "accuracy",
    title: "Signal Over Noise",
    description:
      "Confidence scoring filters out low-quality routes so you only see opportunities worth your time.",
    icon: FiCpu,
  },
  {
    id: "coverage",
    title: "Broad Coverage",
    description:
      "8+ chains and 40+ DEXs in one platform — no more juggling a dozen browser tabs.",
    icon: FiGlobe,
  },
  {
    id: "transparency",
    title: "Full Transparency",
    description:
      "Every metric is sourced and explainable. No black boxes, just clean, auditable data.",
    icon: FiShield,
  },
]

export const FAQS: FaqItem[] = [
  {
    id: "what",
    question: "What is ArbXscan?",
    answer:
      "ArbXscan is a Web3 analytics and arbitrage intelligence platform that aggregates multi-DEX data, scans for arbitrage opportunities in real time, and scores them by confidence.",
  },
  {
    id: "execute",
    question: "Does ArbXscan execute trades for me?",
    answer:
      "ArbXscan is an intelligence and analytics layer. It surfaces and scores opportunities and market data — you stay in full control of execution.",
  },
  {
    id: "chains",
    question: "Which chains and DEXs are supported?",
    answer:
      "ArbXscan currently aggregates 40+ DEXs across 8+ chains including Ethereum, Solana, Arbitrum, Base, BNB Chain, Polygon, Optimism and Avalanche, with more being added.",
  },
  {
    id: "data",
    question: "Where does the data come from?",
    answer:
      "Data is aggregated and normalized from multiple providers including DexScreener, Jupiter, GeckoTerminal and direct RPC sources for maximum reliability.",
  },
  {
    id: "cost",
    question: "Is ArbXscan free to use?",
    answer:
      "You can explore core market analytics for free. Advanced arbitrage intelligence features are part of our pro tier — details on the pricing page.",
  },
]

export const COMMUNITY_LINKS: CommunityLink[] = [
  { id: "x", label: "X / Twitter", href: "https://x.com", icon: FaXTwitter },
  { id: "discord", label: "Discord", href: "https://discord.com", icon: FaDiscord },
  { id: "telegram", label: "Telegram", href: "https://telegram.org", icon: FaTelegram },
  { id: "github", label: "GitHub", href: "https://github.com", icon: FaGithub },
]
