import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DummyWorker } from '../data/dummyWorkers';
import { useDeal } from '../context/DealContext';
import { useAuth } from '../context/AuthContext';
import TrustMessage from './TrustMessage';
import AIRequestHelper from './AIRequestHelper';
// Conditionally import MiniMapView only on native platforms
let MiniMapView: any = null;
if (Platform.OS !== 'web') {
  MiniMapView = require('./MiniMapView').default;
}
import { useLocation } from '../context/LocationContext';

interface DealRequestModalProps {
  visible: boolean;
  worker: DummyWorker;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DealRequestModal({ visible, worker, onClose, onSuccess }: DealRequestModalProps) {
  const { addDealRequest, hasActiveRequestWithWorker } = useDeal();
  const { user } = useAuth();
  const { userLocation } = useLocation();
  const { isUserSuspended } = require('../context/AdminContext').useAdmin();
  
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);

  // Auto-fill location from user's current location
  React.useEffect(() => {
    if (userLocation && !location) {
      const locationText = userLocation.area
        ? `${userLocation.area}, ${userLocation.city}`
        : userLocation.city;
      setLocation(locationText);
    }
  }, [userLocation]);

  const handleAIApply = (description: string, category: string) => {
    setProblem(description);
    // Category can be used to suggest worker type, but not changing worker here
  };

  const handleSubmit = async () => {
    // Validation
    if (!problem.trim()) {
      Alert.alert('Required Field', 'Please describe the work you need done.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Required Field', 'Please provide the work location.');
      return;
    }
    if (!preferredTime.trim()) {
      Alert.alert('Required Field', 'Please specify your preferred date and time.');
      return;
    }

    // EDGE CASE: Check for duplicate active request
    const userId = user?.id || 'guest';
    if (hasActiveRequestWithWorker(userId, worker.id)) {
      Alert.alert(
        'Active Request Exists',
        'You already have an active request with this worker. Please wait for them to respond.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await addDealRequest({
        customerId: userId,
        customerName: user?.name || 'Guest User',
        workerId: worker.id,
        workerName: worker.name,
        problem: problem.trim(),
        location: location.trim(),
        preferredTime: preferredTime.trim(),
        budget: budget.trim() || undefined,
        status: 'NEW',
      }, () => isUserSuspended(userId));

      if (!result.success) {
        Alert.alert('Cannot Send Request', result.message || 'An error occurred.');
        return;
      }

      // Reset form
      setProblem('');
      setLocation('');
      setPreferredTime('');
      setBudget('');

      Alert.alert(
        'Request Sent! 📨',
        `Your request has been sent to ${worker.name}. They will review and respond soon.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setProblem('');
    setLocation('');
    setPreferredTime('');
    setBudget('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Send Deal Request</Text>
                <Text style={styles.headerSubtitle}>to {worker.name}</Text>
              </View>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Worker Info */}
              <View style={styles.workerInfo}>
                <View style={styles.workerIcon}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.workerDetails}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Text style={styles.workerCategory}>{worker.primary_category}</Text>
                </View>
                {worker.kyc_status === 'VERIFIED' && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.verified} />
                )}
              </View>

              <TrustMessage
                message="All deals are tracked and verified. Only pay after work is completed."
                type="shield"
              />

              {/* AI Helper Button */}
              <TouchableOpacity
                style={styles.aiHelperButton}
                onPress={() => setShowAIHelper(true)}
              >
                <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                <Text style={styles.aiHelperText}>Help me describe my problem</Text>
              </TouchableOpacity>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Problem / Work Description <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe the work you need done..."
                  placeholderTextColor={COLORS.textMuted}
                  value={problem}
                  onChangeText={setProblem}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Text style={styles.helper}>{problem.length}/500 characters</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Location <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter work location address"
                  placeholderTextColor={COLORS.textMuted}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              {/* Location Map Preview */}
              {userLocation && Platform.OS !== 'web' && MiniMapView && (
                <View style={styles.mapPreviewContainer}>
                  <MiniMapView
                    location={userLocation}
                    title="Your Location"
                    height={140}
                  />
                  <View style={styles.mapNote}>
                    <Ionicons name="information-circle" size={14} color={COLORS.info} />
                    <Text style={styles.mapNoteText}>
                      Exact location shared with worker after deal acceptance
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Preferred Date & Time <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Tomorrow 10:00 AM or 20 Dec 2025"
                  placeholderTextColor={COLORS.textMuted}
                  value={preferredTime}
                  onChangeText={setPreferredTime}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Budget Range (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ₹2000 - ₹3000"
                  placeholderTextColor={COLORS.textMuted}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="default"
                />
              </View>

              {/* Info Note */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.info} />
                <Text style={styles.infoText}>
                  The worker will review your request and respond with acceptance, waitlist, or rejection.
                </Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={COLORS.white} />
                    <Text style={styles.submitButtonText}>Send Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* AI Request Helper Modal */}
      <AIRequestHelper
        visible={showAIHelper}
        onClose={() => setShowAIHelper(false)}
        onApply={handleAIApply}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  workerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  workerCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: SPACING.lg,
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    minHeight: 100,
  },
  helper: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
    marginTop: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  aiHelperButton: {
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
  aiHelperText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mapPreviewContainer: {
    marginBottom: SPACING.md,
  },
  mapNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  mapNoteText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.info,
    lineHeight: 16,
  },
});
