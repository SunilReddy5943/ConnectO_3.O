import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LocationProvider } from './context/LocationContext';
import { DealProvider } from './context/DealContext';
import { NotificationProvider } from './context/NotificationContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { TrustProvider } from './context/TrustContext';
import { AdminProvider } from './context/AdminContext';
import NotificationIntegrator from './components/NotificationIntegrator';
import TermsAcceptanceModal from './components/TermsAcceptanceModal';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';

// Polyfill fetch to prevent Supabase from trying to import @supabase/node-fetch
if (typeof globalThis.fetch === 'undefined') {
  // @ts-ignore
  globalThis.fetch = fetch;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <AppProvider>
        <LocationProvider>
          <DealProvider>
            <AdminProvider>
              <NotificationProvider>
                <AnalyticsProvider>
                  <TrustProvider>
                    <NotificationIntegrator>
                      <TermsAcceptanceModal onAccept={() => {}} />
                      <OfflineBanner />
                      <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="auth/intent-selection" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/otp" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/worker-register" />
            <Stack.Screen name="auth/role-select" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="search" />
            <Stack.Screen name="worker/[id]" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="analytics" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="referral" options={{ headerShown: false }} />
            <Stack.Screen name="terms" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="saved" />
            <Stack.Screen name="about" />
            <Stack.Screen name="feature-flags" />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
          </Stack>
                    </NotificationIntegrator>
                  </TrustProvider>
                </AnalyticsProvider>
              </NotificationProvider>
            </AdminProvider>
          </DealProvider>
        </LocationProvider>
      </AppProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
