import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeal } from '../context/DealContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

type StatusFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export default function DealMonitoring() {
  const router = useRouter();
  const { dealRequests } = useDeal();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const filteredDeals = dealRequests.filter((deal) => {
    if (statusFilter === 'ALL') return true;
    return deal.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return COLORS.success;
      case 'PENDING':
        return COLORS.warning;
      case 'REJECTED':
      case 'CANCELLED':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  const getWorkStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return COLORS.success;
      case 'IN_PROGRESS':
        return COLORS.info;
      default:
        return COLORS.textMuted;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Deal Monitoring</Text>
          <Text style={styles.headerSubtitle}>{filteredDeals.length} deals</Text>
        </View>
      </View>

      {/* Status Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Deal List */}
      <ScrollView style={styles.dealList} showsVerticalScrollIndicator={false}>
        {filteredDeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>No deals found</Text>
          </View>
        ) : (
          filteredDeals.map((deal) => (
            <View key={deal.id} style={styles.dealCard}>
              {/* Deal Header */}
              <View style={styles.dealHeader}>
                <View style={styles.dealIdBadge}>
                  <Text style={styles.dealIdText}>#{deal.id.slice(-8)}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(deal.status) + '15' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(deal.status) }]}>
                    {deal.status}
                  </Text>
                </View>
              </View>

              {/* Participants */}
              <View style={styles.participants}>
                <View style={styles.participant}>
                  <Text style={styles.participantLabel}>Customer</Text>
                  <Text style={styles.participantName}>{deal.customerName}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
                <View style={styles.participant}>
                  <Text style={styles.participantLabel}>Worker</Text>
                  <Text style={styles.participantName}>{deal.workerName}</Text>
                </View>
              </View>

              {/* Service Details */}
              <View style={styles.dealDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="construct" size={16} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{deal.serviceType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{formatDate(deal.timestamp)}</Text>
                </View>
                {deal.proposedPrice && (
                  <View style={styles.detailRow}>
                    <Ionicons name="cash" size={16} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>₹{deal.proposedPrice}</Text>
                  </View>
                )}
              </View>

              {/* Work Status */}
              {deal.status === 'ACCEPTED' && deal.workStatus && (
                <View
                  style={[
                    styles.workStatusBadge,
                    { backgroundColor: getWorkStatusColor(deal.workStatus) + '15' },
                  ]}
                >
                  <Ionicons
                    name={deal.workStatus === 'COMPLETED' ? 'checkmark-circle' : 'time'}
                    size={14}
                    color={getWorkStatusColor(deal.workStatus)}
                  />
                  <Text
                    style={[
                      styles.workStatusText,
                      { color: getWorkStatusColor(deal.workStatus) },
                    ]}
                  >
                    {deal.workStatus === 'COMPLETED' ? 'Work Completed' : 'In Progress'}
                  </Text>
                </View>
              )}

              {/* Read-only indicator */}
              <View style={styles.readOnlyBadge}>
                <Ionicons name="eye" size={12} color={COLORS.textMuted} />
                <Text style={styles.readOnlyText}>Read-only</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  dealList: {
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
  dealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dealIdBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  dealIdText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
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
  dealDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  workStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  workStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
  },
  readOnlyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
