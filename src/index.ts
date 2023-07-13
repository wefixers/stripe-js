import type { Stripe, StripeConstructor } from '@stripe/stripe-js'

export type {
  Stripe,
  StripeConstructor,
}

const V3_URL = 'https://js.stripe.com/v3'
const V3_URL_REGEX = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/

/**
 * Utility function to find an already existing script with `document.querySelectorAll`.
 *
 * When either `window` or `document` are missing (SSR), this function return `undefined`.
 *
 * ### Note:
 * This function will match any script with an `src` that starts with:
 * - `https://js.stripe.com/v3`
 * - `https://js.stripe.com/v3?`
 * - `https://js.stripe.com/v3/`
 * - `https://js.stripe.com/v3/?`
 */
export function findScript(): HTMLScriptElement | undefined {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const scripts = document.querySelectorAll<HTMLScriptElement>(`script[src^="${V3_URL}"]`)

  for (const script of scripts) {
    if (V3_URL_REGEX.test(script.src)) {
      return script
    }
  }
}

export interface LoadOptions {
  /**
   * @default true
   */
  advancedFraudSignals: boolean
}

/**
 * Attempt to load a Stripe constructor.
 *
 * Returns `undefined` when the browser context is not available, for example on the server side.
 *
 * ### Note:
 * It can trow with:
 * - Expected document.body not to be null. Stripe.js requires a <body> element.
 * - Stripe.js not available
 * - Failed to load Stripe.js
 */
export async function getOrLoadScript(options?: LoadOptions): Promise<StripeConstructor | undefined> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  if (window.Stripe) {
    return window.Stripe
  }

  let script = findScript()

  if (!script) {
    const headOrBody = document.head || document.body

    if (!headOrBody) {
      throw new Error(
        'Expected document.body not to be null. Stripe.js requires a <body> element.',
      )
    }

    script = document.createElement('script')
    script.src = `${V3_URL}${(options && !options.advancedFraudSignals) ? '?advancedFraudSignals=false' : ''}`

    headOrBody.appendChild(script)
  }

  return await new Promise((resolve, reject) => {
    script!.addEventListener('load', () => {
      if (window.Stripe) {
        resolve(window.Stripe)
      }
      else {
        reject(new Error('Stripe.js not available'))
      }
    })

    script!.addEventListener('error', () => {
      reject(new Error('Failed to load Stripe.js'))
    })
  })
}

let stripePromise: Promise<StripeConstructor | undefined> | undefined

/**
 * Load the Stripe library, this function return a cached value after the first invocation.
 *
 * Attempting to change the option after the first invocation is silently ignored.
 *
 * ### Note:
 * It can trow with:
 * - Expected document.body not to be null. Stripe.js requires a <body> element.
 * - Stripe.js not available
 * - Failed to load Stripe.js
 */
export function loadScript(options?: LoadOptions) {
  return stripePromise || (stripePromise = getOrLoadScript(options))
}

/**
 * Create a new {@link Stripe} instance.
 *
 * Returns `undefined` when the browser context is not available, for example on the server side.
 */
export async function loadStripe(...args: Parameters<StripeConstructor>) {
  const stripeConstructor = await loadScript()

  if (stripeConstructor) {
    return stripeConstructor(...args)
  }
}
