import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType =
  | 'NEW_REQUEST'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_WAITLISTED'
  | 'REQUEST_REJECTED'
  | 'STATUS_UPDATE'
  | 'REVIEW_RECEIVED';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedDealId?: string;
  read: boolean;
  createdAt: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  getUnreadCount: (userId: string) => number;
  getNotificationsForUser: (userId: string) => NotificationItem[];
  clearNotifications: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = '@connecto_notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications from AsyncStorage on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (notifs: NotificationItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: Date.now(),
    };

    // Optimistic update
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );

    // Optimistic update
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = async (userId: string) => {
    const updatedNotifications = notifications.map(notif =>
      notif.userId === userId ? { ...notif, read: true } : notif
    );

    // Optimistic update
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const getUnreadCount = (userId: string) => {
    return notifications.filter(notif => notif.userId === userId && !notif.read).length;
  };

  const getNotificationsForUser = (userId: string) => {
    return notifications
      .filter(notif => notif.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt); // Most recent first
  };

  const clearNotifications = async (userId: string) => {
    const updatedNotifications = notifications.filter(notif => notif.userId !== userId);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUnreadCount,
        getNotificationsForUser,
        clearNotifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
