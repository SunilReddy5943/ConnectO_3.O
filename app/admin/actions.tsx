import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin, AdminAction } from '../context/AdminContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

type ActionFilter = 'ALL' | 'SUSPEND_USER' | 'UNSUSPEND_USER' | 'FLAG_REVIEW' | 'RESOLVE_REPORT';

export default function AdminActionLog() {
  const router = useRouter();
  const { adminActions } = useAdmin();

  const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL');

  const filteredActions = adminActions.filter((action) => {
    if (actionFilter === 'ALL') return true;
    return action.action === actionFilter;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SUSPEND_USER':
        return { name: 'ban', color: COLORS.error };
      case 'UNSUSPEND_USER':
        return { name: 'checkmark-circle', color: COLORS.success };
      case 'FLAG_REVIEW':
        return { name: 'flag', color: COLORS.warning };
      case 'UNFLAG_REVIEW':
        return { name: 'eye', color: COLORS.info };
      case 'RESOLVE_REPORT':
        return { name: 'checkmark-done', color: COLORS.success };
      default:
        return { name: 'document', color: COLORS.textMuted };
    }
  };

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'SUSPEND_USER':
        return 'User Suspended';
      case 'UNSUSPEND_USER':
        return 'User Unsuspended';
      case 'FLAG_REVIEW':
        return 'Review Flagged';
      case 'UNFLAG_REVIEW':
        return 'Review Unflagged';
      case 'RESOLVE_REPORT':
        return 'Report Resolved';
      default:
        return action;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Action Log</Text>
          <Text style={styles.headerSubtitle}>{filteredActions.length} actions</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, actionFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setActionFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              actionFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            ALL
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            actionFilter === 'SUSPEND_USER' && styles.filterChipActive,
          ]}
          onPress={() => setActionFilter('SUSPEND_USER')}
        >
          <Text
            style={[
              styles.filterChipText,
              actionFilter === 'SUSPEND_USER' && styles.filterChipTextActive,
            ]}
          >
            SUSPENSIONS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            actionFilter === 'FLAG_REVIEW' && styles.filterChipActive,
          ]}
          onPress={() => setActionFilter('FLAG_REVIEW')}
        >
          <Text
            style={[
              styles.filterChipText,
              actionFilter === 'FLAG_REVIEW' && styles.filterChipTextActive,
            ]}
          >
            FLAGS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            actionFilter === 'RESOLVE_REPORT' && styles.filterChipActive,
          ]}
          onPress={() => setActionFilter('RESOLVE_REPORT')}
        >
          <Text
            style={[
              styles.filterChipText,
              actionFilter === 'RESOLVE_REPORT' && styles.filterChipTextActive,
            ]}
          >
            REPORTS
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Action Log */}
      <ScrollView style={styles.actionList} showsVerticalScrollIndicator={false}>
        {filteredActions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>No admin actions yet</Text>
          </View>
        ) : (
          filteredActions.map((action) => {
            const icon = getActionIcon(action.action);
            return (
              <View key={action.id} style={styles.actionCard}>
                {/* Action Header */}
                <View style={styles.actionHeader}>
                  <View style={[styles.actionIcon, { backgroundColor: icon.color + '15' }]}>
                    <Ionicons name={icon.name as any} size={20} color={icon.color} />
                  </View>
                  <View style={styles.actionHeaderContent}>
                    <Text style={styles.actionTitle}>{getActionTitle(action.action)}</Text>
                    <Text style={styles.actionTime}>{formatTimeAgo(action.timestamp)}</Text>
                  </View>
                  <View style={styles.actionIdBadge}>
                    <Text style={styles.actionIdText}>#{action.id.slice(-6)}</Text>
                  </View>
                </View>

                {/* Action Details */}
                <View style={styles.actionDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailLabel}>Admin:</Text>
                    <Text style={styles.detailValue}>{action.adminName}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="document" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailLabel}>Target:</Text>
                    <Text style={styles.detailValue}>
                      {action.targetType} #{action.targetId.slice(-8)}
                    </Text>
                  </View>

                  {action.reason && (
                    <View style={styles.reasonBox}>
                      <Text style={styles.reasonLabel}>Reason:</Text>
                      <Text style={styles.reasonText}>{action.reason}</Text>
                    </View>
                  )}

                  {action.notes && (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{action.notes}</Text>
                    </View>
                  )}

                  {action.metadata && Object.keys(action.metadata).length > 0 && (
                    <View style={styles.metadataBox}>
                      <Text style={styles.metadataLabel}>Additional Info:</Text>
                      {Object.entries(action.metadata).map(([key, value]) => (
                        <Text key={key} style={styles.metadataText}>
                          • {key}: {String(value)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                {/* Timestamp */}
                <Text style={styles.timestamp}>{formatDate(action.timestamp)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={16} color={COLORS.info} />
        <Text style={styles.infoText}>
          All admin actions are permanently logged and cannot be deleted
        </Text>
      </View>
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
  actionList: {
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
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHeaderContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionIdBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  actionIdText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  actionDetails: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  reasonBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  reasonLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  notesBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  notesLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  metadataBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  metadataLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metadataText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.info,
  },
});
