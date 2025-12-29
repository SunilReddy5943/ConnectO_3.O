import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useDeal } from './DealContext';

export type VerificationLevel = 1 | 2 | 3;

export interface TrustBadge {
  id: string;
  label: string;
  icon: string;
  color: string;
  earned: boolean;
  tooltip: string;
}

export interface VerificationInfo {
  level: VerificationLevel;
  levelName: string;
  badges: TrustBadge[];
  phoneVerified: boolean;
  profileCompleted: boolean;
  isRatedWorker: boolean;
  completedWorksCount: number;
  activeRecently: boolean;
  locationVerified: boolean;
}

interface TrustContextType {
  getWorkerVerification: (workerId: string, workerData?: any) => VerificationInfo;
  getCustomerVerification: (customerId: string) => {
    phoneVerified: boolean;
    completedDealsCount: number;
  };
  getVerificationLevelBadge: (level: VerificationLevel) => {
    label: string;
    color: string;
    icon: string;
  };
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

export function TrustProvider({ children }: { children: ReactNode }) {
  const { getDealRequestsForWorker, getDealRequestsForCustomer, getWorkerRating } = useDeal();

  const getWorkerVerification = (workerId: string, workerData?: any): VerificationInfo => {
    const deals = getDealRequestsForWorker(workerId);
    const rating = getWorkerRating(workerId);

    // Calculate metrics
    const completedWorksCount = deals.filter(
      d => d.status === 'ACCEPTED' && d.workStatus === 'COMPLETED'
    ).length;
    const acceptedDeals = deals.filter(d => d.status === 'ACCEPTED').length;

    // Phone verified (assume true for now - will be from user data)
    const phoneVerified = true;

    // Profile completed (check if worker has all required fields)
    const profileCompleted = workerData
      ? !!(workerData.name && workerData.category && workerData.city && workerData.description)
      : true; // Assume true if no data provided

    // Rated worker (has at least one review)
    const isRatedWorker = rating.totalReviews > 0;

    // Active recently (has deals in last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const activeRecently = deals.some(d => d.createdAt >= thirtyDaysAgo);

    // Location verified (has city set)
    const locationVerified = workerData ? !!workerData.city : true;

    // Determine verification level
    let level: VerificationLevel = 1;
    if (phoneVerified) {
      level = 1;
    }
    if (profileCompleted && completedWorksCount >= 1) {
      level = 2;
    }
    if (rating.averageRating >= 4 && completedWorksCount >= 5) {
      level = 3;
    }

    // Build badges
    const badges: TrustBadge[] = [
      {
        id: 'profile_completed',
        label: 'Profile Completed',
        icon: 'checkmark-circle',
        color: profileCompleted ? '#10b981' : '#d1d5db',
        earned: profileCompleted,
        tooltip: 'Complete profile with all details',
      },
      {
        id: 'rated_worker',
        label: 'Rated Worker',
        icon: 'star',
        color: isRatedWorker ? '#f59e0b' : '#d1d5db',
        earned: isRatedWorker,
        tooltip: 'Has verified customer reviews',
      },
      {
        id: 'completed_works',
        label: `Completed ${completedWorksCount} Work${completedWorksCount !== 1 ? 's' : ''}`,
        icon: 'checkmark-done',
        color: completedWorksCount > 0 ? '#3b82f6' : '#d1d5db',
        earned: completedWorksCount > 0,
        tooltip: 'Successfully completed jobs',
      },
      {
        id: 'active_recently',
        label: 'Active Recently',
        icon: 'pulse',
        color: activeRecently ? '#8b5cf6' : '#d1d5db',
        earned: activeRecently,
        tooltip: 'Active in the last 30 days',
      },
      {
        id: 'location_verified',
        label: 'Location Verified',
        icon: 'location',
        color: locationVerified ? '#06b6d4' : '#d1d5db',
        earned: locationVerified,
        tooltip: 'Location confirmed and verified',
      },
    ];

    return {
      level,
      levelName: getVerificationLevelName(level),
      badges,
      phoneVerified,
      profileCompleted,
      isRatedWorker,
      completedWorksCount,
      activeRecently,
      locationVerified,
    };
  };

  const getCustomerVerification = (customerId: string) => {
    const deals = getDealRequestsForCustomer(customerId);

    const completedDealsCount = deals.filter(
      d => d.status === 'ACCEPTED' && d.workStatus === 'COMPLETED'
    ).length;

    return {
      phoneVerified: true, // Assume true for now
      completedDealsCount,
    };
  };

  const getVerificationLevelBadge = (level: VerificationLevel) => {
    switch (level) {
      case 1:
        return {
          label: 'Level 1 - Verified',
          color: '#3b82f6',
          icon: 'shield-checkmark',
        };
      case 2:
        return {
          label: 'Level 2 - Trusted',
          color: '#8b5cf6',
          icon: 'shield',
        };
      case 3:
        return {
          label: 'Level 3 - Expert',
          color: '#f59e0b',
          icon: 'shield-half',
        };
      default:
        return {
          label: 'Unverified',
          color: '#d1d5db',
          icon: 'shield-outline',
        };
    }
  };

  return (
    <TrustContext.Provider
      value={{
        getWorkerVerification,
        getCustomerVerification,
        getVerificationLevelBadge,
      }}
    >
      {children}
    </TrustContext.Provider>
  );
}

export function useTrust() {
  const context = useContext(TrustContext);
  if (context === undefined) {
    throw new Error('useTrust must be used within a TrustProvider');
  }
  return context;
}

function getVerificationLevelName(level: VerificationLevel): string {
  switch (level) {
    case 1:
      return 'Verified';
    case 2:
      return 'Trusted';
    case 3:
      return 'Expert';
    default:
      return 'Unverified';
  }
}
