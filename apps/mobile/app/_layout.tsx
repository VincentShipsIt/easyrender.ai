import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LibraryProvider } from '@/lib/library-context';
import { useTheme } from '@/lib/theme';

void SplashScreen.preventAutoHideAsync();

function Routes() {
  const { user } = useAuth();
  const t = useTheme();

  useEffect(() => {
    if (user !== undefined) void SplashScreen.hideAsync();
  }, [user]);
  if (user === undefined) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.background },
        headerTitleStyle: { color: t.foreground },
        headerTintColor: t.foreground,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: t.background },
      }}
    >
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="render/[id]" options={{ title: '', headerBackTitle: 'Library' }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <LibraryProvider>
          <StatusBar style="auto" />
          <Routes />
        </LibraryProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
