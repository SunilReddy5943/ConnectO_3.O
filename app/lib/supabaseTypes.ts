/**
 * Supabase Database Types
 * These types match the PostgreSQL schema for ConnectO
 */

// Database Tables
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DbUser;
        Insert: DbUserInsert;
        Update: DbUserUpdate;
      };
      workers: {
        Row: DbWorker;
        Insert: DbWorkerInsert;
        Update: DbWorkerUpdate;
      };
      deal_requests: {
        Row: DbDealRequest;
        Insert: DbDealRequestInsert;
        Update: DbDealRequestUpdate;
      };
      reviews: {
        Row: DbReview;
        Insert: DbReviewInsert;
        Update: DbReviewUpdate;
      };
      notifications: {
        Row: DbNotification;
        Insert: DbNotificationInsert;
        Update: DbNotificationUpdate;
      };
    };
  };
}

// Users Table
export interface DbUser {
  id: string; // uuid
  phone: string; // unique
  name: string;
  roles: string[]; // text[]
  active_role: string;
  profile_photo_url?: string; // URL from Supabase Storage
  is_active: boolean;
  referral_code?: string;
  created_at: string; // timestamp
  updated_at?: string;
}

export type DbUserInsert = Omit<DbUser, 'id' | 'created_at' | 'updated_at'>;
export type DbUserUpdate = Partial<DbUserInsert>;

// Workers Table
export interface DbWorker {
  id: string; // uuid
  user_id: string; // fk → users.id
  category: string;
  experience_years: number;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  rating_average: number;
  rating_count: number;
  total_completed_works: number;
  hourly_rate?: number;
  bio?: string;
  skills: string[]; // text[]
  portfolio_urls: string[]; // URLs from Supabase Storage
  availability_status: 'AVAILABLE' | 'BUSY';
  created_at: string;
  updated_at?: string;
}

export type DbWorkerInsert = Omit<DbWorker, 'id' | 'created_at' | 'updated_at'>;
export type DbWorkerUpdate = Partial<DbWorkerInsert>;

// Deal Requests Table
export interface DbDealRequest {
  id: string; // uuid
  customer_id: string; // fk → users.id
  customer_name: string; // Denormalized for speed
  worker_id: string; // fk → workers.user_id
  worker_name: string; // Denormalized for speed
  problem_description: string;
  service_type: string;
  location_text: string;
  location_lat?: number;
  location_lng?: number;
  preferred_time?: string;
  proposed_price?: number;
  budget?: string;
  status: 'NEW' | 'ACCEPTED' | 'WAITLISTED' | 'REJECTED' | 'CANCELLED';
  work_status?: 'ACCEPTED' | 'ONGOING' | 'COMPLETED';
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  timestamp: number; // For app compatibility
}

export type DbDealRequestInsert = Omit<DbDealRequest, 'id' | 'created_at'>;
export type DbDealRequestUpdate = Partial<DbDealRequestInsert>;

// Reviews Table
export interface DbReview {
  id: string; // uuid
  deal_id: string; // fk → deal_requests.id
  customer_id: string; // fk → users.id
  worker_id: string; // fk → users.id
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

export type DbReviewInsert = Omit<DbReview, 'id' | 'created_at'>;
export type DbReviewUpdate = Partial<DbReviewInsert>;

// Notifications Table
export interface DbNotification {
  id: string; // uuid
  user_id: string; // fk → users.id
  title: string;
  message: string;
  type: 'DEAL_NEW' | 'DEAL_ACCEPTED' | 'DEAL_COMPLETED' | 'REVIEW_RECEIVED' | 'SYSTEM';
  related_deal_id?: string;
  related_user_id?: string;
  read: boolean;
  created_at: string;
}

export type DbNotificationInsert = Omit<DbNotification, 'id' | 'created_at'>;
export type DbNotificationUpdate = Partial<DbNotificationInsert>;

// Storage Buckets
export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  WORKER_PORTFOLIO: 'worker-portfolio',
  CHAT_MEDIA: 'chat-media',
} as const;

// Helper function to get public URL from storage
export function getPublicUrl(bucket: string, path: string): string {
  return `https://umyonopzgnzuzyhousur.supabase.co/storage/v1/object/public/${bucket}/${path}`;
}
