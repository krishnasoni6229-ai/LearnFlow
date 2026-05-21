import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, TextInput } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { Provider } from 'react-redux';
import '../global.css';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { store } from '../store';
import { loadUser } from '../store/slices/authSlice';
import { loadPersistedCourseData } from '../store/slices/courseSlice';
import { loadPreferences } from '../store/slices/preferencesSlice';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// Global Font Patch: Ensure all Text components fallback to Inter-Regular if no fontFamily is set
const patchTextComponent = () => {
  const oldTextRender = (Text as any).render;
  if (oldTextRender) {
    (Text as any).render = function (...args: any[]) {
      const origin = oldTextRender.call(this, ...args);
      if (!origin) return origin;
      const style = origin.props.style;
      const hasFontFamily = Array.isArray(style)
        ? style.some(s => s && s.fontFamily)
        : style && style.fontFamily;
      
      if (!hasFontFamily) {
        return React.cloneElement(origin, {
          style: [{ fontFamily: 'Inter-Regular' }, style],
        });
      }
      return origin;
    };
  }

  const oldTextInputRender = (TextInput as any).render;
  if (oldTextInputRender) {
    (TextInput as any).render = function (...args: any[]) {
      const origin = oldTextInputRender.call(this, ...args);
      if (!origin) return origin;
      const style = origin.props.style;
      const hasFontFamily = Array.isArray(style)
        ? style.some(s => s && s.fontFamily)
        : style && style.fontFamily;
      
      if (!hasFontFamily) {
        return React.cloneElement(origin, {
          style: [{ fontFamily: 'Inter-Regular' }, style],
        });
      }
      return origin;
    };
  }
};
patchTextComponent();

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { theme, preferencesLoaded } = useAppSelector((state) => state.preferences);
  const { setColorScheme } = useColorScheme();
  const dispatch = useAppDispatch();
  const segments = useSegments();
  const router = useRouter();

  // Synchronize persisted/default theme preference with NativeWind
  useEffect(() => {
    if (preferencesLoaded && theme) {
      setColorScheme(theme === 'system' ? 'dark' : theme);
    } else {
      setColorScheme('dark'); // Default to dark theme at initial bootstrap
    }
  }, [theme, preferencesLoaded, setColorScheme]);

  useEffect(() => {
    dispatch(loadUser());
    dispatch(loadPersistedCourseData());
    dispatch(loadPreferences());
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)' as any);
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return <>{children}</>;
}



const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10b981', borderLeftWidth: 6, backgroundColor: '#ffffff', borderRadius: 10, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}
      text2Style={{ fontSize: 13, fontWeight: '500', color: '#64748b' }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#f43f5e', borderLeftWidth: 6, backgroundColor: '#ffffff', borderRadius: 10, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}
      text2Style={{ fontSize: 13, fontWeight: '500', color: '#64748b' }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#6366f1', borderLeftWidth: 6, backgroundColor: '#ffffff', borderRadius: 10, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}
      text2Style={{ fontSize: 13, fontWeight: '500', color: '#64748b' }}
    />
  )
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Inter — UI & body text
    'Inter-Regular': require('../../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('../../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('../../assets/fonts/Inter_18pt-SemiBold.ttf'),
    'Inter-Bold': require('../../assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-ExtraBold': require('../../assets/fonts/Inter_18pt-ExtraBold.ttf'),
    'Inter-Black': require('../../assets/fonts/Inter_18pt-Black.ttf'),
    // Outfit — headings only (bold weights)
    'Outfit-Bold': require('../../assets/fonts/Outfit-Bold.ttf'),
    'Outfit-ExtraBold': require('../../assets/fonts/Outfit-ExtraBold.ttf'),
    'Outfit-Black': require('../../assets/fonts/Outfit-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGuard>
      </QueryClientProvider>
      <Toast config={toastConfig} topOffset={60} visibilityTime={4000} />
    </Provider>
  );
}
