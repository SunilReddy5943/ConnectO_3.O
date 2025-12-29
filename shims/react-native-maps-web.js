// Dummy shim for react-native-maps on web platform
// This prevents the error when bundling for web

module.exports = {
  default: null,
  MapView: null,
  Marker: null,
  Circle: null,
  Polyline: null,
  Polygon: null,
  Callout: null,
  PROVIDER_GOOGLE: null,
  PROVIDER_DEFAULT: null,
};
