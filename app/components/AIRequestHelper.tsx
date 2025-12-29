import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { aiService, DealRequestSuggestion } from '../lib/aiService';

interface AIRequestHelperProps {
  visible: boolean;
  onClose: () => void;
  onApply: (description: string, category: string) => void;
}

export default function AIRequestHelper({ visible, onClose, onApply }: AIRequestHelperProps) {
  const [step, setStep] = useState<'input' | 'questions' | 'result'>('input');
  const [userInput, setUserInput] = useState('');
  const [suggestion, setSuggestion] = useState<DealRequestSuggestion | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [editedDescription, setEditedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetHelp = async () => {
    if (!userInput.trim()) {
      Alert.alert('Input Required', 'Please describe what you need help with.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await aiService.getDealRequestHelp(userInput);
      setSuggestion(result);
      setAnswers(new Array(result.questions.length).fill(''));
      setEditedDescription(result.problemDescription);
      setStep('questions');
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (editedDescription.trim()) {
      onApply(editedDescription, suggestion?.suggestedCategory || '');
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('input');
    setUserInput('');
    setSuggestion(null);
    setAnswers([]);
    setEditedDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="sparkles" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>AI Request Helper</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {step === 'input' && (
              <>
                <Text style={styles.subtitle}>
                  Tell me what work you need done, and I'll help you create a clear request.
                </Text>

                <TextInput
                  style={styles.textArea}
                  placeholder="E.g., My AC is not cooling properly..."
                  placeholderTextColor={COLORS.textMuted}
                  value={userInput}
                  onChangeText={setUserInput}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleGetHelp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color={COLORS.white} />
                      <Text style={styles.buttonText}>Get AI Help</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 'questions' && suggestion && (
              <>
                <Text style={styles.subtitle}>
                  Let me ask a few quick questions to help you better:
                </Text>

                {suggestion.questions.map((question, index) => (
                  <View key={index} style={styles.questionContainer}>
                    <Text style={styles.questionText}>{question}</Text>
                    <TextInput
                      style={styles.answerInput}
                      placeholder="Your answer..."
                      placeholderTextColor={COLORS.textMuted}
                      value={answers[index]}
                      onChangeText={(text) => {
                        const newAnswers = [...answers];
                        newAnswers[index] = text;
                        setAnswers(newAnswers);
                      }}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setStep('result')}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </>
            )}

            {step === 'result' && suggestion && (
              <>
                <View style={styles.aiNotice}>
                  <Ionicons name="information-circle" size={20} color={COLORS.info} />
                  <Text style={styles.aiNoticeText}>
                    AI suggestion – please review and edit as needed
                  </Text>
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Problem Description</Text>
                  <TextInput
                    style={styles.textArea}
                    value={editedDescription}
                    onChangeText={setEditedDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Suggested Category</Text>
                  <View style={styles.categoryBadge}>
                    <Ionicons name="briefcase" size={16} color={COLORS.primary} />
                    <Text style={styles.categoryText}>{suggestion.suggestedCategory}</Text>
                  </View>
                </View>

                {suggestion.urgencyNote && (
                  <View style={styles.resultSection}>
                    <Text style={styles.resultLabel}>Urgency</Text>
                    <View style={styles.urgencyBadge}>
                      <Ionicons name="time" size={16} color={COLORS.warning} />
                      <Text style={styles.urgencyText}>{suggestion.urgencyNote}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => setStep('input')}
                  >
                    <Text style={styles.buttonSecondaryText}>Start Over</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { flex: 1 }]}
                    onPress={handleApplySuggestion}
                  >
                    <Text style={styles.buttonText}>Use This</Text>
                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
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
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
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
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: 100,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonSecondary: {
    backgroundColor: COLORS.background,
    flex: 0,
    paddingHorizontal: SPACING.lg,
  },
  buttonSecondaryText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  questionContainer: {
    marginBottom: SPACING.md,
  },
  questionText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  answerInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  aiNoticeText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    fontWeight: '500',
  },
  resultSection: {
    marginBottom: SPACING.md,
  },
  resultLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.warning,
  },
});
