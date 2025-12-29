// Feature flags configuration
export const FEATURE_FLAGS = {
  // CRITICAL: Feature Freeze Flag - Prevent feature changes post-freeze
  FEATURE_FREEZE: true, // Set to true for production builds
  
  // AI Features
  AI_CHAT_ENABLED: true,
  AI_SUGGESTIONS_ENABLED: true,
  AI_PROFILE_OPTIMIZATION: true,
  
  // Maps Features
  MAPS_ENABLED: true,
  LOCATION_SERVICES_ENABLED: true,
  DISTANCE_FILTERING_ENABLED: true,
  
  // Payment Features (currently disabled)
  PAYMENTS_ENABLED: false,
  WALLET_FEATURES_ENABLED: false,
  
  // Growth Features
  REFERRALS_ENABLED: true,
  ACHIEVEMENTS_ENABLED: true,
  BOOST_FEATURES_ENABLED: true,
  
  // Communication Features
  VOICE_CALLS_ENABLED: false, // Would require additional setup
  VIDEO_CALLS_ENABLED: false, // Would require additional setup
  
  // Analytics Features
  USAGE_ANALYTICS_ENABLED: true,
  PERFORMANCE_MONITORING_ENABLED: true,
  
  // Experimental Features
  EXPERIMENTAL_UI_REFRESH: false, // Set to true for beta testers
};

// App version information
export const APP_VERSION = {
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUILD_DATE: '2024-12-22',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
  MIN_SUPPORTED_VERSION: '1.0.0', // For future version enforcement
};

// Feature availability by role
export const ROLE_FEATURES = {
  CUSTOMER: {
    CAN_POST_JOBS: false, // As per Stage 12 requirements
    CAN_SEND_DEAL_REQUESTS: true,
    CAN_LEAVE_REVIEWS: true,
    CAN_REFER_FRIENDS: true,
  },
  WORKER: {
    CAN_POST_WORK: false, // As per Stage 12 requirements
    CAN_ACCEPT_DEALS: true,
    CAN_UPDATE_STATUS: true,
    CAN_VIEW_EARNINGS: true,
    CAN_REFER_FRIENDS: true,
  },
};
