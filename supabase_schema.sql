-- =============================================
-- ConnectO Database Schema - Supabase PostgreSQL
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',
  active_role TEXT NOT NULL DEFAULT 'CUSTOMER',
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- =============================================
-- 2. WORKERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address TEXT,
  rating_average DECIMAL(3, 2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  total_completed_works INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10, 2),
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  portfolio_urls TEXT[] DEFAULT '{}',
  availability_status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for worker search
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_category ON workers(category);
CREATE INDEX IF NOT EXISTS idx_workers_location ON workers(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_workers_rating ON workers(rating_average DESC);

-- =============================================
-- 3. DEAL REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS deal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  service_type TEXT NOT NULL,
  location_text TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  preferred_time TEXT,
  proposed_price DECIMAL(10, 2),
  budget TEXT,
  status TEXT DEFAULT 'NEW',
  work_status TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timestamp BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- Indexes for deal queries
CREATE INDEX IF NOT EXISTS idx_deals_customer ON deal_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_worker ON deal_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deal_requests(status);
CREATE INDEX IF NOT EXISTS idx_deals_created ON deal_requests(created_at DESC);

-- =============================================
-- 4. REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deal_requests(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deal_id)
);

-- Indexes for review queries
CREATE INDEX IF NOT EXISTS idx_reviews_worker ON reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_deal ON reviews(deal_id);

-- =============================================
-- 5. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_deal_id UUID,
  related_user_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: Can read and update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true); -- Public read for discovery

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their data" ON users
  FOR INSERT WITH CHECK (true);

-- Workers: Public read, only owner can update
CREATE POLICY "Workers are publicly viewable" ON workers
  FOR SELECT USING (true);

CREATE POLICY "Workers can update own profile" ON workers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Workers can insert their profile" ON workers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deal Requests: Users can see their own deals
CREATE POLICY "Users can view their deals" ON deal_requests
  FOR SELECT USING (
    customer_id = auth.uid() OR worker_id = auth.uid()
  );

CREATE POLICY "Customers can create deals" ON deal_requests
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their deals" ON deal_requests
  FOR UPDATE USING (
    customer_id = auth.uid() OR worker_id = auth.uid()
  );

-- Reviews: Public read, customer can create
CREATE POLICY "Reviews are publicly viewable" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- 7. STORAGE BUCKETS
-- =============================================
-- Run these in Supabase Dashboard → Storage:
-- 1. Create bucket: profile-photos (public)
-- 2. Create bucket: worker-portfolio (public)
-- 3. Create bucket: chat-media (public)

-- =============================================
-- 8. TRIGGERS FOR AUTO-UPDATE
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to workers table
CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 9. FUNCTION TO RECALCULATE WORKER RATING
-- =============================================
CREATE OR REPLACE FUNCTION recalculate_worker_rating(p_worker_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE workers
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0.0)
      FROM reviews
      WHERE worker_id = p_worker_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE worker_id = p_worker_id
    )
  WHERE user_id = p_worker_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-recalculate rating after review
CREATE OR REPLACE FUNCTION trigger_recalculate_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_worker_rating(NEW.worker_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_worker_rating();

-- =============================================
-- SETUP COMPLETE
-- =============================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create storage buckets in Supabase Dashboard
-- 3. Test with app integration
