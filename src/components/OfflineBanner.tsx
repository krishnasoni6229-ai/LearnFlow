import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const translateY = React.useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        // Rely primarily on state.isConnected being false to trigger offline banner.
        // state.isInternetReachable is notoriously flaky on simulators and local networks.
        const offline = state.isConnected === false;
        setIsOffline(offline);
      } catch {
        setIsOffline(false);
      }
    };

    check();
    interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isOffline ? 0 : -60,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [isOffline, translateY]);

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className="absolute top-0 left-0 right-0 z-50 bg-rose-500 px-4 py-2.5 flex-row items-center justify-center"
    >
      <Ionicons name="cloud-offline-outline" size={16} color="white" />
      <Text className="font-inter-bold text-white ml-2 text-sm">
        {"You're offline — showing cached content"}
      </Text>
    </Animated.View>
  );
}
