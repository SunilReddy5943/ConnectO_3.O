import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { VerificationLevel } from '../context/TrustContext';

interface VerificationLevelBadgeProps {
  level: VerificationLevel;
  label: string;
  color: string;
  icon: string;
  size?: 'small' | 'medium' | 'large';
}

export default function VerificationLevelBadge({
  level,
  label,
  color,
  icon,
  size = 'medium',
}: VerificationLevelBadgeProps) {
  const iconSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const fontSize = size === 'small' ? FONT_SIZES.xs : size === 'large' ? FONT_SIZES.base : FONT_SIZES.sm;

  return (
    <View style={[styles.container, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon as any} size={iconSize} color={color} />
      <Text style={[styles.label, { fontSize, color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs / 2,
  },
  label: {
    fontWeight: '600',
  },
});
