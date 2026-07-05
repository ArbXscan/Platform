import type { AddressValidationResult, ChainFamily } from "./types"

/** EVM chains (Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Base, Avalanche): 0x + 40 hex chars (20 bytes). */
const EVM_ADDRESS_PATTERN = /^0x[0-9a-f]{40}$/
/** Sui: 0x + 64 hex chars (32 bytes), canonical padded form. */
const SUI_ADDRESS_PATTERN = /^0x[0-9a-f]{64}$/
/**
 * Aptos: full account addresses are 32 bytes (64 hex chars). Aptos also has
 * a small set of documented short-form "special" addresses (e.g. 0x1, 0xa)
 * that are 1-2 hex chars unpadded. A broader "1 to 64 hex chars" range was
 * deliberately avoided here — it would falsely overlap with EVM's fixed
 * 40-hex-char format and misreport every EVM address as an ambiguous Aptos
 * candidate too.
 */
const APTOS_ADDRESS_PATTERN = /^0x([0-9a-f]{1,2}|[0-9a-f]{64})$/
/** Solana: base58-encoded public key. Base58 excludes 0, O, I, and l; keys are typically 32-44 characters long. */
const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

/** Checks whether a normalized address matches one specific chain family's format. */
export function matchesFamily(normalized: string, family: ChainFamily): boolean {
  switch (family) {
    case "evm":
      return EVM_ADDRESS_PATTERN.test(normalized)
    case "sui":
      return SUI_ADDRESS_PATTERN.test(normalized)
    case "aptos":
      return APTOS_ADDRESS_PATTERN.test(normalized)
    case "solana":
      return SOLANA_ADDRESS_PATTERN.test(normalized)
    default:
      return false
  }
}

const ALL_FAMILIES: ChainFamily[] = ["evm", "sui", "aptos", "solana"]

/**
 * Validates a normalized address against every supported chain family's
 * format. This is format-level validation only — it never confirms the
 * address actually exists on-chain, since that would require an RPC call
 * this module never makes. Which specific chain(s) the format matches is
 * chain-detector.ts's responsibility, not this function's.
 */
export function validateAddress(normalized: string): AddressValidationResult {
  if (normalized.length === 0) {
    return { status: "invalid", reason: "Address is empty." }
  }

  const matchesAnyFamily = ALL_FAMILIES.some((family) => matchesFamily(normalized, family))

  if (!matchesAnyFamily) {
    return { status: "invalid", reason: "Address does not match any supported chain's format." }
  }

  return { status: "valid", reason: "Address format is valid for at least one supported chain." }
}
