import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DealRequest, WorkStatus } from '../context/DealContext';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - SPACING.base * 2 - SPACING.md * 2;
const THUMB_SIZE = 56;
const SLIDE_THRESHOLD = SLIDE_WIDTH - THUMB_SIZE - 10;

// Status color configuration
const STATUS_COLORS = {
  ACCEPTED: '#2563eb',  // Blue
  ONGOING: '#f97316',   // Orange
  COMPLETED: '#10b981', // Green
};

interface LiveStatusCardProps {
  deal: DealRequest;
  isWorker: boolean;
  onUpdateStatus?: (requestId: string, newStatus: WorkStatus) => Promise<boolean>;
}

export default React.memo(function LiveStatusCard({ deal, isWorker, onUpdateStatus }: LiveStatusCardProps) {
  const currentStatus = deal.workStatus || 'ACCEPTED';
  const currentColor = STATUS_COLORS[currentStatus];

  // Entry animation
  const entryAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isSliding, setIsSliding] = useState(false);

  // Progress step pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Color transition animation
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Success feedback animation
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Entry animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulse animation for active step
  useEffect(() => {
    if (currentStatus !== 'COMPLETED') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [currentStatus]);

  // Color transition animation when status changes
  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      colorAnim.setValue(0);
    });
  }, [currentStatus]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isWorker && currentStatus !== 'COMPLETED',
      onMoveShouldSetPanResponder: () => isWorker && currentStatus !== 'COMPLETED',
      onPanResponderGrant: () => {
        setIsSliding(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, Math.min(gestureState.dx, SLIDE_THRESHOLD));
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: async (_, gestureState) => {
        setIsSliding(false);
        
        if (gestureState.dx >= SLIDE_THRESHOLD) {
          // Slide completed - update status
          Animated.spring(slideAnim, {
            toValue: SLIDE_THRESHOLD,
            useNativeDriver: true,
          }).start(async () => {
            // Trigger status update
            const nextStatus: WorkStatus = currentStatus === 'ACCEPTED' ? 'ONGOING' : 'COMPLETED';
            const message = nextStatus === 'ONGOING' ? 'Work Started' : 'Work Completed';
            
            let success = true;
            if (onUpdateStatus) {
              success = await onUpdateStatus(deal.id, nextStatus);
            }

            if (!success) {
              // If update failed, reset slide
              slideAnim.setValue(0);
              return;
            }

            // Show success feedback
            setSuccessMessage(message);
            setShowSuccess(true);
            
            Animated.parallel([
              Animated.spring(successScale, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
              }),
              Animated.timing(successOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // Auto dismiss after 1 second
              setTimeout(() => {
                Animated.parallel([
                  Animated.timing(successScale, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }),
                  Animated.timing(successOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  setShowSuccess(false);
                  slideAnim.setValue(0);
                });
              }, 1000);
            });
          });
        } else {
          // Snap back
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getStepStatus = (step: WorkStatus) => {
    const steps: WorkStatus[] = ['ACCEPTED', 'ONGOING', 'COMPLETED'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  const getSlideText = () => {
    if (currentStatus === 'ACCEPTED') return 'Slide to Start Work';
    if (currentStatus === 'ONGOING') return 'Slide to Mark Completed';
    return '';
  };

  const slideProgress = slideAnim.interpolate({
    inputRange: [0, SLIDE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const otherPartyName = isWorker ? deal.customerName : deal.workerName;

  // Calculate relative time for status
  const getRelativeTime = (timestamp: number | undefined) => {
    if (!timestamp) return null;
    
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const statusTimestamp = useMemo(() => {
    if (currentStatus === 'ONGOING' && deal.startedAt) {
      return getRelativeTime(deal.startedAt);
    }
    if (currentStatus === 'ACCEPTED' && deal.acceptedAt) {
      return getRelativeTime(deal.acceptedAt);
    }
    return null;
  }, [currentStatus, deal.startedAt, deal.acceptedAt]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: entryAnim,
          transform: [
            {
              translateY: entryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={[styles.card, { borderColor: currentColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.statusDot, { backgroundColor: currentColor }]} />
            <View>
              <Text style={styles.headerTitle}>Live Work Status</Text>
              {statusTimestamp && (
                <Text style={styles.headerSubtitle}>
                  {currentStatus === 'ONGOING' ? 'Started' : 'Accepted'} {statusTimestamp}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: currentColor + '15' }]}>
            <Text style={[styles.statusBadgeText, { color: currentColor }]}>
              {currentStatus}
            </Text>
          </View>
        </View>

        {/* Deal Info */}
        <View style={styles.dealInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{otherPartyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText} numberOfLines={1}>
              {deal.problem}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText} numberOfLines={1}>
              {deal.location}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            {/* Step 1: Accepted */}
            <Animated.View
              style={[
                styles.step,
                getStepStatus('ACCEPTED') === 'active' && {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.stepCircle,
                  getStepStatus('ACCEPTED') === 'completed' && {
                    backgroundColor: STATUS_COLORS.ACCEPTED,
                  },
                  getStepStatus('ACCEPTED') === 'active' && {
                    backgroundColor: STATUS_COLORS.ACCEPTED,
                  },
                  getStepStatus('ACCEPTED') === 'upcoming' && {
                    backgroundColor: COLORS.borderLight,
                  },
                ]}
              >
                {getStepStatus('ACCEPTED') === 'completed' && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  getStepStatus('ACCEPTED') === 'active' && {
                    color: STATUS_COLORS.ACCEPTED,
                    fontWeight: '700',
                  },
                ]}
              >
                Accepted
              </Text>
            </Animated.View>

            {/* Connector 1 */}
            <View style={styles.connector}>
              <View
                style={[
                  styles.connectorFill,
                  getStepStatus('ONGOING') !== 'upcoming' && {
                    backgroundColor: STATUS_COLORS.ONGOING,
                  },
                ]}
              />
            </View>

            {/* Step 2: Ongoing */}
            <Animated.View
              style={[
                styles.step,
                getStepStatus('ONGOING') === 'active' && {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.stepCircle,
                  getStepStatus('ONGOING') === 'completed' && {
                    backgroundColor: STATUS_COLORS.ONGOING,
                  },
                  getStepStatus('ONGOING') === 'active' && {
                    backgroundColor: STATUS_COLORS.ONGOING,
                  },
                  getStepStatus('ONGOING') === 'upcoming' && {
                    backgroundColor: COLORS.borderLight,
                    opacity: 0.5,
                  },
                ]}
              >
                {getStepStatus('ONGOING') === 'completed' && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  getStepStatus('ONGOING') === 'active' && {
                    color: STATUS_COLORS.ONGOING,
                    fontWeight: '700',
                  },
                  getStepStatus('ONGOING') === 'upcoming' && {
                    opacity: 0.5,
                  },
                ]}
              >
                Ongoing
              </Text>
            </Animated.View>

            {/* Connector 2 */}
            <View style={styles.connector}>
              <View
                style={[
                  styles.connectorFill,
                  getStepStatus('COMPLETED') !== 'upcoming' && {
                    backgroundColor: STATUS_COLORS.COMPLETED,
                  },
                ]}
              />
            </View>

            {/* Step 3: Completed */}
            <Animated.View
              style={[
                styles.step,
                getStepStatus('COMPLETED') === 'active' && {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.stepCircle,
                  getStepStatus('COMPLETED') === 'completed' && {
                    backgroundColor: STATUS_COLORS.COMPLETED,
                  },
                  getStepStatus('COMPLETED') === 'active' && {
                    backgroundColor: STATUS_COLORS.COMPLETED,
                  },
                  getStepStatus('COMPLETED') === 'upcoming' && {
                    backgroundColor: COLORS.borderLight,
                    opacity: 0.5,
                  },
                ]}
              >
                {getStepStatus('COMPLETED') === 'completed' && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  getStepStatus('COMPLETED') === 'active' && {
                    color: STATUS_COLORS.COMPLETED,
                    fontWeight: '700',
                  },
                  getStepStatus('COMPLETED') === 'upcoming' && {
                    opacity: 0.5,
                  },
                ]}
              >
                Completed
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Worker Slide Control */}
        {isWorker && currentStatus !== 'COMPLETED' && (
          <View style={styles.slideContainer}>
            <Animated.View
              style={[
                styles.slideTrack,
                {
                  backgroundColor: currentColor + '10',
                  borderColor: currentColor + '30',
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.slideFill,
                  {
                    backgroundColor: currentColor + '20',
                    width: slideProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              <Animated.Text
                style={[
                  styles.slideText,
                  {
                    opacity: slideProgress.interpolate({
                      inputRange: [0, 0.5],
                      outputRange: [1, 0],
                    }),
                  },
                ]}
              >
                {getSlideText()}
              </Animated.Text>
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.slideThumb,
                  {
                    backgroundColor: currentColor,
                    transform: [{ translateX: slideAnim }],
                  },
                ]}
              >
                <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
              </Animated.View>
            </Animated.View>
          </View>
        )}

        {/* Customer View - Read Only */}
        {!isWorker && (
          <View style={styles.customerNote}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
            <Text style={styles.customerNoteText}>
              Track work progress in real-time. Worker will update status.
            </Text>
          </View>
        )}
      </View>

      {/* Success Feedback Overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <View style={styles.successContent}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 2,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  dealInfo: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  progressContainer: {
    marginVertical: SPACING.md,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  stepLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  connector: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.xs,
    overflow: 'hidden',
  },
  connectorFill: {
    height: '100%',
    backgroundColor: COLORS.borderLight,
  },
  slideContainer: {
    marginTop: SPACING.md,
  },
  slideTrack: {
    height: THUMB_SIZE,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  slideFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.full,
  },
  slideText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    zIndex: 1,
  },
  slideThumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE - 8,
    height: THUMB_SIZE - 8,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  customerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.info + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  customerNoteText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  successText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.success,
  },
});
