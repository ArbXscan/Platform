import { BaseRouterAdapter } from "../base/adapter"

/**
 * 1inch (EVM swap aggregator) adapter — unsupported stub only. No HTTP
 * calls, no SDK, no API key. Unlike the other adapters in this folder, no
 * real integration is planned as part of this milestone; it exists purely so
 * the Verification Engine can recognize the router id and report
 * "unsupported" explicitly instead of falling through as unregistered.
 */
export class OneInchRouterAdapter extends BaseRouterAdapter {
  readonly routerId = "1inch"
  protected readonly supportedChainIds: string[] = []
}
