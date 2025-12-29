import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../context/AdminContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// Mock user data (in real app, would fetch from database)
interface MockUser {
  id: string;
  name: string;
  phone: string;
  roles: ('WORKER' | 'CUSTOMER' | 'ADMIN')[];
  verificationLevel: 'NONE' | 'PHONE' | 'BASIC' | 'VERIFIED';
  joinedAt: number;
  profilePhoto?: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'user-001',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    roles: ['WORKER'],
    verificationLevel: 'VERIFIED',
    joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'user-002',
    name: 'Priya Sharma',
    phone: '+91 98765 43211',
    roles: ['CUSTOMER'],
    verificationLevel: 'BASIC',
    joinedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'user-003',
    name: 'Amit Singh',
    phone: '+91 98765 43212',
    roles: ['WORKER', 'CUSTOMER'],
    verificationLevel: 'VERIFIED',
    joinedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'user-004',
    name: 'Sneha Patel',
    phone: '+91 98765 43213',
    roles: ['CUSTOMER'],
    verificationLevel: 'PHONE',
    joinedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
];

export default function UserManagement() {
  const router = useRouter();
  const { suspendedUsers, suspendUser, unsuspendUser, isUserSuspended } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'WORKER' | 'CUSTOMER'>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'BASIC' | 'PHONE' | 'NONE'>('ALL');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendNotes, setSuspendNotes] = useState('');

  // Filter users
  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || user.roles.includes(roleFilter);
    const matchesVerification =
      verificationFilter === 'ALL' || user.verificationLevel === verificationFilter;

    return matchesSearch && matchesRole && matchesVerification;
  });

  const handleSuspendUser = () => {
    if (!selectedUser || !suspendReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for suspension');
      return;
    }

    Alert.alert(
      'Confirm Suspension',
      `Are you sure you want to suspend ${selectedUser.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            await suspendUser(selectedUser.id, selectedUser.name, suspendReason, suspendNotes);
            setShowSuspendModal(false);
            setSuspendReason('');
            setSuspendNotes('');
            setSelectedUser(null);
            Alert.alert('Success', 'User has been suspended');
          },
        },
      ]
    );
  };

  const handleUnsuspendUser = (user: MockUser) => {
    Alert.alert(
      'Confirm Unsuspension',
      `Are you sure you want to unsuspend ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsuspend',
          onPress: async () => {
            await unsuspendUser(user.id);
            Alert.alert('Success', 'User has been unsuspended');
          },
        },
      ]
    );
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'VERIFIED':
        return COLORS.success;
      case 'BASIC':
        return COLORS.info;
      case 'PHONE':
        return COLORS.warning;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>{filteredUsers.length} users</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {/* Role Filter */}
        {(['ALL', 'WORKER', 'CUSTOMER'] as const).map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.filterChip, roleFilter === role && styles.filterChipActive]}
            onPress={() => setRoleFilter(role)}
          >
            <Text
              style={[
                styles.filterChipText,
                roleFilter === role && styles.filterChipTextActive,
              ]}
            >
              {role}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.filterDivider} />

        {/* Verification Filter */}
        {(['ALL', 'VERIFIED', 'BASIC', 'PHONE', 'NONE'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterChip,
              verificationFilter === level && styles.filterChipActive,
            ]}
            onPress={() => setVerificationFilter(level)}
          >
            <Text
              style={[
                styles.filterChipText,
                verificationFilter === level && styles.filterChipTextActive,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User List */}
      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {filteredUsers.map((user) => {
          const isSuspended = isUserSuspended(user.id);
          return (
            <View key={user.id} style={[styles.userCard, isSuspended && styles.userCardSuspended]}>
              <View style={styles.userHeader}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {isSuspended && (
                      <View style={styles.suspendedBadge}>
                        <Text style={styles.suspendedBadgeText}>SUSPENDED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                  <View style={styles.userMeta}>
                    {user.roles.map((role) => (
                      <View key={role} style={styles.roleTag}>
                        <Text style={styles.roleTagText}>{role}</Text>
                      </View>
                    ))}
                    <View
                      style={[
                        styles.verificationBadge,
                        { backgroundColor: getVerificationColor(user.verificationLevel) + '15' },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color={getVerificationColor(user.verificationLevel)}
                      />
                      <Text
                        style={[
                          styles.verificationText,
                          { color: getVerificationColor(user.verificationLevel) },
                        ]}
                      >
                        {user.verificationLevel}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.userActions}>
                {isSuspended ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.unsuspendButton]}
                    onPress={() => handleUnsuspendUser(user)}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.unsuspendButtonText}>Unsuspend</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.suspendButton]}
                    onPress={() => {
                      setSelectedUser(user);
                      setShowSuspendModal(true);
                    }}
                  >
                    <Ionicons name="ban" size={16} color={COLORS.error} />
                    <Text style={styles.suspendButtonText}>Suspend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Suspend Modal */}
      <Modal
        visible={showSuspendModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuspendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suspend User</Text>
            <Text style={styles.modalSubtitle}>
              Suspending: {selectedUser?.name}
            </Text>

            <Text style={styles.inputLabel}>Reason *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter suspension reason..."
              value={suspendReason}
              onChangeText={setSuspendReason}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Additional Notes</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional notes..."
              value={suspendNotes}
              onChangeText={setSuspendNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                  setSuspendNotes('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSuspendUser}
              >
                <Text style={styles.modalButtonConfirmText}>Suspend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  userList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  userCardSuspended: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  userHeader: {
    flexDirection: 'row',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  suspendedBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.xs,
  },
  suspendedBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  roleTag: {
    backgroundColor: COLORS.info + '15',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  roleTagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.info,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  verificationText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  suspendButton: {
    backgroundColor: COLORS.error + '15',
  },
  suspendButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  unsuspendButton: {
    backgroundColor: COLORS.success + '15',
  },
  unsuspendButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonCancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.error,
  },
  modalButtonConfirmText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
