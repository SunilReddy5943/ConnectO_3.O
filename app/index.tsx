import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, HERO_IMAGE } from './constants/theme';
import { useAuth } from './context/AuthContext';
import Button from './components/ui/Button';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@connecto_onboarding_completed';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      
      if (!hasCompletedOnboarding) {
        // First time user - show onboarding
        router.replace('/onboarding');
      } else {
        setCheckingOnboarding(false);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setCheckingOnboarding(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !checkingOnboarding && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, checkingOnboarding]);

  const handleGetStarted = () => {
    router.push('/auth/intent-selection');
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  if (isLoading || checkingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="construct" size={48} color={COLORS.primary} />
          <Text style={styles.logoText}>ConnectO</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        />
        <View style={styles.heroContent}>
          <View style={styles.logoRow}>
            <Ionicons name="construct" size={32} color={COLORS.white} />
            <Text style={styles.appName}>ConnectO</Text>
          </View>
          <Text style={styles.tagline}>Find Trusted Workers Near You</Text>
          <Text style={styles.subtitle}>
            Connect with skilled plumbers, electricians, carpenters, and more in seconds
          </Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="search" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.featureText}>Find Workers</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: COLORS.secondary + '20' }]}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.featureText}>Verified Profiles</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="chatbubbles" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>Direct Chat</Text>
          </View>
        </View>

        <Button
          title="Get Started"
          onPress={handleGetStarted}
          fullWidth
          size="lg"
          icon={<Ionicons name="arrow-forward" size={20} color={COLORS.white} />}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Browse as Guest</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  heroSection: {
    height: height * 0.55,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  heroContent: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    left: SPACING.lg,
    right: SPACING.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS['2xl'],
    borderTopRightRadius: BORDER_RADIUS['2xl'],
    marginTop: -SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMuted,
  },
  termsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});
