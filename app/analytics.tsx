import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { useAuth } from './context/AuthContext';
import { useAnalytics } from './context/AnalyticsContext';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { user, activeRole } = useAuth();
  const { getWorkerAnalytics } = useAnalytics();

  // ACCESS CONTROL: Workers only
  if (activeRole !== 'WORKER') {
    router.back();
    return null;
  }

  const analytics = useMemo(() => {
    if (!user) return null;
    return getWorkerAnalytics(user.id);
  }, [user, getWorkerAnalytics]);

  if (!analytics) return null;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings & Insights</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Earnings</Text>
          
          <View style={styles.earningsGrid}>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Today</Text>
              <Text style={styles.earningsValue}>
                {formatCurrency(analytics.earningsToday)}
              </Text>
            </View>

            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Last 7 Days</Text>
              <Text style={styles.earningsValue}>
                {formatCurrency(analytics.earningsLast7Days)}
              </Text>
            </View>

            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Last 30 Days</Text>
              <Text style={styles.earningsValue}>
                {formatCurrency(analytics.earningsLast30Days)}
              </Text>
            </View>

            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Lifetime</Text>
              <Text style={styles.earningsValue}>
                {formatCurrency(analytics.earningsLifetime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Performance</Text>

          {/* Acceptance Rate */}
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceLabel}>Acceptance Rate</Text>
              <Text style={styles.performanceValue}>{analytics.acceptanceRate}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${analytics.acceptanceRate}%`,
                    backgroundColor: getProgressColor(analytics.acceptanceRate),
                  }
                ]} 
              />
            </View>
            <Text style={styles.performanceDetail}>
              {analytics.acceptedRequests} accepted out of {analytics.totalRequests} requests
            </Text>
          </View>

          {/* Completion Rate */}
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceLabel}>Completion Rate</Text>
              <Text style={styles.performanceValue}>{analytics.completionRate}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${analytics.completionRate}%`,
                    backgroundColor: getProgressColor(analytics.completionRate),
                  }
                ]} 
              />
            </View>
            <Text style={styles.performanceDetail}>
              {analytics.completedWorks} completed out of {analytics.acceptedRequests} accepted
            </Text>
          </View>
        </View>

        {/* Ratings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Ratings & Reviews</Text>

          <View style={styles.ratingsCard}>
            <View style={styles.ratingRow}>
              <View style={styles.ratingMain}>
                <Text style={styles.ratingBig}>
                  {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : 'N/A'}
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.round(analytics.averageRating) ? 'star' : 'star-outline'}
                      size={16}
                      color={COLORS.warning}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.ratingStats}>
                <View style={styles.ratingStatItem}>
                  <Text style={styles.ratingStatValue}>{analytics.totalReviews}</Text>
                  <Text style={styles.ratingStatLabel}>Total Reviews</Text>
                </View>
                <View style={styles.ratingStatItem}>
                  <Text style={styles.ratingStatValue}>{analytics.completedWorks}</Text>
                  <Text style={styles.ratingStatLabel}>Completed Works</Text>
                </View>
              </View>
            </View>

            {analytics.totalReviews === 0 && analytics.completedWorks > 0 && (
              <View style={styles.noReviewsNotice}>
                <Ionicons name="information-circle" size={16} color={COLORS.info} />
                <Text style={styles.noReviewsText}>
                  No reviews yet. Encourage customers to leave feedback!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Request Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Request Breakdown</Text>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.breakdownLabel}>Accepted</Text>
              </View>
              <Text style={styles.breakdownValue}>{analytics.acceptedRequests}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.breakdownLabel}>Completed</Text>
              </View>
              <Text style={styles.breakdownValue}>{analytics.completedWorks}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.breakdownLabel}>Waitlisted</Text>
              </View>
              <Text style={styles.breakdownValue}>{analytics.waitlistedRequests}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.breakdownLabel}>Rejected</Text>
              </View>
              <Text style={styles.breakdownValue}>{analytics.rejectedRequests}</Text>
            </View>
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>

          {analytics.insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Ionicons name="bulb" size={20} color={COLORS.warning} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper: Get progress bar color based on percentage
function getProgressColor(percentage: number): string {
  if (percentage >= 80) return COLORS.success;
  if (percentage >= 60) return COLORS.primary;
  if (percentage >= 40) return COLORS.warning;
  return COLORS.error;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.base,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Earnings Styles
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  earningsCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  earningsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  earningsValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.success,
  },

  // Performance Styles
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  performanceLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  performanceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  performanceDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },

  // Ratings Styles
  ratingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingMain: {
    alignItems: 'center',
  },
  ratingBig: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  ratingStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  ratingStatItem: {
    alignItems: 'center',
  },
  ratingStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  ratingStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  noReviewsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  noReviewsText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  // Breakdown Styles
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Insights Styles
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    gap: SPACING.sm,
  },
  insightText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
