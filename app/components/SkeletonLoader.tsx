import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = BORDER_RADIUS.md, style }: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

// Worker Card Skeleton
export function WorkerCardSkeleton() {
  return (
    <View style={styles.workerCard}>
      <SkeletonBox width={60} height={60} borderRadius={30} />
      <View style={styles.workerCardContent}>
        <SkeletonBox width="70%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonBox width="50%" height={12} style={{ marginBottom: 6 }} />
        <SkeletonBox width="40%" height={12} />
      </View>
    </View>
  );
}

// Activity Card Skeleton
export function ActivityCardSkeleton() {
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <View style={styles.activityHeaderText}>
          <SkeletonBox width="60%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonBox width="40%" height={10} />
        </View>
        <SkeletonBox width={70} height={24} borderRadius={12} />
      </View>
      <SkeletonBox width="90%" height={14} style={{ marginTop: 12, marginBottom: 8 }} />
      <SkeletonBox width="70%" height={14} />
      <View style={styles.activityDetails}>
        <SkeletonBox width="45%" height={12} />
        <SkeletonBox width="45%" height={12} />
      </View>
    </View>
  );
}

// Notification Skeleton
export function NotificationSkeleton() {
  return (
    <View style={styles.notificationCard}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={styles.notificationContent}>
        <SkeletonBox width="80%" height={14} style={{ marginBottom: 6 }} />
        <SkeletonBox width="60%" height={12} style={{ marginBottom: 4 }} />
        <SkeletonBox width="30%" height={10} />
      </View>
    </View>
  );
}

// List Skeleton
export function ListSkeleton({ count = 5, type = 'worker' }: { count?: number; type?: 'worker' | 'activity' | 'notification' }) {
  const items = Array.from({ length: count }, (_, i) => i);
  
  const SkeletonComponent = type === 'worker' 
    ? WorkerCardSkeleton 
    : type === 'activity' 
    ? ActivityCardSkeleton 
    : NotificationSkeleton;

  return (
    <View style={styles.listContainer}>
      {items.map((i) => (
        <SkeletonComponent key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.borderLight,
  },
  listContainer: {
    padding: SPACING.base,
  },
  workerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  workerCardContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  activityCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityHeaderText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  notificationContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
});

export default SkeletonBox;
