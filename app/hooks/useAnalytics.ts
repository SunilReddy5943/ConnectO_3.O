import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURE_FLAGS } from '../config/featureFlags';

// Simple analytics logger that stores events locally
// In a real app, this would send to a backend analytics service

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}
export const useAnalytics = () => {
  const logEvent = useCallback(async (event: string, properties?: Record<string, any>) => {
    try {
      if (!FEATURE_FLAGS.USAGE_ANALYTICS_ENABLED) return;
      
      const eventData: AnalyticsEvent = {
        event,
        properties,
        timestamp: Date.now(),
      };
      
      // Get existing events
      const existingEvents = await AsyncStorage.getItem('@connecto_analytics_events');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      
      // Add new event
      events.push(eventData);
      
      // Keep only last 1000 events to prevent storage bloat
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      // Save back to storage
      await AsyncStorage.setItem('@connecto_analytics_events', JSON.stringify(events));
      
      // Also log to console in development
      if (__DEV__) {
        console.log('[ANALYTICS]', event, properties);
      }
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }, []);

  // Predefined event loggers
  const logSearch = useCallback((query: string, filters?: Record<string, any>) => {
    logEvent('search_performed', { query, filters });
  }, [logEvent]);

  const logDealSent = useCallback((workerId: string, problem: string) => {
    logEvent('deal_request_sent', { workerId, problem });
  }, [logEvent]);

  const logDealAccepted = useCallback((dealId: string) => {
    logEvent('deal_request_accepted', { dealId });
  }, [logEvent]);

  const logWorkCompleted = useCallback((dealId: string) => {
    logEvent('work_completed', { dealId });
  }, [logEvent]);

  const logReviewSubmitted = useCallback((dealId: string, rating: number) => {
    logEvent('review_submitted', { dealId, rating });
  }, [logEvent]);

  const logUserReport = useCallback((userId: string, reason: string) => {
    logEvent('user_reported', { userId, reason });
  }, [logEvent]);

  const logReferralPromptShown = useCallback((trigger: string) => {
    logEvent('referral_prompt_shown', { trigger });
  }, [logEvent]);

  const logReferralPromptAction = useCallback((action: string, trigger: string) => {
    logEvent('referral_prompt_action', { action, trigger });
  }, [logEvent]);

  // Get all stored events (for debugging or export)
  const getStoredEvents = useCallback(async (): Promise<AnalyticsEvent[]> => {
    try {
      const events = await AsyncStorage.getItem('@connecto_analytics_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Error retrieving analytics events:', error);
      return [];
    }
  }, []);

  // Clear stored events
  const clearStoredEvents = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('@connecto_analytics_events');
    } catch (error) {
      console.error('Error clearing analytics events:', error);
    }
  }, []);

  return {
    logEvent,
    logSearch,
    logDealSent,
    logDealAccepted,
    logWorkCompleted,
    logReviewSubmitted,
    logUserReport,
    logReferralPromptShown,
    logReferralPromptAction,
    getStoredEvents,
    clearStoredEvents,
  };
};
