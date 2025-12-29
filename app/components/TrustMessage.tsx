import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface TrustMessageProps {
  message: string;
  type?: 'info' | 'success' | 'shield';
}

export default function TrustMessage({ message, type = 'info' }: TrustMessageProps) {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: COLORS.success };
      case 'shield':
        return { icon: 'shield-checkmark', color: COLORS.primary };
      default:
        return { icon: 'information-circle', color: COLORS.info };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <View style={[styles.container, { backgroundColor: color + '10' }]}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
