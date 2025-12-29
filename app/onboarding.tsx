import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from './constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  steps?: { icon: keyof typeof Ionicons.glyphMap; text: string }[];
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'rocket',
    title: 'Welcome to ConnectO',
    description: 'Find trusted local workers and get your work done safely',
    steps: [
      { icon: 'search', text: 'Search for workers' },
      { icon: 'chatbubbles', text: 'Contact & discuss' },
      { icon: 'ribbon', text: 'Create deal' },
      { icon: 'eye', text: 'Track progress live' },
      { icon: 'star', text: 'Review the work' },
    ],
  },
  {
    id: '2',
    icon: 'shield-checkmark',
    title: 'Deals & Live Tracking',
    description: 'Every job is tracked from start to finish for your peace of mind',
    steps: [
      { icon: 'document-text', text: 'Send deal request with budget' },
      { icon: 'checkmark-circle', text: 'Worker accepts request' },
      { icon: 'time', text: 'Track work status in real-time' },
      { icon: 'checkmark-done', text: 'Mark complete when done' },
      { icon: 'star-half', text: 'Leave verified review' },
    ],
  },
  {
    id: '3',
    icon: 'lock-closed',
    title: 'Trust & Safety First',
    description: 'We verify workers and secure every interaction',
    steps: [
      { icon: 'call', text: 'Phone verified workers' },
      { icon: 'medal', text: 'Verified reviews from real work' },
      { icon: 'stats-chart', text: 'Performance metrics visible' },
      { icon: 'eye', text: 'Live work tracking' },
      { icon: 'shield', text: 'Safe & transparent platform' },
    ],
  },
];

const STORAGE_KEY = '@connecto_onboarding_completed';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    router.replace('/(tabs)');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={80} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>

      {item.steps && (
        <View style={styles.stepsContainer}>
          {item.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepIconContainer}>
                <Ionicons name={step.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {ONBOARDING_SLIDES.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              { width: dotWidth, opacity },
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      />

      {renderPagination()}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
        >
          <Text style={styles.nextText}>
            {currentIndex === ONBOARDING_SLIDES.length - 1
              ? 'Get Started'
              : 'Next'}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  slide: {
    width,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['3xl'],
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  stepsContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.xs,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  nextText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: '700',
  },
});
