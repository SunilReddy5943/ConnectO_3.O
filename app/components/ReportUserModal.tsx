import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface ReportUserModalProps {
  visible: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
  onReport: () => void;
}

export default function ReportUserModal({ 
  visible, 
  userId, 
  userName, 
  onClose, 
  onReport 
}: ReportUserModalProps) {
  const [loading, setLoading] = useState(false);

  const REPORT_REASONS = [
    { id: 'inappropriate', label: 'Inappropriate Behavior', icon: 'alert-circle' },
    { id: 'spam', label: 'Spam or Scam', icon: 'ban' },
    { id: 'harassment', label: 'Harassment', icon: 'hand-left' },
    { id: 'fake', label: 'Fake Profile', icon: 'person-remove' },
    { id: 'other', label: 'Other Issue', icon: 'ellipsis-horizontal' },
  ];

  const handleReport = async (reason: string) => {
    setLoading(true);
    try {
      // Get existing reports
      const existingReports = await AsyncStorage.getItem('@connecto_user_reports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      
      // Add new report
      const newReport = {
        id: Date.now().toString(),
        userId,
        userName,
        reason,
        timestamp: Date.now(),
      };
      
      reports.push(newReport);
      await AsyncStorage.setItem('@connecto_user_reports', JSON.stringify(reports));
      
      // Close modal and show confirmation
      onReport();
      onClose();
      Alert.alert(
        'Report Submitted', 
        'Thank you for helping keep our community safe. We will review this report promptly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Report {userName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Why are you reporting this user?
          </Text>
          
          <View style={styles.reasonsContainer}>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={styles.reasonButton}
                onPress={() => handleReport(reason.label)}
                disabled={loading}
              >
                <View style={styles.reasonIcon}>
                  <Ionicons 
                    name={reason.icon as any} 
                    size={20} 
                    color={COLORS.primary} 
                  />
                </View>
                <Text style={styles.reasonText}>{reason.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  reasonsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  reasonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
