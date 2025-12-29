import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DealRequest } from '../context/DealContext';
import AIRequestReplySuggestions from './AIRequestReplySuggestions';

interface DealRequestCardProps {
  request: DealRequest;
  onAccept: (requestId: string) => void;
  onWaitlist: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export default function DealRequestCard({
  request,
  onAccept,
  onWaitlist,
  onReject,
}: DealRequestCardProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleAISuggestion = (type: 'accept' | 'reject' | 'waitlist', text: string) => {
    setReplyText(text);
    // Auto-execute the action with AI reply
    if (type === 'accept') {
      handleAction('accept', onAccept);
    } else if (type === 'waitlist') {
      handleAction('waitlist', onWaitlist);
    } else {
      handleAction('reject', onReject);
    }
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

  const handleAction = async (
    action: 'accept' | 'waitlist' | 'reject',
    callback: (requestId: string) => void
  ) => {
    const actionMessages = {
      accept: {
        title: 'Accept Request?',
        message: `Accept deal request from ${request.customerName}?`,
        success: 'Request Accepted',
      },
      waitlist: {
        title: 'Add to Waitlist?',
        message: `Add ${request.customerName}'s request to waitlist?`,
        success: 'Added to Waitlist',
      },
      reject: {
        title: 'Reject Request?',
        message: `Reject deal request from ${request.customerName}?`,
        success: 'Request Rejected',
      },
    };

    Alert.alert(
      actionMessages[action].title,
      actionMessages[action].message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'accept' ? 'Accept' : action === 'waitlist' ? 'Waitlist' : 'Reject',
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await callback(request.id);
              Alert.alert('Success', actionMessages[action].success);
            } catch (error) {
              Alert.alert('Error', 'Failed to process request');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatar}>
            <Ionicons name="person" size={20} color={COLORS.white} />
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{request.customerName}</Text>
            <Text style={styles.timestamp}>{formatDate(request.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      </View>

      {/* Problem Description */}
      <View style={styles.problemSection}>
        <Text style={styles.label}>Work Required:</Text>
        <Text style={styles.problemText} numberOfLines={3}>
          {request.problem}
        </Text>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.location}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.preferredTime}
          </Text>
        </View>
        {request.budget && (
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>{request.budget}</Text>
          </View>
        )}
      </View>

      {/* Contact Customer Buttons */}
      <View style={styles.contactSection}>
        <TouchableOpacity
          style={styles.contactCustomerButton}
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: request.customerId } })}
        >
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
          <Text style={styles.contactCustomerText}>Chat with Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callCustomerButton}
          onPress={() => {
            Alert.alert('Contact', `Call ${request.customerName}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', onPress: () => Linking.openURL('tel:+919876543210') },
            ]);
          }}
        >
          <Ionicons name="call-outline" size={16} color={COLORS.success} />
        </TouchableOpacity>
      </View>

      {/* AI Reply Suggestions */}
      <AIRequestReplySuggestions
        customerName={request.customerName}
        problem={request.problem}
        location={request.location}
        onSelectSuggestion={handleAISuggestion}
      />

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleAction('reject', onReject)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
              <Text style={[styles.actionButtonText, styles.rejectButtonText]}>Reject</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.waitlistButton]}
          onPress={() => handleAction('waitlist', onWaitlist)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.warning} />
          ) : (
            <>
              <Ionicons name="time-outline" size={18} color={COLORS.warning} />
              <Text style={[styles.actionButtonText, styles.waitlistButtonText]}>Waitlist</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAction('accept', onAccept)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
              <Text style={[styles.actionButtonText, styles.acceptButtonText]}>Accept</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  newBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
  problemSection: {
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
  detailsGrid: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  contactSection: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  contactCustomerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: SPACING.xs,
  },
  contactCustomerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  callCustomerButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.success + '10',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  rejectButtonText: {
    color: COLORS.error,
  },
  waitlistButton: {
    backgroundColor: COLORS.warning + '10',
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  waitlistButtonText: {
    color: COLORS.warning,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  acceptButtonText: {
    color: COLORS.white,
  },
});
