import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const TERMS_ACCEPTED_KEY = '@connecto_terms_accepted';

interface TermsAcceptanceModalProps {
  onAccept: () => void;
}

export default function TermsAcceptanceModal({ onAccept }: TermsAcceptanceModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const accepted = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
      if (!accepted) {
        setVisible(true);
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
    }
  };

  const handleAccept = async () => {
    if (!checked) return;
    
    try {
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        onAccept();
      });
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Welcome to ConnectO</Text>
            <Text style={styles.subtitle}>
              Before you begin, please review and accept our terms
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.summarySection}>
              <View style={styles.summaryItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.summaryText}>
                  Connect with verified workers in your area
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.summaryText}>
                  Secure communication and deal tracking
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.summaryText}>
                  Verified reviews from real customers
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.summaryText}>
                  Your data is protected and never sold
                </Text>
              </View>
            </View>

            {/* Links */}
            <View style={styles.linksSection}>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => router.push('/terms')}
              >
                <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                <Text style={styles.linkText}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => router.push('/privacy')}
              >
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
                <Text style={styles.linkText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setChecked(!checked)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
            </View>
            <Text style={styles.checkboxText}>
              I have read and agree to the Terms of Service and Privacy Policy
            </Text>
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity 
            style={[styles.acceptButton, !checked && styles.acceptButtonDisabled]}
            onPress={handleAccept}
            disabled={!checked}
          >
            <Text style={styles.acceptButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    maxHeight: 300,
  },
  summarySection: {
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  linksSection: {
    gap: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  linkText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  acceptButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.6,
  },
  acceptButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.white,
  },
});
