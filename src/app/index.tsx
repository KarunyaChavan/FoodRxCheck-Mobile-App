/**
 * @file Redirects users from the app root according to auth and role state.
 */

import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { useAuth } from '../provider/AuthProvider';

/**
 * Selects the initial route according to session and HCP role state.
 */
export default function Index() {
  const { session, loading, isHcp } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }
  if (!session) {
    return <Redirect href={'/main'} />;
  }
  if (session && isHcp) {
    return <Redirect href={'/(hcp)/hcp_home/DrugList'} />;
  }
  return <Redirect href={'/main'} />;
}
