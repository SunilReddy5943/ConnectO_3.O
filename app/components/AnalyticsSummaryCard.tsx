import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsSummaryCard() {
  const router = useRouter();
  const { user } = useAuth();
  const { getWorkerAnalytics } = useAnalytics();

  const analytics = useMemo(() => {
    if (!user) return null;
    return getWorkerAnalytics(user.id);
  }, [user, getWorkerAnalytics]);

  // Animated values for smooth number updates
  const earningsAnim = useRef(new Animated.Value(0)).current;
  const completedAnim = useRef(new Animated.Value(0)).current;
  const ratingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (analytics) {
      // Animate earnings
      Animated.timing(earningsAnim, {
        toValue: analytics.earningsLast30Days,
        duration: 800,
        useNativeDriver: false,
      }).start();

      // Animate completed works
      Animated.timing(completedAnim, {
        toValue: analytics.completedWorks,
        duration: 800,
        useNativeDriver: false,
      }).start();

      // Animate rating
      Animated.timing(ratingAnim, {
        toValue: analytics.averageRating,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [analytics]);

  if (!analytics) return null;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleViewDetails = () => {
    router.push('/analytics');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Performance</Text>
          <Text style={styles.subtitle}>Last 30 Days</Text>
        </View>
        <TouchableOpacity onPress={handleViewDetails} style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.metricsRow}>
        {/* Earnings */}
        <View style={styles.metricCard}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '15' }]}>
            <Ionicons name="cash" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.metricLabel}>Earnings</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(analytics.earningsLast30Days)}
          </Text>
        </View>

        {/* Completed Works */}
        <View style={styles.metricCard}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
            <Ionicons name="checkmark-done" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.metricLabel}>Completed</Text>
          <Text style={styles.metricValue}>{analytics.completedWorks}</Text>
        </View>

        {/* Average Rating */}
        <View style={styles.metricCard}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.warning + '15' }]}>
            <Ionicons name="star" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.metricLabel}>Rating</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.metricValue}>
              {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : 'N/A'}
            </Text>
            {analytics.totalReviews > 0 && (
              <Text style={styles.reviewCount}>({analytics.totalReviews})</Text>
            )}
          </View>
        </View>
      </View>

      {/* Top Insight */}
      {analytics.insights.length > 0 && (
        <View style={styles.insightContainer}>
          <Ionicons name="bulb" size={16} color={COLORS.warning} />
          <Text style={styles.insightText} numberOfLines={2}>
            {analytics.insights[0]}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.base,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs / 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  viewDetailsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs / 2,
  },
  metricValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs / 2,
  },
  reviewCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  insightText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
