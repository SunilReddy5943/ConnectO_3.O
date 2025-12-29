import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface NotifyWorkerModalProps {
  visible: boolean;
  workerName: string;
  workerId: string;
  defaultLocation?: string;
  onClose: () => void;
  onSubmit: (data: { problem: string; location: string }) => void;
}

export default function NotifyWorkerModal({
  visible,
  workerName,
  workerId,
  defaultLocation = '',
  onClose,
  onSubmit,
}: NotifyWorkerModalProps) {
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState(defaultLocation);

  const canSubmit = problem.trim().length > 0 && location.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      problem: problem.trim(),
      location: location.trim(),
    });

    // Reset form
    setProblem('');
    setLocation(defaultLocation);
  };

  const handleClose = () => {
    setProblem('');
    setLocation(defaultLocation);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="notifications" size={24} color={COLORS.warning} />
              <Text style={styles.title}>Notify {workerName}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={16} color={COLORS.info} />
              <Text style={styles.infoText}>
                Send a quick notification to {workerName}. You'll get a response soon!
              </Text>
            </View>

            {/* Problem Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                What do you need? <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="E.g., AC repair, plumbing issue, electrical work..."
                placeholderTextColor={COLORS.textMuted}
                value={problem}
                onChangeText={setProblem}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>{problem.length}/200</Text>
            </View>

            {/* Location Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationInput}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your city or area"
                  placeholderTextColor={COLORS.textMuted}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            {/* Photo Attachment Placeholder */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Add Photo (Optional)</Text>
              <TouchableOpacity style={styles.photoPlaceholder} disabled>
                <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.photoText}>Coming soon</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.9}
            >
              <Ionicons name="send" size={18} color={COLORS.white} />
              <Text style={styles.submitText}>Send Notification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS['2xl'],
    borderTopRightRadius: BORDER_RADIUS['2xl'],
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.base,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: COLORS.info + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.base,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    lineHeight: 18,
  },
  fieldContainer: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  photoPlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    borderStyle: 'dashed',
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  photoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.warning,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
  },
  submitText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});
