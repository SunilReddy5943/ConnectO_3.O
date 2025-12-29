import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, getAdminStats, getUnreviewedReportsCount } = useAdmin();

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      router.back();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  const stats = getAdminStats();

  const menuItems = [
    {
      id: 'users',
      title: 'User Management',
      subtitle: `${stats.totalUsers} total users`,
      icon: 'people',
      color: COLORS.primary,
      route: '/admin/users',
      badge: stats.suspendedUsersCount > 0 ? stats.suspendedUsersCount : null,
    },
    {
      id: 'deals',
      title: 'Deal Monitoring',
      subtitle: `${stats.activeDeals} active, ${stats.completedDeals} completed`,
      icon: 'documents',
      color: COLORS.info,
      route: '/admin/deals',
    },
    {
      id: 'reports',
      title: 'User Reports',
      subtitle: `${getUnreviewedReportsCount()} pending review`,
      icon: 'flag',
      color: COLORS.error,
      route: '/admin/reports',
      badge: getUnreviewedReportsCount(),
    },
    {
      id: 'reviews',
      title: 'Review Moderation',
      subtitle: `${stats.flaggedReviewsCount} flagged reviews`,
      icon: 'star-half',
      color: COLORS.warning,
      route: '/admin/reviews',
      badge: stats.flaggedReviewsCount > 0 ? stats.flaggedReviewsCount : null,
    },
    {
      id: 'actions',
      title: 'Admin Action Log',
      subtitle: 'View all admin actions',
      icon: 'list',
      color: COLORS.textMuted,
      route: '/admin/actions',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Internal Use Only</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.error} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="people" size={32} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="hammer" size={32} color={COLORS.success} />
              <Text style={styles.statValue}>{stats.totalWorkers}</Text>
              <Text style={styles.statLabel}>Workers</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.info + '15' }]}>
              <Ionicons name="briefcase" size={32} color={COLORS.info} />
              <Text style={styles.statValue}>{stats.activeDeals}</Text>
              <Text style={styles.statLabel}>Active Deals</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="flag" size={32} color={COLORS.warning} />
              <Text style={styles.statValue}>{getUnreviewedReportsCount()}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
          </View>
        </View>

        {/* Admin Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Tools</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.badge !== null && item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.warningText}>
            This is an internal admin panel. All actions are logged.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  adminBadge: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
});
