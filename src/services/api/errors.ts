import type { ApiErrorShape } from "../../types/api"

/**
 * Every function in services/ throws this (never a raw Error or fetch rejection),
 * so hooks and features can handle failures the same way regardless of provider.
 */
export class ApiError extends Error implements ApiErrorShape {
  provider?: string
  status?: number

  constructor({ message, provider, status }: ApiErrorShape) {
    super(message)
    this.name = "ApiError"
    this.provider = provider
    this.status = status
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
