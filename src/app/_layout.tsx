/**
 * @file Configures the root Expo Router stack and shared app providers.
 */

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import AuthProvider from '../provider/AuthProvider';
import DrugsProvider from '../provider/DrugsProvider';
import QueryProvider from '../provider/QueryProvider';

SplashScreen.preventAutoHideAsync();

/**
 * Boots the app shell, waits for fonts, and wires global providers around routes.
 */
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <QueryProvider>
        <DrugsProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(pt)" options={{ headerShown: false }} />
            <Stack.Screen name="(hcp)" options={{ headerShown: false }} />
            <Stack.Screen name="hcp_dynamic/drug-details/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="hcp_dynamic/drugs/[subclass_id]" options={{ headerShown: true }} />
            <Stack.Screen
              name="hcp_dynamic/sub-classes/[class_id]"
              options={{ headerShown: true }}
            />
            <Stack.Screen name="patient_dynamic/drugs-pt/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="updatepass" />
            <Stack.Screen
              name="SelectedDrugs/Selectedrugs"
              options={{ headerShown: true, title: 'My Cabinet' }}
            />
          </Stack>
          <StatusBar style="dark" />
        </DrugsProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
