import React from 'react';
import { View, StyleSheet, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { LocationCoordinates } from '../lib/locationService';

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Circle = maps.Circle;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

interface MiniMapViewProps {
  location: LocationCoordinates;
  title?: string;
  showRadius?: boolean;
  radiusKm?: number;
  height?: number;
  showNavigateButton?: boolean;
  address?: string;
}

export default function MiniMapView({
  location,
  title,
  showRadius = false,
  radiusKm = 5,
  height = 200,
  showNavigateButton = false,
  address,
}: MiniMapViewProps) {
  // Web fallback: show static Google Maps image
  if (Platform.OS === 'web') {
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=600x300&markers=color:blue%7C${location.latitude},${location.longitude}&key=AIzaSyCbLaTG4dYB53C9uKqtt0W1EJqsnnr4NW4`;
    
    return (
      <View style={[styles.container, { height }]}>
        <img
          src={staticMapUrl}
          alt={title || 'Map'}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: BORDER_RADIUS.md,
            objectFit: 'cover',
          }}
        />
        {showNavigateButton && (
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => handleNavigate(location, address)}
          >
            <Ionicons name="navigate" size={16} color={COLORS.white} />
            <Text style={styles.navigateText}>Open in Maps</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Native: use react-native-maps
  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker
          coordinate={location}
          title={title}
        >
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={32} color={COLORS.primary} />
          </View>
        </Marker>

        {showRadius && (
          <Circle
            center={location}
            radius={radiusKm * 1000} // Convert km to meters
            fillColor={COLORS.primary + '20'}
            strokeColor={COLORS.primary}
            strokeWidth={2}
          />
        )}
      </MapView>

      {showNavigateButton && (
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => handleNavigate(location, address)}
        >
          <Ionicons name="navigate" size={16} color={COLORS.white} />
          <Text style={styles.navigateText}>Open in Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function handleNavigate(location: LocationCoordinates, address?: string) {
  const label = address ? encodeURIComponent(address) : 'Location';
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${location.latitude},${location.longitude}`,
    android: `geo:0,0?q=${location.latitude},${location.longitude}(${label})`,
    default: `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
  });

  Linking.openURL(url!).catch((err) => {
    console.error('Error opening maps:', err);
    // Fallback to Google Maps web
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    );
  });
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    ...SHADOWS.md,
  },
  navigateText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
});
