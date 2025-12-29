import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const REFERRAL_PROMPT_KEY = '@connecto_referral_prompt_shown';

export const useReferralPrompt = () => {
  const showReferralPrompt = useCallback(async (trigger: 'completed_work' | 'review_submitted') => {
    try {
      // Check if prompt has already been shown
      const promptShown = await AsyncStorage.getItem(`${REFERRAL_PROMPT_KEY}_${trigger}`);
      
      if (!promptShown) {
        // Show the prompt
        Alert.alert(
          'Love ConnectO?',
          trigger === 'completed_work' 
            ? 'Share ConnectO with friends and earn ₹100 for each friend who completes their first booking!'
            : 'Thanks for your review! Help us grow by inviting friends to try ConnectO. Earn ₹100 for each friend who joins!',
          [
            {
              text: 'Maybe Later',
              style: 'cancel',
              onPress: () => {
                // Don't show again for this trigger
                AsyncStorage.setItem(`${REFERRAL_PROMPT_KEY}_${trigger}`, 'true');
              }
            },
            {
              text: 'Refer Friends',
              style: 'default',
              onPress: () => {
                // Navigate to referral screen (handled by caller)
                // Don't show again for this trigger
                AsyncStorage.setItem(`${REFERRAL_PROMPT_KEY}_${trigger}`, 'true');
              }
            }
          ]
        );
        
        return true; // Prompt was shown
      }
      
      return false; // Prompt was not shown
    } catch (error) {
      console.error('Error showing referral prompt:', error);
      return false;
    }
  }, []);

  const resetReferralPrompts = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(`${REFERRAL_PROMPT_KEY}_completed_work`);
      await AsyncStorage.removeItem(`${REFERRAL_PROMPT_KEY}_review_submitted`);
    } catch (error) {
      console.error('Error resetting referral prompts:', error);
    }
  }, []);

  return {
    showReferralPrompt,
    resetReferralPrompts
  };
};
