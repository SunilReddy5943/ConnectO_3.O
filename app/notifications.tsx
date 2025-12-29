import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { useAuth } from './context/AuthContext';
import { useNotification, NotificationItem } from './context/NotificationContext';
import EmptyState from './components/EmptyState';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getNotificationsForUser, markAsRead, markAllAsRead } = useNotification();
  const [refreshing, setRefreshing] = React.useState(false);

  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotificationsForUser(user.id);
  }, [user, getNotificationsForUser]);

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    // Mark as read
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.relatedDealId) {
      router.push('/(tabs)/activity');
    } else if (notification.type === 'REVIEW_RECEIVED') {
      router.push('/profile');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEW_REQUEST':
        return 'mail';
      case 'REQUEST_ACCEPTED':
        return 'checkmark-circle';
      case 'REQUEST_WAITLISTED':
        return 'time';
      case 'REQUEST_REJECTED':
        return 'close-circle';
      case 'STATUS_UPDATE':
        return 'sync';
      case 'REVIEW_RECEIVED':
        return 'star';
      default:
        return 'notifications';
    }
  };

  const getNotificationIconColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEW_REQUEST':
        return COLORS.info;
      case 'REQUEST_ACCEPTED':
        return COLORS.success;
      case 'REQUEST_WAITLISTED':
        return COLORS.warning;
      case 'REQUEST_REJECTED':
        return COLORS.error;
      case 'STATUS_UPDATE':
        return COLORS.primary;
      case 'REVIEW_RECEIVED':
        return COLORS.warning;
      default:
        return COLORS.textMuted;
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationIconColor(item.type) + '15' }]}>
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={24}
          color={getNotificationIconColor(item.type)}
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <EmptyState 
      type="notifications" 
      title="All Caught Up!"
      message="You don't have any new notifications. We'll notify you when something important happens."
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Notifications</Text>
        {notifications.length > 0 && notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenHeader: {
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
  screenTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  markAllButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  markAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.base,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  unreadCard: {
    backgroundColor: COLORS.primary + '05',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
