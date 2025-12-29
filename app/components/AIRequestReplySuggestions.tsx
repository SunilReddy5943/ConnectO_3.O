import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { aiService, ReplySuggestion } from '../lib/aiService';

interface AIRequestReplySuggestionsProps {
  customerName: string;
  problem: string;
  location: string;
  onSelectSuggestion: (type: 'accept' | 'reject' | 'waitlist', text: string) => void;
}

export default function AIRequestReplySuggestions({
  customerName,
  problem,
  location,
  onSelectSuggestion,
}: AIRequestReplySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ReplySuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [customerName, problem, location]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const result = await aiService.getRequestReplySuggestions(
        customerName,
        problem,
        location
      );
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to load reply suggestions:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedButton}
        onPress={() => setIsExpanded(true)}
      >
        <Ionicons name="sparkles" size={18} color={COLORS.primary} />
        <Text style={styles.collapsedText}>AI Reply Suggestions</Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={18} color={COLORS.primary} />
          <Text style={styles.headerTitle}>AI Reply Suggestions</Text>
        </View>
        <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
          <Ionicons name="chevron-up" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.notice}>
        <Ionicons name="information-circle" size={14} color={COLORS.info} /> 
        {' '}AI suggestion – please review and edit before sending
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating suggestions...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to generate suggestions</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSuggestions}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : suggestions ? (
        <ScrollView
          style={styles.suggestionsScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Accept Suggestion */}
          <SuggestionCard
            icon="checkmark-circle"
            iconColor={COLORS.success}
            title="Accept"
            subtitle="Show you're available and interested"
            text={suggestions.accept}
            onSelect={() => onSelectSuggestion('accept', suggestions.accept)}
          />

          {/* Waitlist Suggestion */}
          <SuggestionCard
            icon="time"
            iconColor={COLORS.warning}
            title="Waitlist"
            subtitle="Interested but currently busy"
            text={suggestions.waitlist}
            onSelect={() => onSelectSuggestion('waitlist', suggestions.waitlist)}
          />

          {/* Reject Suggestion */}
          <SuggestionCard
            icon="close-circle"
            iconColor={COLORS.error}
            title="Politely Decline"
            subtitle="Can't take this job right now"
            text={suggestions.reject}
            onSelect={() => onSelectSuggestion('reject', suggestions.reject)}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

interface SuggestionCardProps {
  icon: any;
  iconColor: string;
  title: string;
  subtitle: string;
  text: string;
  onSelect: () => void;
}

function SuggestionCard({ icon, iconColor, title, subtitle, text, onSelect }: SuggestionCardProps) {
  return (
    <View style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={[styles.iconBadge, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.suggestionTitleContainer}>
          <Text style={styles.suggestionTitle}>{title}</Text>
          <Text style={styles.suggestionSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <Text style={styles.suggestionText}>{text}</Text>

      <TouchableOpacity style={styles.useButton} onPress={onSelect}>
        <Text style={styles.useButtonText}>Use This</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  collapsedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '05',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  collapseButton: {
    padding: SPACING.xs,
  },
  notice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.info,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.info + '08',
    lineHeight: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  retryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  suggestionsScroll: {
    maxHeight: 400,
  },
  suggestionCard: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  suggestionTitleContainer: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  suggestionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  useButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
