import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export type WorkStatus = 'ACCEPTED' | 'ONGOING' | 'COMPLETED';

export interface Review {
  rating: number; // 1-5
  comment?: string;
  createdAt: number;
}

export interface DealRequest {
  id: string;
  customerId: string;
  customerName: string;
  workerId: string;
  workerName: string;
  problem: string;
  location: string;
  preferredTime: string;
  budget?: string;
  status: 'NEW' | 'ACCEPTED' | 'WAITLISTED' | 'REJECTED';
  workStatus?: WorkStatus; // Track work progress for accepted deals
  review?: Review; // Customer review (only for completed work)
  createdAt: number;
  acceptedAt?: number; // When deal was accepted
  startedAt?: number; // When work started (ONGOING)
  completedAt?: number; // When work completed
}

interface DealContextType {
  dealRequests: DealRequest[];
  addDealRequest: (request: Omit<DealRequest, 'id' | 'createdAt'>, checkSuspension?: () => boolean) => Promise<{ success: boolean; message?: string }>;
  updateDealRequestStatus: (requestId: string, status: DealRequest['status'], checkSuspension?: () => boolean) => Promise<boolean>;
  updateWorkStatus: (requestId: string, workStatus: WorkStatus) => Promise<boolean>;
  submitReview: (requestId: string, review: Omit<Review, 'createdAt'>) => Promise<boolean>;
  getWorkerRating: (workerId: string) => { averageRating: number; totalReviews: number };
  getWorkerReviews: (workerId: string) => Array<{ deal: DealRequest; review: Review }>;
  canSubmitReview: (requestId: string, customerId: string) => boolean;
  getActiveDealForWorker: (workerId: string) => DealRequest | undefined;
  getActiveDealForCustomer: (customerId: string) => DealRequest | undefined;
  getDealRequestsForWorker: (workerId: string) => DealRequest[];
  getDealRequestsForCustomer: (customerId: string) => DealRequest[];
  getNewRequestsForWorker: (workerId: string) => DealRequest[];
  hasActiveRequestWithWorker: (customerId: string, workerId: string) => boolean;
  setNotificationCallback: (callback: (type: string, deal: DealRequest) => void) => void;
  isLoading: boolean;
}

const DealContext = createContext<DealContextType | undefined>(undefined);

const STORAGE_KEY = '@connecto_deal_requests';

export function DealProvider({ children }: { children: ReactNode }) {
  const [dealRequests, setDealRequests] = useState<DealRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCallback, setNotificationCallback] = useState<((type: string, deal: DealRequest) => void) | null>(null);

  // Load deal requests from AsyncStorage on mount
  useEffect(() => {
    loadDealRequests();
  }, []);

  const loadDealRequests = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDealRequests(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading deal requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDealRequests = async (requests: DealRequest[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving deal requests:', error);
    }
  };

  const addDealRequest = async (request: Omit<DealRequest, 'id' | 'createdAt'>, checkSuspension?: () => boolean) => {
    // Check if user is suspended
    if (checkSuspension && checkSuspension()) {
      Alert.alert(
        'Account Suspended',
        'Your account has been suspended. You cannot send deal requests at this time.',
        [{ text: 'OK' }]
      );
      return {
        success: false,
        message: 'Account suspended'
      };
    }

    // EDGE CASE: Prevent duplicate requests to same worker
    const existingActiveRequest = dealRequests.find(
      req => req.customerId === request.customerId &&
             req.workerId === request.workerId &&
             (req.status === 'NEW' || req.status === 'ACCEPTED')
    );

    if (existingActiveRequest) {
      return {
        success: false,
        message: 'You already have an active request with this worker.'
      };
    }

    const newRequest: DealRequest = {
      ...request,
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    // Optimistic update - update UI immediately
    const updatedRequests = [newRequest, ...dealRequests];
    setDealRequests(updatedRequests);
    
    // Persist to AsyncStorage (no await to keep UI responsive)
    saveDealRequests(updatedRequests);

    // Trigger notification
    if (notificationCallback) {
      notificationCallback('NEW_REQUEST', newRequest);
    }

    return { success: true };
  };

  const updateDealRequestStatus = async (requestId: string, status: DealRequest['status'], checkSuspension?: () => boolean) => {
    // Check if user is suspended (for accepting/rejecting)
    if (checkSuspension && checkSuspension() && (status === 'ACCEPTED')) {
      Alert.alert(
        'Account Suspended',
        'Your account has been suspended. You cannot accept deal requests at this time.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // EDGE CASE: Guard invalid transitions
    const request = dealRequests.find(req => req.id === requestId);
    if (!request) return false;

    // EDGE CASE: Cannot change status of WAITLISTED or REJECTED (locked)
    if (request.status === 'WAITLISTED' || request.status === 'REJECTED') {
      return false;
    }

    const updatedRequests = dealRequests.map(req => {
      if (req.id === requestId) {
        const updates: Partial<DealRequest> = { status };
        // When accepting a deal, initialize work status and timestamp
        if (status === 'ACCEPTED') {
          updates.workStatus = 'ACCEPTED';
          updates.acceptedAt = Date.now();
        }
        // EDGE CASE: Lock status for WAITLISTED and REJECTED
        if (status === 'WAITLISTED' || status === 'REJECTED') {
          // These are final states
        }
        return { ...req, ...updates };
      }
      return req;
    });
    
    // Optimistic update - update UI immediately
    setDealRequests(updatedRequests);
    
    // Persist to AsyncStorage (no await for instant UI)
    saveDealRequests(updatedRequests);

    // Trigger notification
    if (notificationCallback && request) {
      const updatedRequest = updatedRequests.find(r => r.id === requestId)!;
      if (status === 'ACCEPTED') {
        notificationCallback('REQUEST_ACCEPTED', updatedRequest);
      } else if (status === 'WAITLISTED') {
        notificationCallback('REQUEST_WAITLISTED', updatedRequest);
      } else if (status === 'REJECTED') {
        notificationCallback('REQUEST_REJECTED', updatedRequest);
      }
    }

    return true;
  };

  const updateWorkStatus = async (requestId: string, workStatus: WorkStatus) => {
    // EDGE CASE: Validate status transition
    const request = dealRequests.find(req => req.id === requestId);
    if (!request) return false;

    // EDGE CASE: Cannot change status if not ACCEPTED
    if (request.status !== 'ACCEPTED') return false;

    const currentWorkStatus = request.workStatus || 'ACCEPTED';

    // EDGE CASE: Guard invalid work status transitions
    if (currentWorkStatus === 'ACCEPTED' && workStatus === 'COMPLETED') {
      // Cannot skip ONGOING
      return false;
    }

    if (currentWorkStatus === 'COMPLETED') {
      // Cannot change after completion
      return false;
    }

    // Valid transitions:
    // ACCEPTED → ONGOING
    // ONGOING → COMPLETED
    const validTransitions: Record<WorkStatus, WorkStatus[]> = {
      ACCEPTED: ['ONGOING'],
      ONGOING: ['COMPLETED'],
      COMPLETED: [], // No transitions from completed
    };

    if (!validTransitions[currentWorkStatus].includes(workStatus)) {
      return false;
    }

    const updatedRequests = dealRequests.map(req => {
      if (req.id === requestId) {
        const updates: Partial<DealRequest> = { workStatus };
        // Track timestamps for work progress
        if (workStatus === 'ONGOING') {
          updates.startedAt = Date.now();
        } else if (workStatus === 'COMPLETED') {
          updates.completedAt = Date.now();
        }
        return { ...req, ...updates };
      }
      return req;
    });
    
    // Optimistic update - update UI immediately
    setDealRequests(updatedRequests);
    
    // Persist to AsyncStorage (no await for instant UI)
    saveDealRequests(updatedRequests);

    // Trigger notification
    if (notificationCallback && request) {
      const updatedRequest = updatedRequests.find(r => r.id === requestId)!;
      notificationCallback('STATUS_UPDATE', updatedRequest);
    }

    return true;
  };

  const getActiveDealForWorker = (workerId: string) => {
    // EDGE CASE: Only ONE active LiveStatusCard - Priority: ONGOING > ACCEPTED
    const deals = dealRequests.filter(
      request => request.workerId === workerId && 
                 request.status === 'ACCEPTED' && 
                 request.workStatus !== 'COMPLETED'
    );

    // Priority: ONGOING first, then ACCEPTED
    const ongoingDeal = deals.find(d => d.workStatus === 'ONGOING');
    if (ongoingDeal) return ongoingDeal;

    const acceptedDeal = deals.find(d => d.workStatus === 'ACCEPTED');
    return acceptedDeal;
  };

  const getActiveDealForCustomer = (customerId: string) => {
    // EDGE CASE: Only ONE active LiveStatusCard - Priority: ONGOING > ACCEPTED
    const deals = dealRequests.filter(
      request => request.customerId === customerId && 
                 request.status === 'ACCEPTED' && 
                 request.workStatus !== 'COMPLETED'
    );

    // Priority: ONGOING first, then ACCEPTED
    const ongoingDeal = deals.find(d => d.workStatus === 'ONGOING');
    if (ongoingDeal) return ongoingDeal;

    const acceptedDeal = deals.find(d => d.workStatus === 'ACCEPTED');
    return acceptedDeal;
  };

  const hasActiveRequestWithWorker = (customerId: string, workerId: string) => {
    return dealRequests.some(
      req => req.customerId === customerId &&
             req.workerId === workerId &&
             (req.status === 'NEW' || req.status === 'ACCEPTED')
    );
  };

  const submitReview = async (requestId: string, review: Omit<Review, 'createdAt'>) => {
    const request = dealRequests.find(req => req.id === requestId);
    if (!request) return false;

    // REVIEW ELIGIBILITY: Only completed work can be reviewed
    if (request.status !== 'ACCEPTED' || request.workStatus !== 'COMPLETED') {
      return false;
    }

    // REVIEW ELIGIBILITY: Cannot review if already reviewed
    if (request.review) {
      return false;
    }

    // Validate rating
    if (review.rating < 1 || review.rating > 5) {
      return false;
    }

    const updatedRequests = dealRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          review: {
            ...review,
            createdAt: Date.now(),
          },
        };
      }
      return req;
    });

    // Optimistic update
    setDealRequests(updatedRequests);
    saveDealRequests(updatedRequests);

    // Trigger notification
    if (notificationCallback) {
      const updatedRequest = updatedRequests.find(r => r.id === requestId)!;
      notificationCallback('REVIEW_RECEIVED', updatedRequest);
    }

    return true;
  };

  const canSubmitReview = (requestId: string, customerId: string) => {
    const request = dealRequests.find(req => req.id === requestId);
    if (!request) return false;

    // Only customer can review
    if (request.customerId !== customerId) return false;

    // Only completed work
    if (request.status !== 'ACCEPTED' || request.workStatus !== 'COMPLETED') {
      return false;
    }

    // Not already reviewed
    if (request.review) return false;

    return true;
  };

  const getWorkerRating = (workerId: string) => {
    const completedDeals = dealRequests.filter(
      req => req.workerId === workerId &&
             req.status === 'ACCEPTED' &&
             req.workStatus === 'COMPLETED' &&
             req.review
    );

    if (completedDeals.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRating = completedDeals.reduce((sum, deal) => sum + (deal.review?.rating || 0), 0);
    const averageRating = totalRating / completedDeals.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: completedDeals.length,
    };
  };

  const getWorkerReviews = (workerId: string) => {
    return dealRequests
      .filter(
        req => req.workerId === workerId &&
               req.status === 'ACCEPTED' &&
               req.workStatus === 'COMPLETED' &&
               req.review
      )
      .map(deal => ({
        deal,
        review: deal.review!,
      }))
      .sort((a, b) => b.review.createdAt - a.review.createdAt); // Most recent first
  };

  const getDealRequestsForWorker = (workerId: string) => {
    return dealRequests.filter(request => request.workerId === workerId);
  };

  const getDealRequestsForCustomer = (customerId: string) => {
    return dealRequests.filter(request => request.customerId === customerId);
  };

  const getNewRequestsForWorker = (workerId: string) => {
    return dealRequests.filter(
      request => request.workerId === workerId && request.status === 'NEW'
    );
  };

  return (
    <DealContext.Provider
      value={{
        dealRequests,
        addDealRequest,
        updateDealRequestStatus,
        updateWorkStatus,
        submitReview,
        getWorkerRating,
        getWorkerReviews,
        canSubmitReview,
        getActiveDealForWorker,
        getActiveDealForCustomer,
        getDealRequestsForWorker,
        getDealRequestsForCustomer,
        getNewRequestsForWorker,
        hasActiveRequestWithWorker,
        setNotificationCallback: useCallback((callback: (type: string, deal: DealRequest) => void) => {
          setNotificationCallback(() => callback);
        }, []),
        isLoading,
      }}
    >
      {children}
    </DealContext.Provider>
  );
}

export function useDeal() {
  const context = useContext(DealContext);
  if (context === undefined) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
}
