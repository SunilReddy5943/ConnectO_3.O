import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useDeal, DealRequest } from '../context/DealContext';
import { useAdmin } from '../context/AdminContext';
import { useAnalytics } from '../hooks/useAnalytics';
import FloatingAIButton from '../components/FloatingAIButton';
import DealRequestCard from '../components/DealRequestCard';
import ReviewModal from '../components/ReviewModal';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/SkeletonLoader';
import { useReferralPrompt } from '../hooks/useReferralPrompt';

type ActivityTab = 'all' | 'new' | 'accepted' | 'waitlisted' | 'ongoing' | 'completed' | 'rejected';

export default function MyActivityScreen() {
  const router = useRouter();
  const { user, activeRole } = useAuth();
  const { dealRequests, updateDealRequestStatus, updateWorkStatus, submitReview, canSubmitReview } = useDeal();
  const { isUserSuspended } = useAdmin();
  const { showReferralPrompt } = useReferralPrompt();
  const { logDealAccepted, logWorkCompleted, logReviewSubmitted } = useAnalytics();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityTab>('all');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealRequest | null>(null);

  const isWorkerMode = activeRole === 'WORKER';

  // Check for completed work to show referral prompt
  useEffect(() => {
    const checkForCompletedWork = async () => {
      if (!user || !isWorkerMode) return;
      
      // Check if we have any completed work
      const completedWork = dealRequests.filter(
        req => req.workerId === user.id && 
        req.status === 'ACCEPTED' && 
        req.workStatus === 'COMPLETED'
      );
      
      if (completedWork.length > 0) {
        // Show referral prompt after a short delay
        const timer = setTimeout(() => {
          showReferralPrompt('completed_work');
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    };
    
    checkForCompletedWork();
  }, [user, dealRequests, isWorkerMode]);

  // Filter requests based on role - memoized to prevent unnecessary re-renders
  const userRequests = useMemo(() => {
    if (!user) return [];
    
    if (isWorkerMode) {
      return dealRequests.filter(req => req.workerId === user.id);
    } else {
      return dealRequests.filter(req => req.customerId === user.id);
    }
  }, [dealRequests, user, isWorkerMode]); // Re-compute when dealRequests changes

  // Filter by active tab
  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') return userRequests;
    
    if (activeTab === 'new') {
      return userRequests.filter(req => req.status === 'NEW');
    }
    
    if (activeTab === 'accepted') {
      return userRequests.filter(req => req.status === 'ACCEPTED' && req.workStatus === 'ACCEPTED');
    }
    
    if (activeTab === 'waitlisted') {
      return userRequests.filter(req => req.status === 'WAITLISTED');
    }
    
    if (activeTab === 'ongoing') {
      return userRequests.filter(req => req.status === 'ACCEPTED' && req.workStatus === 'ONGOING');
    }
    
    if (activeTab === 'completed') {
      return userRequests.filter(req => req.status === 'ACCEPTED' && req.workStatus === 'COMPLETED');
    }
    
    if (activeTab === 'rejected') {
      return userRequests.filter(req => req.status === 'REJECTED');
    }
    
    return userRequests;
  }, [userRequests, activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleAcceptDealRequest = async (requestId: string) => {
    const success = await updateDealRequestStatus(requestId, 'ACCEPTED', () => isUserSuspended(user?.id || ''));
    if (success) {
      // Log deal accepted event
      logDealAccepted(requestId);
      Alert.alert('Success', 'Request accepted! You can now start the work.');
    } else {
      Alert.alert('Error', 'Failed to accept request.');
    }
  };

  const handleWaitlistDealRequest = async (requestId: string) => {
    const success = await updateDealRequestStatus(requestId, 'WAITLISTED');
    if (success) {
      Alert.alert('Success', 'Request added to waitlist.');
    } else {
      Alert.alert('Error', 'Failed to waitlist request.');
    }
  };

  const handleRejectDealRequest = async (requestId: string) => {
    const success = await updateDealRequestStatus(requestId, 'REJECTED');
    if (success) {
      Alert.alert('Success', 'Request rejected.');
    } else {
      Alert.alert('Error', 'Failed to reject request.');
    }
  };

  const handleGiveFeedback = (deal: DealRequest) => {
    setSelectedDeal(deal);
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async (rating: number, comment?: string) => {
    if (!selectedDeal) return false;

    const success = await submitReview(selectedDeal.id, { rating, comment });
    
    // Log review submitted event
    if (success) {
      logReviewSubmitted(selectedDeal.id, rating);
    }
    
    // Show referral prompt after successful review submission
    if (success && user && !isWorkerMode) {
      setTimeout(() => {
        showReferralPrompt('review_submitted');
      }, 1000);
    }
    
    return success;
  };

  const getStatusColor = (status: DealRequest['status']) => {
    switch (status) {
      case 'NEW':
        return COLORS.info;
      case 'ACCEPTED':
        return COLORS.success;
      case 'WAITLISTED':
        return COLORS.warning;
      case 'REJECTED':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusLabel = (status: DealRequest['status']) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Activity</Text>
      <Text style={styles.headerSubtitle}>
        {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
      </Text>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && styles.tabActive]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>New Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.tabActive]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.tabTextActive]}>Accepted</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'waitlisted' && styles.tabActive]}
          onPress={() => setActiveTab('waitlisted')}
        >
          <Text style={[styles.tabText, activeTab === 'waitlisted' && styles.tabTextActive]}>Waitlisted</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>Ongoing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
          onPress={() => setActiveTab('rejected')}
        >
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>Rejected</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderActivityCard = ({ item }: { item: DealRequest }) => {
    const isNewRequest = item.status === 'NEW' && isWorkerMode;
    const otherPartyName = isWorkerMode ? item.customerName : item.workerName;
    const isCompletedWork = item.status === 'ACCEPTED' && item.workStatus === 'COMPLETED';
    const canReview = !isWorkerMode && user && canSubmitReview(item.id, user.id);

    // Show action buttons only for workers in "New Requests" tab
    if (isNewRequest && activeTab === 'new') {
      return (
        <DealRequestCard
          request={item}
          onAccept={handleAcceptDealRequest}
          onWaitlist={handleWaitlistDealRequest}
          onReject={handleRejectDealRequest}
        />
      );
    }

    // Read-only card for all other cases
    return (
      <View style={styles.activityCard}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color={COLORS.white} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{otherPartyName}</Text>
              <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.label}>Work Required:</Text>
          <Text style={styles.problemText} numberOfLines={3}>
            {item.problem}
          </Text>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.preferredTime}
            </Text>
          </View>
          {item.budget && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.budget}</Text>
            </View>
          )}
        </View>

        {/* Work Status for Accepted Deals */}
        {item.status === 'ACCEPTED' && item.workStatus && item.workStatus !== 'COMPLETED' && (
          <View style={styles.workStatusSection}>
            <View style={styles.workStatusBadge}>
              <View style={[styles.workStatusDot, { 
                backgroundColor: item.workStatus === 'ONGOING' ? COLORS.warning : COLORS.info 
              }]} />
              <Text style={[styles.workStatusText, {
                color: item.workStatus === 'ONGOING' ? COLORS.warning : COLORS.info
              }]}>
                {item.workStatus === 'ONGOING' ? 'Work In Progress' : 'Accepted - Waiting to Start'}
              </Text>
            </View>
          </View>
        )}

        {/* Contact Actions */}
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              const otherId = isWorkerMode ? item.customerId : item.workerId;
              router.push({ pathname: '/chat/[id]', params: { id: otherId } });
            }}
          >
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              // In real app, would use actual phone number
              Alert.alert('Contact', `Call ${otherPartyName}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => Linking.openURL('tel:+919876543210') },
              ]);
            }}
          >
            <Ionicons name="call-outline" size={18} color={COLORS.success} />
            <Text style={[styles.contactButtonText, { color: COLORS.success }]}>Call</Text>
          </TouchableOpacity>
          {/* Worker can update status for accepted deals */}
          {isWorkerMode && item.status === 'ACCEPTED' && item.workStatus !== 'COMPLETED' && (
            <TouchableOpacity
              style={[styles.contactButton, styles.updateStatusButton]}
              onPress={() => {
                const nextStatus = item.workStatus === 'ACCEPTED' ? 'ONGOING' : 'COMPLETED';
                const message = nextStatus === 'ONGOING' ? 'Mark as Ongoing?' : 'Mark as Completed?';
                Alert.alert('Update Status', message, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Confirm', onPress: () => {
                    updateWorkStatus(item.id, nextStatus);
                    // Log work completed event when marking as completed
                    if (nextStatus === 'COMPLETED') {
                      logWorkCompleted(item.id);
                    }
                  }},
                ]);
              }}
            >
              <Ionicons name="arrow-forward-circle-outline" size={18} color={COLORS.white} />
              <Text style={[styles.contactButtonText, { color: COLORS.white }]}>
                {item.workStatus === 'ACCEPTED' ? 'Start Work' : 'Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Review Section for Completed Work */}
        {isCompletedWork && (
          <View style={styles.reviewSection}>
            {item.review ? (
              <View style={styles.reviewSubmitted}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.reviewSubmittedText}>Review submitted</Text>
              </View>
            ) : canReview ? (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => handleGiveFeedback(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="star" size={18} color={COLORS.white} />
                <Text style={styles.feedbackButtonText}>Give Feedback</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <EmptyState 
      type="activity" 
      title="No Activity Yet"
      message={activeTab === 'new' 
        ? "You don't have any new requests at the moment. Start by finding workers or receiving job requests!"
        : `No ${activeTab} requests to show. When you have activity, it will appear here.`}
      actionText={activeTab === 'new' ? "Find Workers" : undefined}
      onAction={activeTab === 'new' ? () => router.push('/(tabs)/search') : undefined}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderTabs()}
      
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />

      <FloatingAIButton />

      {/* Review Modal */}
      {selectedDeal && (
        <ReviewModal
          visible={reviewModalVisible}
          deal={selectedDeal}
          onClose={() => {
            setReviewModalVisible(false);
            setSelectedDeal(null);
          }}
          onSubmit={handleSubmitReview}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabs: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  cardContent: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  problemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  cardDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
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
    paddingHorizontal: SPACING.xl,
  },
  reviewSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  feedbackButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  reviewSubmitted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  reviewSubmittedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  workStatusSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  workStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  workStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  workStatusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  updateStatusButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});
