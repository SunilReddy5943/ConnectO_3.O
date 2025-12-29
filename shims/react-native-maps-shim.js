/**
 * Shim for react-native-maps that prevents Metro bundler errors on web
 * The actual require() is done conditionally in components using Platform.OS check
 */

module.exports = {
  __esModule: true,
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
