/**
 * Which address-format family a chain uses. Multiple chains can share the
 * same family (all EVM chains use identical 0x + 40 hex-char addresses),
 * which is why format alone can't always identify one specific chain.
 */
export type ChainFamily = "evm" | "solana" | "sui" | "aptos"

export type AddressValidationStatus = "valid" | "invalid"

/**
 * Result of format-level validation only. This confirms a string is *shaped*
 * like a valid address for at least one supported chain family — it never
 * confirms the address exists on-chain or holds a token contract, since that
 * would require an RPC/provider call this module never makes.
 */
export interface AddressValidationResult {
  status: AddressValidationStatus
  reason: string
}

export interface ChainDetectionCandidate {
  chainId: string
  chainFamily: ChainFamily
  /** "certain" only when exactly one supported chain matches the address's format; "ambiguous" whenever more than one does. */
  confidence: "certain" | "ambiguous"
}

export interface ChainDetectionResult {
  candidates: ChainDetectionCandidate[]
  /** True when the address format is shared by more than one supported chain and can't be narrowed further from the string alone. */
  isAmbiguous: boolean
}

export interface TokenizedAddress {
  raw: string
  normalized: string
  /** True if the input had to be trimmed or case-normalized to reach `normalized`. */
  wasModified: boolean
}

/** Full, normalized result of scanning one raw address string. */
export interface TokenScanResult {
  input: string
  tokenized: TokenizedAddress
  validation: AddressValidationResult
  chainDetection: ChainDetectionResult
  scannedAt: string
}
