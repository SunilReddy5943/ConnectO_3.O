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

export default function ReportManagement() {
  const router = useRouter();
  const { reports, markReportReviewed, suspendUser } = useAdmin();

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [filterReviewed, setFilterReviewed] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('ALL');

  const filteredReports = reports.filter((report) => {
    if (filterReviewed === 'PENDING') return !report.reviewed;
    if (filterReviewed === 'REVIEWED') return report.reviewed;
    return true;
  });

  const handleResolveReport = async (action: 'suspend' | 'dismiss') => {
    if (!selectedReport) return;

    const actionText =
      action === 'suspend' ? `Suspended user: ${selectedReport.reportedUserName}` : 'No action taken - dismissed';

    if (action === 'suspend') {
      Alert.alert(
        'Confirm Suspension',
        `Suspend ${selectedReport.reportedUserName} based on this report?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Suspend',
            style: 'destructive',
            onPress: async () => {
              await suspendUser(
                selectedReport.reportedUserId,
                selectedReport.reportedUserName,
                `Report: ${selectedReport.reason}`,
                actionNotes || undefined
              );
              await markReportReviewed(selectedReport.id, actionText);
              setShowActionModal(false);
              setActionNotes('');
              setSelectedReport(null);
              Alert.alert('Success', 'User suspended and report marked as reviewed');
            },
          },
        ]
      );
    } else {
      await markReportReviewed(selectedReport.id, actionText);
      setShowActionModal(false);
      setActionNotes('');
      setSelectedReport(null);
      Alert.alert('Success', 'Report marked as reviewed');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>User Reports</Text>
          <Text style={styles.headerSubtitle}>
            {filteredReports.filter((r) => !r.reviewed).length} pending
          </Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['ALL', 'PENDING', 'REVIEWED'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, filterReviewed === filter && styles.filterChipActive]}
            onPress={() => setFilterReviewed(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterReviewed === filter && styles.filterChipTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Report List */}
      <ScrollView style={styles.reportList} showsVerticalScrollIndicator={false}>
        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>No reports found</Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View
              key={report.id}
              style={[styles.reportCard, report.reviewed && styles.reportCardReviewed]}
            >
              {/* Report Header */}
              <View style={styles.reportHeader}>
                <View style={styles.reportIdBadge}>
                  <Text style={styles.reportIdText}>#{report.id.slice(-8)}</Text>
                </View>
                {report.reviewed ? (
                  <View style={styles.reviewedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    <Text style={styles.reviewedText}>REVIEWED</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.warning} />
                    <Text style={styles.pendingText}>PENDING</Text>
                  </View>
                )}
              </View>

              {/* Participants */}
              <View style={styles.participants}>
                <View style={styles.participant}>
                  <Text style={styles.participantLabel}>Reporter</Text>
                  <Text style={styles.participantName}>{report.reporterName}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={COLORS.error} />
                <View style={styles.participant}>
                  <Text style={styles.participantLabel}>Reported User</Text>
                  <Text style={styles.participantName}>{report.reportedUserName}</Text>
                </View>
              </View>

              {/* Reason */}
              <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{report.reason}</Text>
              </View>

              {/* Deal Link */}
              {report.relatedDealId && (
                <View style={styles.dealLink}>
                  <Ionicons name="link" size={14} color={COLORS.info} />
                  <Text style={styles.dealLinkText}>Deal: #{report.relatedDealId.slice(-8)}</Text>
                </View>
              )}

              {/* Timestamp */}
              <Text style={styles.timestamp}>{formatDate(report.timestamp)}</Text>

              {/* Action Taken (if reviewed) */}
              {report.reviewed && report.actionTaken && (
                <View style={styles.actionTakenBox}>
                  <Text style={styles.actionTakenLabel}>Action Taken:</Text>
                  <Text style={styles.actionTakenText}>{report.actionTaken}</Text>
                  {report.reviewedBy && (
                    <Text style={styles.reviewedByText}>
                      Reviewed by: {report.reviewedBy} • {formatDate(report.reviewedAt!)}
                    </Text>
                  )}
                </View>
              )}

              {/* Actions */}
              {!report.reviewed && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => {
                    setSelectedReport(report);
                    setShowActionModal(true);
                  }}
                >
                  <Text style={styles.reviewButtonText}>Review Report</Text>
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Report</Text>
            {selectedReport && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Reported User:</Text>
                  <Text style={styles.modalInfoValue}>{selectedReport.reportedUserName}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Reason:</Text>
                  <Text style={styles.modalInfoValue}>{selectedReport.reason}</Text>
                </View>

                <Text style={styles.inputLabel}>Action Notes (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add any notes about your decision..."
                  value={actionNotes}
                  onChangeText={setActionNotes}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.dismissButton]}
                    onPress={() => handleResolveReport('dismiss')}
                  >
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.suspendButton]}
                    onPress={() => handleResolveReport('suspend')}
                  >
                    <Text style={styles.suspendButtonText}>Suspend User</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowActionModal(false);
                    setActionNotes('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
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
  reportList: {
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
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    ...SHADOWS.small,
  },
  reportCardReviewed: {
    opacity: 0.7,
    borderLeftColor: COLORS.success,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reportIdBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  reportIdText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  reviewedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  pendingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.warning,
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
  reasonContainer: {
    marginBottom: SPACING.sm,
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
  actionTakenBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  actionTakenLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  actionTakenText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reviewedByText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  reviewButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
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
  dismissButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dismissButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  suspendButton: {
    backgroundColor: COLORS.error,
  },
  suspendButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
});
