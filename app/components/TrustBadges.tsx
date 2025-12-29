import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { TrustBadge } from '../context/TrustContext';

interface TrustBadgesProps {
  badges: TrustBadge[];
  compact?: boolean;
}

export default function TrustBadges({ badges, compact = false }: TrustBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<TrustBadge | null>(null);

  const handleBadgePress = (badge: TrustBadge) => {
    setSelectedBadge(badge);
  };

  const closeTooltip = () => {
    setSelectedBadge(null);
  };

  if (compact) {
    // Show only earned badges in compact mode
    const earnedBadges = badges.filter(b => b.earned);
    
    return (
      <View style={styles.compactContainer}>
        {earnedBadges.map((badge) => (
          <View key={badge.id} style={styles.compactBadge}>
            <Ionicons name={badge.icon as any} size={14} color={badge.color} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {badges.map((badge) => (
        <TouchableOpacity
          key={badge.id}
          style={[
            styles.badge,
            !badge.earned && styles.badgeDisabled,
          ]}
          onPress={() => handleBadgePress(badge)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: badge.color + '15' }]}>
            <Ionicons
              name={badge.icon as any}
              size={20}
              color={badge.earned ? badge.color : COLORS.textMuted}
            />
          </View>
          <Text
            style={[
              styles.badgeLabel,
              !badge.earned && styles.badgeLabelDisabled,
            ]}
            numberOfLines={2}
          >
            {badge.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Tooltip Modal */}
      <Modal
        visible={selectedBadge !== null}
        transparent
        animationType="fade"
        onRequestClose={closeTooltip}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeTooltip}
        >
          <View style={styles.tooltipContainer}>
            <View style={styles.tooltipHeader}>
              <View style={[styles.tooltipIcon, { backgroundColor: selectedBadge?.color + '15' }]}>
                <Ionicons
                  name={selectedBadge?.icon as any}
                  size={24}
                  color={selectedBadge?.color}
                />
              </View>
              <Text style={styles.tooltipTitle}>{selectedBadge?.label}</Text>
            </View>
            <Text style={styles.tooltipText}>{selectedBadge?.tooltip}</Text>
            <View style={styles.tooltipStatus}>
              {selectedBadge?.earned ? (
                <>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.tooltipStatusText}>Earned</Text>
                </>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
                  <Text style={[styles.tooltipStatusText, { color: COLORS.textMuted }]}>
                    Not yet earned
                  </Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  badge: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  badgeDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  badgeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  badgeLabelDisabled: {
    color: COLORS.textMuted,
  },
  compactContainer: {
    flexDirection: 'row',
    gap: SPACING.xs / 2,
  },
  compactBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  tooltipContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    maxWidth: 320,
    ...SHADOWS.lg,
  },
  tooltipHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tooltipIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  tooltipTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  tooltipText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tooltipStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  tooltipStatusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
});
