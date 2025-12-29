import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { FEATURE_FLAGS, APP_VERSION, ROLE_FEATURES } from './config/featureFlags';

export default function FeatureFlagsScreen() {
  const router = useRouter();

  const renderFeatureFlag = (name: string, enabled: boolean) => (
    <View key={name} style={styles.featureRow}>
      <Text style={styles.featureName}>{name}</Text>
      <View style={[styles.statusBadge, enabled ? styles.enabled : styles.disabled]}>
        <Text style={[styles.statusText, enabled ? styles.enabledText : styles.disabledText]}>
          {enabled ? 'ENABLED' : 'DISABLED'}
        </Text>
      </View>
    </View>
  );

  const renderRoleFeatures = (role: 'CUSTOMER' | 'WORKER', features: Record<string, boolean>) => (
    <View key={role} style={styles.roleSection}>
      <Text style={styles.roleTitle}>{role} Features</Text>
      {Object.entries(features).map(([name, enabled]) => renderFeatureFlag(name, enabled))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Information</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Version */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Version</Text>
          <View style={styles.versionCard}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Version:</Text>
              <Text style={styles.versionValue}>v{APP_VERSION.VERSION}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Build:</Text>
              <Text style={styles.versionValue}>#{APP_VERSION.BUILD_NUMBER}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Environment:</Text>
              <Text style={[styles.versionValue, styles.environmentValue]}>
                {APP_VERSION.ENVIRONMENT}
              </Text>
            </View>
          </View>
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Flags</Text>
          <Text style={styles.sectionSubtitle}>
            These flags control which features are enabled in the app
          </Text>
          
          {Object.entries(FEATURE_FLAGS).map(([name, enabled]) => renderFeatureFlag(name, enabled))}
        </View>

        {/* Role-Specific Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role Features</Text>
          <Text style={styles.sectionSubtitle}>
            Features available based on user role
          </Text>
          
          {renderRoleFeatures('CUSTOMER', ROLE_FEATURES.CUSTOMER)}
          {renderRoleFeatures('WORKER', ROLE_FEATURES.WORKER)}
        </View>

        {/* Note */}
        <View style={styles.noteSection}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.noteText}>
            Feature flags allow us to enable/disable features without app updates. 
            Some features may be disabled for testing or rollout purposes.
          </Text>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  versionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  versionRowLast: {
    borderBottomWidth: 0,
  },
  versionLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  versionValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  environmentValue: {
    color: COLORS.primary,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  featureName: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  enabled: {
    backgroundColor: COLORS.success + '15',
  },
  disabled: {
    backgroundColor: COLORS.textMuted + '15',
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  enabledText: {
    color: COLORS.success,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  roleSection: {
    marginBottom: SPACING.lg,
  },
  roleTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  noteSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
