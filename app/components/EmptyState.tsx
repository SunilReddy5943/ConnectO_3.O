import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

type EmptyStateType = 
  | 'activity' 
  | 'notifications' 
  | 'saved' 
  | 'messages' 
  | 'search' 
  | 'error'
  | 'no-connection';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, { 
  icon: keyof typeof Ionicons.glyphMap; 
  color: string; 
  defaultTitle: string; 
  defaultMessage: string 
}> = {
  activity: {
    icon: 'clipboard-outline',
    color: COLORS.primary,
    defaultTitle: 'No Activity Yet',
    defaultMessage: 'Your work requests and deals will appear here. Start by finding workers or receiving job requests!',
  },
  notifications: {
    icon: 'notifications-outline',
    color: COLORS.info,
    defaultTitle: 'All Caught Up!',
    defaultMessage: "You don't have any new notifications. We'll notify you when something important happens.",
  },
  saved: {
    icon: 'heart-outline',
    color: COLORS.error,
    defaultTitle: 'No Saved Workers',
    defaultMessage: 'Save your favorite workers for quick access later. Tap the heart icon on any worker profile.',
  },
  messages: {
    icon: 'chatbubbles-outline',
    color: COLORS.success,
    defaultTitle: 'No Messages Yet',
    defaultMessage: 'Start a conversation with workers or customers to discuss your requirements.',
  },
  search: {
    icon: 'search-outline',
    color: COLORS.textMuted,
    defaultTitle: 'No Results Found',
    defaultMessage: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
  error: {
    icon: 'warning-outline',
    color: COLORS.warning,
    defaultTitle: 'Something Went Wrong',
    defaultMessage: 'We couldn\'t load this content. Please check your connection and try again.',
  },
  'no-connection': {
    icon: 'cloud-offline-outline',
    color: COLORS.textMuted,
    defaultTitle: 'No Internet Connection',
    defaultMessage: 'Please check your internet connection and try again.',
  },
};

export default function EmptyState({ 
  type, 
  title, 
  message, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
        <Ionicons name={config.icon} size={48} color={config.color} />
      </View>
      <Text style={styles.title}>{title || config.defaultTitle}</Text>
      <Text style={styles.message}>{message || config.defaultMessage}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
    minHeight: 300,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
});
