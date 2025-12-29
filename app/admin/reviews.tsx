import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../context/AdminContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// Mock reviews (in real app, would fetch from database)
interface MockReview {
  id: string;
  dealId: string;
  reviewerId: string;
  reviewerName: string;
  reviewedUserId: string;
  reviewedUserName: string;
  rating: number;
  comment?: string;
  timestamp: number;
}

const MOCK_REVIEWS: MockReview[] = [
  {
    id: 'review-001',
    dealId: 'deal-001',
    reviewerId: 'user-001',
    reviewerName: 'Rajesh Kumar',
    reviewedUserId: 'user-002',
    reviewedUserName: 'Priya Sharma',
    rating: 5,
    comment: 'Excellent work! Very professional and on time.',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'review-002',
    dealId: 'deal-002',
    reviewerId: 'user-003',
    reviewerName: 'Amit Singh',
    reviewedUserId: 'user-004',
    reviewedUserName: 'Sneha Patel',
    rating: 1,
    comment: 'This review contains inappropriate content that violates our community guidelines.',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
];

export default function ReviewModeration() {
  const router = useRouter();
  const { flaggedReviews, flagReview, unflagReview, isReviewFlagged } = useAdmin();

  const [selectedReview, setSelectedReview] = useState<MockReview | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [filterFlagged, setFilterFlagged] = useState<'ALL' | 'FLAGGED' | 'VISIBLE'>('ALL');

  const filteredReviews = MOCK_REVIEWS.filter((review) => {
    const isFlagged = isReviewFlagged(review.dealId);
    if (filterFlagged === 'FLAGGED') return isFlagged;
    if (filterFlagged === 'VISIBLE') return !isFlagged;
    return true;
  });

  const handleFlagReview = async () => {
    if (!selectedReview || !flagReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for flagging');
      return;
    }

    await flagReview({
      dealId: selectedReview.dealId,
      reviewerId: selectedReview.reviewerId,
      reviewerName: selectedReview.reviewerName,
      reviewedUserId: selectedReview.reviewedUserId,
      reviewedUserName: selectedReview.reviewedUserName,
      rating: selectedReview.rating,
      comment: selectedReview.comment,
      flagReason,
    });

    setShowFlagModal(false);
    setFlagReason('');
    setSelectedReview(null);
    Alert.alert('Success', 'Review has been flagged and hidden from public view');
  };

  const handleUnflagReview = async (dealId: string) => {
    const flaggedReview = flaggedReviews.find((f) => f.dealId === dealId);
    if (!flaggedReview) return;

    Alert.alert('Confirm Unflag', 'Make this review visible again?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unflag',
        onPress: async () => {
          await unflagReview(flaggedReview.id);
          Alert.alert('Success', 'Review is now visible again');
        },
      },
    ]);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? COLORS.warning : COLORS.textMuted}
          />
        ))}
      </View>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Review Moderation</Text>
          <Text style={styles.headerSubtitle}>
            {flaggedReviews.filter((f) => f.hidden).length} flagged
          </Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['ALL', 'FLAGGED', 'VISIBLE'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, filterFlagged === filter && styles.filterChipActive]}
            onPress={() => setFilterFlagged(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterFlagged === filter && styles.filterChipTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Review List */}
      <ScrollView style={styles.reviewList} showsVerticalScrollIndicator={false}>
        {filteredReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="star-half-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>No reviews found</Text>
          </View>
        ) : (
          filteredReviews.map((review) => {
            const isFlagged = isReviewFlagged(review.dealId);
            const flaggedData = flaggedReviews.find((f) => f.dealId === review.dealId);

            return (
              <View
                key={review.id}
                style={[styles.reviewCard, isFlagged && styles.reviewCardFlagged]}
              >
                {/* Review Header */}
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewIdBadge}>
                    <Text style={styles.reviewIdText}>#{review.id.slice(-8)}</Text>
                  </View>
                  {isFlagged && (
                    <View style={styles.flaggedBadge}>
                      <Ionicons name="eye-off" size={14} color={COLORS.error} />
                      <Text style={styles.flaggedText}>HIDDEN</Text>
                    </View>
                  )}
                </View>

                {/* Participants */}
                <View style={styles.participants}>
                  <View style={styles.participant}>
                    <Text style={styles.participantLabel}>Reviewer</Text>
                    <Text style={styles.participantName}>{review.reviewerName}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
                  <View style={styles.participant}>
                    <Text style={styles.participantLabel}>Reviewed</Text>
                    <Text style={styles.participantName}>{review.reviewedUserName}</Text>
                  </View>
                </View>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                  {renderStars(review.rating)}
                  <Text style={styles.ratingText}>{review.rating}.0</Text>
                </View>

                {/* Comment */}
                {review.comment && (
                  <View style={styles.commentContainer}>
                    <Text style={styles.commentLabel}>Comment:</Text>
                    <Text style={styles.commentText}>{review.comment}</Text>
                  </View>
                )}

                {/* Deal Link */}
                <View style={styles.dealLink}>
                  <Ionicons name="link" size={14} color={COLORS.info} />
                  <Text style={styles.dealLinkText}>Deal: #{review.dealId.slice(-8)}</Text>
                </View>

                {/* Timestamp */}
                <Text style={styles.timestamp}>{formatDate(review.timestamp)}</Text>

                {/* Flag Info (if flagged) */}
                {isFlagged && flaggedData && (
                  <View style={styles.flagInfoBox}>
                    <Text style={styles.flagInfoLabel}>Flag Reason:</Text>
                    <Text style={styles.flagInfoText}>{flaggedData.flagReason}</Text>
                    <Text style={styles.flagInfoTimestamp}>
                      Flagged on {formatDate(flaggedData.flaggedAt)}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                  {isFlagged ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.unflagButton]}
                      onPress={() => handleUnflagReview(review.dealId)}
                    >
                      <Ionicons name="eye" size={16} color={COLORS.success} />
                      <Text style={styles.unflagButtonText}>Unflag</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.flagButton]}
                      onPress={() => {
                        setSelectedReview(review);
                        setShowFlagModal(true);
                      }}
                    >
                      <Ionicons name="flag" size={16} color={COLORS.error} />
                      <Text style={styles.flagButtonText}>Flag Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Flag Modal */}
      <Modal
        visible={showFlagModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFlagModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Flag Review</Text>
            {selectedReview && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Review by:</Text>
                  <Text style={styles.modalInfoValue}>{selectedReview.reviewerName}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Rating:</Text>
                  <Text style={styles.modalInfoValue}>{selectedReview.rating}.0 ⭐</Text>
                </View>

                <Text style={styles.inputLabel}>Reason for Flagging *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Inappropriate content, spam, harassment..."
                  value={flagReason}
                  onChangeText={setFlagReason}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.warning} />
                  <Text style={styles.warningText}>
                    Flagged reviews are hidden from public view but not deleted.
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setShowFlagModal(false);
                      setFlagReason('');
                    }}
                  >
                    <Text style={styles.modalButtonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={handleFlagReview}
                  >
                    <Text style={styles.modalButtonConfirmText}>Flag</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  reviewList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  reviewCardFlagged: {
    borderWidth: 1,
    borderColor: COLORS.error,
    opacity: 0.8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewIdBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  reviewIdText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  flaggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  flaggedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.error,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  participant: {
    flex: 1,
  },
  participantLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  participantName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  commentContainer: {
    marginBottom: SPACING.sm,
  },
  commentLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  commentText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  dealLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  dealLinkText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.info,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  flagInfoBox: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  flagInfoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  flagInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  flagInfoTimestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  flagButton: {
    backgroundColor: COLORS.error + '15',
  },
  flagButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  unflagButton: {
    backgroundColor: COLORS.success + '15',
  },
  unflagButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalInfo: {
    marginBottom: SPACING.sm,
  },
  modalInfoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonCancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.error,
  },
  modalButtonConfirmText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
