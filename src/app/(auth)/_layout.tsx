import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../provider/AuthProvider';

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

