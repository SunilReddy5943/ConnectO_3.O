import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface RoleSwitcherProps {
  showLabels?: boolean;
  compact?: boolean;
}

export default function RoleSwitcher({ showLabels = true, compact = false }: RoleSwitcherProps) {
  const { user, activeRole, hasRole, switchRole } = useAuth();
  const slideAnim = useRef(new Animated.Value(activeRole === 'CUSTOMER' ? 0 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Show switcher only if user has both roles
  const canSwitchRoles = hasRole('CUSTOMER') && hasRole('WORKER');
  
  if (!canSwitchRoles) {
    return null;
  }

  // Pan responder for drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only start pan if there's significant horizontal movement
        return Math.abs(gesture.dx) > 5 && !isAnimating;
      },
      onPanResponderGrant: () => {
        // Glow animation on touch
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: (_, gesture) => {
        if (containerWidth === 0) return;
        
        // Get current position (0 for Customer, 1 for Worker)
        const currentValue = activeRole === 'CUSTOMER' ? 0 : 1;
        
        // Calculate how much to move based on drag distance
        // containerWidth/2 because slider moves from 0% to 50%
        const dragRatio = gesture.dx / (containerWidth / 2);
        
        // New value is current position + drag amount
        let newValue = currentValue + dragRatio;
        
        // Clamp between 0 and 1
        newValue = Math.max(0, Math.min(1, newValue));
        
        // Update animation value directly
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gesture) => {
        // Fade out glow
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();

        // Determine which side to snap to based on:
        // 1. How far they dragged (gesture.dx)
        // 2. Final velocity (gesture.vx)
        const dragThreshold = containerWidth / 4; // 25% of container width
        const velocityThreshold = 0.3;
        
        const currentIsCustomer = activeRole === 'CUSTOMER';
        
        // Strong drag right or strong velocity right → Worker
        const shouldSwitchToWorker = gesture.dx > dragThreshold || gesture.vx > velocityThreshold;
        // Strong drag left or strong velocity left → Customer  
        const shouldSwitchToCustomer = gesture.dx < -dragThreshold || gesture.vx < -velocityThreshold;
        
        if (currentIsCustomer && shouldSwitchToWorker) {
          handleSwitch();
        } else if (!currentIsCustomer && shouldSwitchToCustomer) {
          handleSwitch();
        } else {
          // Snap back to current position
          animateToPosition(activeRole);
        }
      },
    })
  ).current;

  const animateToPosition = (role: 'CUSTOMER' | 'WORKER') => {
    // Glow effect during transition
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    // Smooth slide
    Animated.spring(slideAnim, {
      toValue: role === 'CUSTOMER' ? 0 : 1,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  };

  useEffect(() => {
    animateToPosition(activeRole);
  }, [activeRole]);

  const handleSwitch = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newRole = activeRole === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER';
    
    // Light haptic feedback (no screen shake)
    try {
      if (Vibration && Vibration.vibrate) {
        Vibration.vibrate(5); // Very light - 5ms instead of 10ms
      }
    } catch (e) {
      // Haptic not available
    }
    
    // Animate to new position
    animateToPosition(newRole);

    try {
      await switchRole(newRole);
    } catch (error) {
      // Revert on error
      animateToPosition(activeRole);
      console.error('Failed to switch role:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleContainerLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Interpolations
  const slidePosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
  });

  const sliderColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primary, COLORS.secondary],
  });

  const customerOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  const workerOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  // Glow effects
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {showLabels && (
        <View style={styles.labelContainer}>
          <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} />
          <Text style={styles.label}>Switch role</Text>
        </View>
      )}
      
      <View 
        style={styles.toggleContainer}
        onLayout={handleContainerLayout}
        {...panResponder.panHandlers}
      >
        {/* Glow Layer Behind Slider */}
        <Animated.View
          style={[
            styles.glowLayer,
            {
              left: slidePosition,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
              backgroundColor: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(37, 99, 235, 0.6)', 'rgba(245, 158, 11, 0.6)'],
              }),
            },
          ]}
        />
              
        {/* Slider Thumb */}
        <Animated.View
          style={[
            styles.slider,
            {
              left: slidePosition,
              backgroundColor: sliderColor,
            },
          ]}
        />
        
        {/* Customer Side */}
        <TouchableOpacity
          style={styles.toggleSide}
          onPress={() => activeRole !== 'CUSTOMER' && handleSwitch()}
          activeOpacity={0.9}
          disabled={isAnimating || activeRole === 'CUSTOMER'}
        >
          <Animated.View style={[styles.labelContent, { opacity: customerOpacity }]}>
            <Ionicons
              name="person"
              size={18}
              color={activeRole === 'CUSTOMER' ? COLORS.white : COLORS.textMuted}
            />
            <Text style={[
              styles.toggleText,
              activeRole === 'CUSTOMER' && styles.toggleTextActive,
            ]}>
              Customer
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Worker Side */}
        <TouchableOpacity
          style={styles.toggleSide}
          onPress={() => activeRole !== 'WORKER' && handleSwitch()}
          activeOpacity={0.9}
          disabled={isAnimating || activeRole === 'WORKER'}
        >
          <Animated.View style={[styles.labelContent, { opacity: workerOpacity }]}>
            <Ionicons
              name="construct"
              size={18}
              color={activeRole === 'WORKER' ? COLORS.white : COLORS.textMuted}
            />
            <Text style={[
              styles.toggleText,
              activeRole === 'WORKER' && styles.toggleTextActive,
            ]}>
              Worker
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {showLabels && (
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            {activeRole === 'CUSTOMER' 
              ? '👤 Hire skilled workers'
              : '🔧 Find work opportunities'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  containerCompact: {
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.base,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.lg,
    padding: 3,
    position: 'relative',
    height: 44,
    ...SHADOWS.sm,
  },
  glowLayer: {
    position: 'absolute',
    top: 3,
    width: '48%',
    bottom: 3,
    borderRadius: BORDER_RADIUS.md,
    zIndex: 0,
  },
  slider: {
    position: 'absolute',
    top: 3,
    width: '48%',
    bottom: 3,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
    zIndex: 1,
  },
  toggleSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  labelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  toggleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  description: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
