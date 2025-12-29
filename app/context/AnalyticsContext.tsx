import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useDeal, DealRequest } from './DealContext';

export interface WorkerAnalytics {
  // Request Metrics
  totalRequests: number;
  acceptedRequests: number;
  completedWorks: number;
  waitlistedRequests: number;
  rejectedRequests: number;

  // Performance Metrics
  acceptanceRate: number; // percentage
  completionRate: number; // percentage

  // Rating Metrics
  averageRating: number;
  totalReviews: number;

  // Earnings Metrics (Mock/Estimated)
  earningsToday: number;
  earningsLast7Days: number;
  earningsLast30Days: number;
  earningsLifetime: number;

  // Insights
  insights: string[];
}

interface AnalyticsContextType {
  getWorkerAnalytics: (workerId: string) => WorkerAnalytics;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Default earnings per completed work (if budget not specified)
const DEFAULT_EARNINGS_PER_WORK = 2500;

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { getDealRequestsForWorker, getWorkerRating } = useDeal();

  const getWorkerAnalytics = (workerId: string): WorkerAnalytics => {
    const deals = getDealRequestsForWorker(workerId);
    const rating = getWorkerRating(workerId);

    // Calculate request metrics
    const totalRequests = deals.length;
    const acceptedRequests = deals.filter(d => d.status === 'ACCEPTED').length;
    const completedWorks = deals.filter(
      d => d.status === 'ACCEPTED' && d.workStatus === 'COMPLETED'
    ).length;
    const waitlistedRequests = deals.filter(d => d.status === 'WAITLISTED').length;
    const rejectedRequests = deals.filter(d => d.status === 'REJECTED').length;

    // Calculate performance rates
    const acceptanceRate = totalRequests > 0 
      ? Math.round((acceptedRequests / totalRequests) * 100) 
      : 0;
    const completionRate = acceptedRequests > 0 
      ? Math.round((completedWorks / acceptedRequests) * 100) 
      : 0;

    // Calculate earnings by time period
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const completedDeals = deals.filter(
      d => d.status === 'ACCEPTED' && d.workStatus === 'COMPLETED' && d.completedAt
    );

    const earningsToday = completedDeals
      .filter(d => d.completedAt! >= oneDayAgo)
      .reduce((sum, d) => sum + parseEarnings(d.budget), 0);

    const earningsLast7Days = completedDeals
      .filter(d => d.completedAt! >= sevenDaysAgo)
      .reduce((sum, d) => sum + parseEarnings(d.budget), 0);

    const earningsLast30Days = completedDeals
      .filter(d => d.completedAt! >= thirtyDaysAgo)
      .reduce((sum, d) => sum + parseEarnings(d.budget), 0);

    const earningsLifetime = completedDeals
      .reduce((sum, d) => sum + parseEarnings(d.budget), 0);

    // Generate insights
    const insights = generateInsights({
      acceptanceRate,
      completionRate,
      averageRating: rating.averageRating,
      completedWorks,
      totalReviews: rating.totalReviews,
    });

    return {
      totalRequests,
      acceptedRequests,
      completedWorks,
      waitlistedRequests,
      rejectedRequests,
      acceptanceRate,
      completionRate,
      averageRating: rating.averageRating,
      totalReviews: rating.totalReviews,
      earningsToday,
      earningsLast7Days,
      earningsLast30Days,
      earningsLifetime,
      insights,
    };
  };

  return (
    <AnalyticsContext.Provider value={{ getWorkerAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Helper: Parse earnings from budget string
function parseEarnings(budget?: string): number {
  if (!budget) return DEFAULT_EARNINGS_PER_WORK;

  // Extract number from budget string (e.g., "₹2000 - ₹3000" -> use average)
  const numbers = budget.match(/\d+/g);
  if (!numbers || numbers.length === 0) return DEFAULT_EARNINGS_PER_WORK;

  if (numbers.length === 1) {
    return parseInt(numbers[0], 10);
  }

  // If range, use average
  const min = parseInt(numbers[0], 10);
  const max = parseInt(numbers[1], 10);
  return Math.round((min + max) / 2);
}

// Generate insights based on metrics
function generateInsights(metrics: {
  acceptanceRate: number;
  completionRate: number;
  averageRating: number;
  completedWorks: number;
  totalReviews: number;
}): string[] {
  const insights: string[] = [];

  // Acceptance rate insights
  if (metrics.acceptanceRate >= 80) {
    insights.push('✅ Excellent acceptance rate! Keep it up.');
  } else if (metrics.acceptanceRate >= 60) {
    insights.push('💡 Good acceptance rate. Try to accept more requests to grow your business.');
  } else if (metrics.acceptanceRate > 0) {
    insights.push('⚠️ Low acceptance rate. Accepting more requests can boost your earnings.');
  }

  // Completion rate insights
  if (metrics.completionRate === 100 && metrics.completedWorks > 0) {
    insights.push('🌟 Perfect completion rate! Your reliability is outstanding.');
  } else if (metrics.completionRate >= 90) {
    insights.push('✅ Great completion rate! Customers trust you.');
  } else if (metrics.completionRate >= 70) {
    insights.push('💡 Good completion rate. Complete more works to improve your reputation.');
  } else if (metrics.completionRate > 0) {
    insights.push('⚠️ Work on completing accepted jobs to improve your rating.');
  }

  // Rating insights
  if (metrics.averageRating >= 4.5 && metrics.totalReviews > 0) {
    insights.push('⭐ Outstanding reviews! Your quality work is appreciated.');
  } else if (metrics.averageRating >= 4.0 && metrics.totalReviews > 0) {
    insights.push('👍 Good reviews! Keep delivering quality work.');
  } else if (metrics.averageRating > 0 && metrics.totalReviews > 0) {
    insights.push('💡 Focus on customer satisfaction to improve your ratings.');
  }

  // Review count insights
  if (metrics.totalReviews === 0 && metrics.completedWorks > 0) {
    insights.push('📝 Encourage customers to leave reviews to boost your profile.');
  }

  // Work count insights
  if (metrics.completedWorks === 0) {
    insights.push('🚀 Complete your first job to start building your reputation!');
  } else if (metrics.completedWorks < 5) {
    insights.push('🎯 Keep completing jobs to establish yourself in the market.');
  } else if (metrics.completedWorks >= 10) {
    insights.push('🏆 You\'re building a strong work history!');
  }

  // If no insights, add a default
  if (insights.length === 0) {
    insights.push('👋 Start accepting requests to grow your business.');
  }

  return insights;
}
