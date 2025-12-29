import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

/**
 * Offline Banner Component
 * 
 * NOTE: This component is currently disabled because network detection packages
 * (@react-native-community/netinfo or expo-network) are not installed.
 * 
 * To enable offline detection:
 * 1. Install: npx expo install @react-native-community/netinfo
 * 2. Uncomment the network checking logic below
 * 3. Test on device (network detection doesn't work reliably in simulator)
 */

export default function OfflineBanner() {
  // Offline detection disabled - package not installed
  // Uncomment when @react-native-community/netinfo is installed
  
  /*
  const [isOffline, setIsOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    // Network detection code here
    // import NetInfo from '@react-native-community/netinfo';
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   const offline = !state.isConnected;
    //   setIsOffline(offline);
    //   Animated.timing(slideAnim, {
    //     toValue: offline ? 0 : -60,
    //     duration: 250,
    //     useNativeDriver: true,
    //   }).start();
    // });
    // return () => unsubscribe();
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
  */
  
  // Return null until network package is installed
  return null;
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl, // Account for status bar
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    zIndex: 9999,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
