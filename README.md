# Stripe-js

> This package is ESM only!

Just like the old good `@stripe/stripe-js`, but no side-effects, no console logs and no warnings.

## Usage

```ts
import { loadStripe } from '@fixers/stripe-js'

// Stripe.js will not be loaded until `loadStripe` is called
const stripe = await loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx')
```

### Disabling advanced fraud detection signals

If you would like to [disable advanced fraud detection](https://stripe.com/docs/disputes/prevention/advanced-fraud-detection#disabling-advanced-fraud-detection) altogether, you need to manually load the script:

```ts
import { loadScript } from '@fixers/stripe-js'

const stripe = await loadScript({
  advancedFraudSignals: true
})

// Note: stripe is undefined in SSR
return stripe('pk_test_TYooMQauvdEDq54NiTphI7jx')
```
