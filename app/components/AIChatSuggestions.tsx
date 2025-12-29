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
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { aiService } from '../lib/aiService';

interface AIChatSuggestionsProps {
  lastMessage: string;
  conversationContext?: string;
  onSelectSuggestion: (text: string) => void;
}

export default function AIChatSuggestions({
  lastMessage,
  conversationContext,
  onSelectSuggestion,
}: AIChatSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadSuggestions = async () => {
    if (!lastMessage.trim()) return;

    try {
      setIsLoading(true);
      setHasError(false);
      const result = await aiService.getChatReplySuggestions(lastMessage, conversationContext);
      setSuggestions(result);
      setIsVisible(true);
    } catch (error) {
      console.error('Failed to load chat suggestions:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    onSelectSuggestion(text);
    setIsVisible(false);
  };

  if (!isVisible && !isLoading) {
    // Show AI button to trigger suggestions
    return (
      <TouchableOpacity style={styles.triggerButton} onPress={loadSuggestions}>
        <Ionicons name="sparkles" size={16} color={COLORS.primary} />
        <Text style={styles.triggerText}>AI Suggestions</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={16} color={COLORS.primary} />
          <Text style={styles.headerText}>AI suggestion – tap to insert</Text>
        </View>
        <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting suggestions...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to load suggestions</Text>
          <TouchableOpacity onPress={loadSuggestions}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContainer}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => handleSelectSuggestion(suggestion)}
            >
              <Text style={styles.suggestionText} numberOfLines={3}>
                {suggestion}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  triggerText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary + '05',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  closeButton: {
    padding: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  retryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  suggestionsContainer: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    maxWidth: 250,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  suggestionText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});
