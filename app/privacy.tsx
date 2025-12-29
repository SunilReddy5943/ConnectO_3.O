import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from './constants/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly:{'\n'}
            • Account information (name, phone, email){'\n'}
            • Profile information (skills, experience, location){'\n'}
            • Communications between users{'\n'}
            • Reviews and ratings{'\n'}
            • Transaction and payment information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Automatically Collected Information</Text>
          <Text style={styles.paragraph}>
            When you use our App, we may collect:{'\n'}
            • Device information (model, OS version){'\n'}
            • Location data (with your permission){'\n'}
            • App usage and analytics data{'\n'}
            • Log data and crash reports
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use collected information to:{'\n'}
            • Provide and improve our services{'\n'}
            • Connect workers with customers{'\n'}
            • Process transactions{'\n'}
            • Send notifications and updates{'\n'}
            • Ensure platform safety and security{'\n'}
            • Analyze and improve user experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We share your information:{'\n'}
            • With other users to facilitate connections{'\n'}
            • With service providers who assist our operations{'\n'}
            • When required by law or legal process{'\n'}
            • To protect rights and safety{'\n'}{'\n'}
            We do NOT sell your personal information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:{'\n'}
            • Access your personal information{'\n'}
            • Correct inaccurate data{'\n'}
            • Delete your account and data{'\n'}
            • Opt-out of marketing communications{'\n'}
            • Control location sharing
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Location Data</Text>
          <Text style={styles.paragraph}>
            We collect location data to show nearby workers and services. You can control location permissions in your device settings. Location is only shared with workers after deal acceptance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our services are not intended for users under 18 years of age. We do not knowingly collect information from children.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this policy from time to time. We will notify you of significant changes through the App or email.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            For privacy-related questions, contact us at privacy@connecto.app
          </Text>
        </View>

        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
          <Text style={styles.footerText}>
            Your privacy is important to us. We are committed to protecting your personal information.
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
  lastUpdated: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  footerText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
