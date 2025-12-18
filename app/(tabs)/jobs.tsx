import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, CATEGORIES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  budget_min: number;
  budget_max: number;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: 'URGENT' | 'NORMAL' | 'FLEXIBLE';
  applications_count: number;
  created_at: string;
}

interface Work {
  id: string;
  title: string;
  description: string;
  category: string;
  client_name: string;
  client_photo?: string;
  city: string;
  location: string;
  payment: number;
  status: 'NEW_REQUEST' | 'ACCEPTED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  urgency: 'URGENT' | 'NORMAL' | 'FLEXIBLE';
  created_at: string;
  scheduled_date?: string;
  completion_date?: string;
  rating?: number;
  review?: string;
  attachments?: string[];
}

const DUMMY_JOBS: Job[] = [
  {
    id: '1',
    title: 'Bathroom Plumbing Repair',
    description: 'Need to fix a leaking pipe in the bathroom. Water is dripping from under the sink.',
    category: 'Plumber',
    city: 'Mumbai',
    budget_min: 500,
    budget_max: 1500,
    status: 'OPEN',
    urgency: 'URGENT',
    applications_count: 5,
    created_at: '2025-12-11T10:00:00Z',
  },
  {
    id: '2',
    title: 'Electrical Wiring for New Room',
    description: 'Need complete electrical wiring for a newly constructed room including switches and lights.',
    category: 'Electrician',
    city: 'Mumbai',
    budget_min: 3000,
    budget_max: 5000,
    status: 'ASSIGNED',
    urgency: 'NORMAL',
    applications_count: 12,
    created_at: '2025-12-10T14:30:00Z',
  },
  {
    id: '3',
    title: 'Kitchen Cabinet Installation',
    description: 'Looking for a carpenter to install modular kitchen cabinets. Materials will be provided.',
    category: 'Carpenter',
    city: 'Delhi',
    budget_min: 8000,
    budget_max: 12000,
    status: 'IN_PROGRESS',
    urgency: 'FLEXIBLE',
    applications_count: 8,
    created_at: '2025-12-09T09:15:00Z',
  },
  {
    id: '4',
    title: 'AC Service and Gas Refill',
    description: 'Split AC not cooling properly. Need servicing and possibly gas refilling.',
    category: 'AC Technician',
    city: 'Bangalore',
    budget_min: 1000,
    budget_max: 2500,
    status: 'COMPLETED',
    urgency: 'NORMAL',
    applications_count: 3,
    created_at: '2025-12-08T16:45:00Z',
  },
];

const DUMMY_WORKS: Work[] = [
  {
    id: 'w1',
    title: 'Bathroom Plumbing Repair',
    description: 'Fix leaking pipe in the bathroom. Water is dripping from under the sink.',
    category: 'Plumber',
    client_name: 'Rajesh Sharma',
    client_photo: 'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517902391_581fbe64.jpg',
    city: 'Mumbai',
    location: 'Andheri West, Mumbai',
    payment: 1200,
    status: 'NEW_REQUEST',
    urgency: 'URGENT',
    created_at: '2025-12-17T10:00:00Z',
    scheduled_date: '2025-12-18T10:00:00Z',
  },
  {
    id: 'w2',
    title: 'Electrical Wiring for New Room',
    description: 'Complete electrical wiring needed for newly constructed room including switches and lights.',
    category: 'Electrician',
    client_name: 'Priya Patel',
    client_photo: 'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517906698_8f08fe5c.png',
    city: 'Mumbai',
    location: 'Bandra East, Mumbai',
    payment: 4000,
    status: 'ONGOING',
    urgency: 'NORMAL',
    created_at: '2025-12-16T14:30:00Z',
    scheduled_date: '2025-12-17T09:00:00Z',
  },
  {
    id: 'w3',
    title: 'Kitchen Cabinet Installation',
    description: 'Install modular kitchen cabinets. All materials are provided by the client.',
    category: 'Carpenter',
    client_name: 'Amit Kumar',
    city: 'Mumbai',
    location: 'Powai, Mumbai',
    payment: 10000,
    status: 'COMPLETED',
    urgency: 'FLEXIBLE',
    created_at: '2025-12-10T09:15:00Z',
    scheduled_date: '2025-12-12T10:00:00Z',
    completion_date: '2025-12-14T16:00:00Z',
    rating: 5,
    review: 'Excellent work! Very professional and completed on time.',
  },
  {
    id: 'w4',
    title: 'AC Service and Gas Refill',
    description: 'Split AC not cooling properly. Need servicing and possibly gas refilling.',
    category: 'AC Technician',
    client_name: 'Sneha Reddy',
    city: 'Mumbai',
    location: 'Goregaon West, Mumbai',
    payment: 1800,
    status: 'COMPLETED',
    urgency: 'NORMAL',
    created_at: '2025-12-08T16:45:00Z',
    scheduled_date: '2025-12-09T11:00:00Z',
    completion_date: '2025-12-09T13:30:00Z',
    rating: 4,
    review: 'Good work. AC is cooling well now.',
  },
  {
    id: 'w5',
    title: 'House Painting - 2BHK',
    description: 'Need painting for entire 2BHK apartment. Client will provide paint materials.',
    category: 'Painter',
    client_name: 'Vikram Singh',
    city: 'Mumbai',
    location: 'Malad West, Mumbai',
    payment: 8500,
    status: 'ACCEPTED',
    urgency: 'NORMAL',
    created_at: '2025-12-15T12:00:00Z',
    scheduled_date: '2025-12-20T09:00:00Z',
  },
  {
    id: 'w6',
    title: 'Washing Machine Repair',
    description: 'Washing machine is making loud noise and not spinning properly.',
    category: 'Appliance Repair',
    client_name: 'Anjali Desai',
    city: 'Mumbai',
    location: 'Kandivali East, Mumbai',
    payment: 600,
    status: 'CANCELLED',
    urgency: 'URGENT',
    created_at: '2025-12-11T08:30:00Z',
  },
];

export default function JobsScreen() {
  const router = useRouter();
  const { isAuthenticated, user, activeRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'new' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [jobs, setJobs] = useState(DUMMY_JOBS);
  const [works, setWorks] = useState(DUMMY_WORKS);

  const isWorkerMode = activeRole === 'WORKER';

  // Filter works based on active tab for worker mode
  const filteredWorks = works.filter(work => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return work.status === 'NEW_REQUEST';
    if (activeTab === 'ongoing') return work.status === 'ONGOING' || work.status === 'ACCEPTED';
    if (activeTab === 'completed') return work.status === 'COMPLETED';
    if (activeTab === 'cancelled') return work.status === 'CANCELLED';
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleCreateJob = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/job/create');
  };

  const handleJobPress = (jobId: string) => {
    router.push({
      pathname: '/job/[id]',
      params: { id: jobId },
    });
  };

  const getStatusColor = (status: Job['status'] | Work['status']) => {
    switch (status) {
      case 'OPEN':
      case 'NEW_REQUEST':
        return COLORS.success;
      case 'ASSIGNED':
      case 'ACCEPTED':
        return COLORS.info;
      case 'IN_PROGRESS':
      case 'ONGOING':
        return COLORS.warning;
      case 'COMPLETED':
        return COLORS.primary;
      case 'CANCELLED':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  const getUrgencyStyle = (urgency: Job['urgency']) => {
    switch (urgency) {
      case 'URGENT':
        return { backgroundColor: COLORS.error + '15', color: COLORS.error };
      case 'NORMAL':
        return { backgroundColor: COLORS.info + '15', color: COLORS.info };
      case 'FLEXIBLE':
        return { backgroundColor: COLORS.success + '15', color: COLORS.success };
      default:
        return { backgroundColor: COLORS.borderLight, color: COLORS.textMuted };
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.name === category);
    return cat?.icon || 'construct';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const urgencyStyle = getUrgencyStyle(item.urgency);
    
    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => handleJobPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.jobHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: COLORS.primary + '15' }]}>
            <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={COLORS.primary} />
          </View>
          <View style={styles.jobHeaderInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.jobMeta}>
              <Text style={styles.jobCategory}>{item.category}</Text>
              <View style={styles.dot} />
              <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.jobCity}>{item.city}</Text>
            </View>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyStyle.backgroundColor }]}>
            <Text style={[styles.urgencyText, { color: urgencyStyle.color }]}>{item.urgency}</Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>

        <View style={styles.jobFooter}>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>₹{item.budget_min} - ₹{item.budget_max}</Text>
          </View>
          <View style={styles.jobStats}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statText}>{item.applications_count} applied</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statText}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderWorkCard = ({ item }: { item: Work }) => {
    const urgencyStyle = getUrgencyStyle(item.urgency);
    
    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => handleJobPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.jobHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: COLORS.secondary + '15' }]}>
            <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={COLORS.secondary} />
          </View>
          <View style={styles.jobHeaderInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.jobMeta}>
              <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.jobCategory}>{item.client_name}</Text>
              <View style={styles.dot} />
              <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.jobCity}>{item.city}</Text>
            </View>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyStyle.backgroundColor }]}>
            <Text style={[styles.urgencyText, { color: urgencyStyle.color }]}>{item.urgency}</Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>

        <View style={styles.jobFooter}>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Payment</Text>
            <Text style={styles.budgetValue}>₹{item.payment.toLocaleString()}</Text>
          </View>
          <View style={styles.jobStats}>
            {item.scheduled_date && (
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.statText}>{formatDate(item.scheduled_date)}</Text>
              </View>
            )}
            {item.rating && (
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.statText}>{item.rating}/5</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{isWorkerMode ? 'Works' : 'Jobs'}</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateJob}>
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.createButtonText}>{isWorkerMode ? 'Post Work' : 'Post Job'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => {
    if (isWorkerMode) {
      return (
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.tabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All Works</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'new' && styles.tabActive]}
              onPress={() => setActiveTab('new')}
            >
              <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>New Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
              onPress={() => setActiveTab('ongoing')}
            >
              <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>Ongoing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
              onPress={() => setActiveTab('completed')}
            >
              <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Completed</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }
    
    return (
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>My Jobs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    // Worker mode empty states
    if (isWorkerMode) {
      if (activeTab === 'new') {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-open-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No New Requests</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any new work requests at the moment.
              Check back later or explore jobs near you.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.emptyButtonText}>Find Jobs Near You</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      if (activeTab === 'ongoing') {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Ongoing Works</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any works in progress.
              Accept new requests to get started.
            </Text>
          </View>
        );
      }
      
      if (activeTab === 'completed') {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Completed Works</Text>
            <Text style={styles.emptySubtitle}>
              Your completed works will appear here.
              Complete ongoing works to build your reputation.
            </Text>
          </View>
        );
      }
      
      // All works empty
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="hammer-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Works Available</Text>
          <Text style={styles.emptySubtitle}>
            You don't have any work requests yet.
            Make sure you're available to receive new requests.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.emptyButtonText}>Find Jobs Near You</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Customer mode empty states
    if (activeTab === 'my') {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Posted Jobs</Text>
          <Text style={styles.emptySubtitle}>
            You haven't posted any jobs yet.
            Post your first job to get started.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleCreateJob}>
            <Text style={styles.emptyButtonText}>Post Your First Job</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // All jobs empty
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>No Jobs Found</Text>
        <Text style={styles.emptySubtitle}>
          No jobs available at the moment.
          Try posting a job or check back later.
        </Text>
      </View>
    );
  };

  const filteredJobs = activeTab === 'my' ? [] : jobs;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderTabs()}
      
      <FlatList
        data={isWorkerMode ? filteredWorks : filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={isWorkerMode ? renderWorkCard : renderJobCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  createButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.base,
    flexGrow: 1,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  jobTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  jobCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  jobCity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  urgencyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  urgencyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  budgetContainer: {},
  budgetLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  budgetValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  jobStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});
