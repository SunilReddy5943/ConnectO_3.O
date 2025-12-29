import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useDeal, DealRequest } from './DealContext';

// Hardcoded admin IDs for MVP
const ADMIN_USER_IDS = [
  'admin-001',
  'admin-002',
];

export interface SuspendedUser {
  userId: string;
  userName: string;
  suspendedAt: number;
  suspendedBy: string; // Admin ID
  reason: string;
  notes?: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  relatedDealId?: string;
  timestamp: number;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: number;
  actionTaken?: string;
}

export interface FlaggedReview {
  id: string;
  dealId: string;
  reviewerId: string;
  reviewerName: string;
  reviewedUserId: string;
  reviewedUserName: string;
  rating: number;
  comment?: string;
  flaggedAt: number;
  flaggedBy: string; // Admin ID
  flagReason: string;
  hidden: boolean;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  action: 'SUSPEND_USER' | 'UNSUSPEND_USER' | 'FLAG_REVIEW' | 'RESOLVE_REPORT' | 'UNFLAG_REVIEW';
  targetId: string; // User ID or Review ID
  targetType: 'USER' | 'REVIEW' | 'REPORT';
  reason?: string;
  notes?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface AdminContextType {
  // Admin check
  isAdmin: boolean;
  isAdminUser: (userId: string) => boolean;
  
  // User management
  suspendedUsers: SuspendedUser[];
  suspendUser: (userId: string, userName: string, reason: string, notes?: string) => Promise<void>;
  unsuspendUser: (userId: string) => Promise<void>;
  isUserSuspended: (userId: string) => boolean;
  
  // Reports
  reports: UserReport[];
  addReport: (report: Omit<UserReport, 'id' | 'timestamp' | 'reviewed'>) => Promise<void>;
  markReportReviewed: (reportId: string, actionTaken?: string) => Promise<void>;
  getUnreviewedReportsCount: () => number;
  
  // Review moderation
  flaggedReviews: FlaggedReview[];
  flagReview: (review: Omit<FlaggedReview, 'id' | 'flaggedAt' | 'flaggedBy' | 'hidden'>) => Promise<void>;
  unflagReview: (flaggedReviewId: string) => Promise<void>;
  isReviewFlagged: (dealId: string) => boolean;
  
  // Admin actions
  adminActions: AdminAction[];
  logAdminAction: (action: Omit<AdminAction, 'id' | 'timestamp' | 'adminId' | 'adminName'>) => Promise<void>;
  
  // Stats
  getAdminStats: () => {
    totalUsers: number;
    totalWorkers: number;
    totalCustomers: number;
    activeDeals: number;
    completedDeals: number;
    suspendedUsersCount: number;
    unreviewedReports: number;
    flaggedReviewsCount: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUSPENDED_USERS: '@connecto_suspended_users',
  REPORTS: '@connecto_admin_reports',
  FLAGGED_REVIEWS: '@connecto_flagged_reviews',
  ADMIN_ACTIONS: '@connecto_admin_actions',
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dealRequests } = useDeal();
  
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReview[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user !== null && (user.roles.includes('ADMIN') || ADMIN_USER_IDS.includes(user.id));
  
  const isAdminUser = (userId: string) => {
    return ADMIN_USER_IDS.includes(userId);
  };

  // Load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [suspended, reportsData, flagged, actions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SUSPENDED_USERS),
        AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
        AsyncStorage.getItem(STORAGE_KEYS.FLAGGED_REVIEWS),
        AsyncStorage.getItem(STORAGE_KEYS.ADMIN_ACTIONS),
      ]);

      if (suspended) setSuspendedUsers(JSON.parse(suspended));
      if (reportsData) setReports(JSON.parse(reportsData));
      if (flagged) setFlaggedReviews(JSON.parse(flagged));
      if (actions) setAdminActions(JSON.parse(actions));
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // User Suspension
  const suspendUser = async (userId: string, userName: string, reason: string, notes?: string) => {
    if (!isAdmin || !user) return;

    const suspension: SuspendedUser = {
      userId,
      userName,
      suspendedAt: Date.now(),
      suspendedBy: user.id,
      reason,
      notes,
    };

    const updated = [...suspendedUsers.filter(s => s.userId !== userId), suspension];
    setSuspendedUsers(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SUSPENDED_USERS, JSON.stringify(updated));

    // Log action
    await logAdminAction({
      action: 'SUSPEND_USER',
      targetId: userId,
      targetType: 'USER',
      reason,
      notes,
      metadata: { userName },
    });
  };

  const unsuspendUser = async (userId: string) => {
    if (!isAdmin || !user) return;

    const updated = suspendedUsers.filter(s => s.userId !== userId);
    setSuspendedUsers(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SUSPENDED_USERS, JSON.stringify(updated));

    // Log action
    await logAdminAction({
      action: 'UNSUSPEND_USER',
      targetId: userId,
      targetType: 'USER',
    });
  };

  const isUserSuspended = (userId: string): boolean => {
    return suspendedUsers.some(s => s.userId === userId);
  };

  // Reports
  const addReport = async (report: Omit<UserReport, 'id' | 'timestamp' | 'reviewed'>) => {
    const newReport: UserReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      reviewed: false,
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  };

  const markReportReviewed = async (reportId: string, actionTaken?: string) => {
    if (!isAdmin || !user) return;

    const updated = reports.map(r =>
      r.id === reportId
        ? { ...r, reviewed: true, reviewedBy: user.id, reviewedAt: Date.now(), actionTaken }
        : r
    );
    setReports(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));

    // Log action
    await logAdminAction({
      action: 'RESOLVE_REPORT',
      targetId: reportId,
      targetType: 'REPORT',
      notes: actionTaken,
    });
  };

  const getUnreviewedReportsCount = () => {
    return reports.filter(r => !r.reviewed).length;
  };

  // Review Moderation
  const flagReview = async (review: Omit<FlaggedReview, 'id' | 'flaggedAt' | 'flaggedBy' | 'hidden'>) => {
    if (!isAdmin || !user) return;

    const flagged: FlaggedReview = {
      ...review,
      id: `flagged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      flaggedAt: Date.now(),
      flaggedBy: user.id,
      hidden: true,
    };

    const updated = [flagged, ...flaggedReviews];
    setFlaggedReviews(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FLAGGED_REVIEWS, JSON.stringify(updated));

    // Log action
    await logAdminAction({
      action: 'FLAG_REVIEW',
      targetId: review.dealId,
      targetType: 'REVIEW',
      reason: review.flagReason,
    });
  };

  const unflagReview = async (flaggedReviewId: string) => {
    if (!isAdmin || !user) return;

    const updated = flaggedReviews.map(f =>
      f.id === flaggedReviewId ? { ...f, hidden: false } : f
    );
    setFlaggedReviews(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FLAGGED_REVIEWS, JSON.stringify(updated));

    // Log action
    await logAdminAction({
      action: 'UNFLAG_REVIEW',
      targetId: flaggedReviewId,
      targetType: 'REVIEW',
    });
  };

  const isReviewFlagged = (dealId: string): boolean => {
    return flaggedReviews.some(f => f.dealId === dealId && f.hidden);
  };

  // Admin Actions Log
  const logAdminAction = async (action: Omit<AdminAction, 'id' | 'timestamp' | 'adminId' | 'adminName'>) => {
    if (!user) return;

    const adminAction: AdminAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adminId: user.id,
      adminName: user.name,
      timestamp: Date.now(),
    };

    const updated = [adminAction, ...adminActions];
    setAdminActions(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_ACTIONS, JSON.stringify(updated));
  };

  // Admin Stats
  const getAdminStats = () => {
    // Mock user counts (in real app, would query database)
    const mockTotalUsers = 150;
    const mockTotalWorkers = 85;
    const mockTotalCustomers = 65;

    const activeDeals = dealRequests.filter(d => d.status === 'ACCEPTED' && d.workStatus !== 'COMPLETED').length;
    const completedDeals = dealRequests.filter(d => d.status === 'ACCEPTED' && d.workStatus === 'COMPLETED').length;

    return {
      totalUsers: mockTotalUsers,
      totalWorkers: mockTotalWorkers,
      totalCustomers: mockTotalCustomers,
      activeDeals,
      completedDeals,
      suspendedUsersCount: suspendedUsers.length,
      unreviewedReports: getUnreviewedReportsCount(),
      flaggedReviewsCount: flaggedReviews.filter(f => f.hidden).length,
    };
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isAdminUser,
        suspendedUsers,
        suspendUser,
        unsuspendUser,
        isUserSuspended,
        reports,
        addReport,
        markReportReviewed,
        getUnreviewedReportsCount,
        flaggedReviews,
        flagReview,
        unflagReview,
        isReviewFlagged,
        adminActions,
        logAdminAction,
        getAdminStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
