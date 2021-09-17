
import React, {useEffect} from 'react'
import { StripeProvider } from '@stripe/stripe-react-native';
import PaymentScreen from './PaymentScreen'
// App.ts

export default function App() {
  return (
    <StripeProvider
      publishableKey={'_publishable_key_from_stripe_'}
      merchantIdentifier=""
    >
      <PaymentScreen />
    </StripeProvider>
  );
}
