/**
 * @file Authentication layout for handling auth-based route protection
 * and redirect logic in the Expo Router navigation flow.
 */

import { Redirect, Stack } from 'expo-router';

import { useAuth } from '../../provider/AuthProvider';

/**
 * Renders the authentication route layout and handles auth-based redirects.
 *
 * @returns The authentication stack or a redirect based on session state.
 */
export default function AuthLayout() {
  const { session, resetPending } = useAuth();

  if (resetPending) {
    return <Redirect href={'/updatepass'} />;
  }

  if (session) {
    return <Redirect href={'/'} />;
  }

  return <Stack />;
}

