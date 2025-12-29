import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLocation } from '../context/LocationContext';
import { INDIAN_CITIES } from '../constants/theme';
import { getCityCoordinates } from '../lib/locationService';

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LocationPermissionModal({
  visible,
  onClose,
}: LocationPermissionModalProps) {
  const { requestPermission, setManualLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        onClose();
      } else {
        // Permission denied, show manual input
        setShowManualInput(true);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setShowManualInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocation = async () => {
    if (!selectedCity) {
      alert('Please select a city');
      return;
    }

    setIsLoading(true);
    try {
      const cityCoords = getCityCoordinates(selectedCity);
      if (cityCoords) {
        await setManualLocation({
          ...cityCoords,
          area: selectedArea || cityCoords.area,
        });
        onClose();
      } else {
        alert('City not found. Please select from the list.');
      }
    } catch (error) {
      console.error('Manual location error:', error);
      alert('Failed to set location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Set default Mumbai location and close
    const defaultLocation = getCityCoordinates('Mumbai');
    if (defaultLocation) {
      setManualLocation(defaultLocation);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {!showManualInput ? (
            <>
              {/* Location Permission Request */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location" size={48} color={COLORS.primary} />
                </View>
              </View>

              <Text style={styles.title}>Enable Location Access</Text>
              <Text style={styles.subtitle}>
                Help us find skilled workers near you and show accurate distances
              </Text>

              <View style={styles.benefits}>
                <BenefitItem
                  icon="navigate-circle"
                  text="Find workers closest to you"
                />
                <BenefitItem
                  icon="time"
                  text="Get faster service"
                />
                <BenefitItem
                  icon="lock-closed"
                  text="Your exact address stays private"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleRequestPermission}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="location" size={20} color={COLORS.white} />
                    <Text style={styles.primaryButtonText}>Allow Location Access</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowManualInput(true)}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>Enter Location Manually</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Manual Location Input */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowManualInput(false)}>
                  <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Enter Your Location</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.form}>
                  <Text style={styles.label}>Select City *</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cityChips}
                  >
                    {INDIAN_CITIES.map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={[
                          styles.cityChip,
                          selectedCity === city && styles.cityChipActive,
                        ]}
                        onPress={() => setSelectedCity(city)}
                      >
                        <Text
                          style={[
                            styles.cityChipText,
                            selectedCity === city && styles.cityChipTextActive,
                          ]}
                        >
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>Area / Locality (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Andheri, Koramangala"
                    placeholderTextColor={COLORS.textMuted}
                    value={selectedArea}
                    onChangeText={setSelectedArea}
                  />

                  <View style={styles.notice}>
                    <Ionicons name="information-circle" size={20} color={COLORS.info} />
                    <Text style={styles.noticeText}>
                      We'll use your city to find nearby workers. You can update this anytime in settings.
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleManualLocation}
                  disabled={isLoading || !selectedCity}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                      <Text style={styles.primaryButtonText}>Save Location</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function BenefitItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  benefits: {
    marginBottom: SPACING.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  skipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  cityChips: {
    marginBottom: SPACING.lg,
  },
  cityChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.sm,
  },
  cityChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cityChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cityChipTextActive: {
    color: COLORS.white,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  notice: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
  },
});
