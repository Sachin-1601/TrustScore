-- TrustScore Production SQL DDL Schema
-- Compatible with PostgreSQL 14+ / Supabase

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'BUSINESS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  bio TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Australia',
  platform TEXT NOT NULL DEFAULT 'instagram',
  followers INT NOT NULL DEFAULT 0,
  following INT NOT NULL DEFAULT 0,
  total_posts INT NOT NULL DEFAULT 0,
  avg_likes INT NOT NULL DEFAULT 0,
  avg_comments INT NOT NULL DEFAULT 0,
  avg_views INT NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  starting_rate INT NOT NULL DEFAULT 300,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  verified_badge BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  data_coverage TEXT NOT NULL DEFAULT 'Good',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_scores (
  id TEXT PRIMARY KEY,
  creator_id TEXT REFERENCES creator_profiles(id) ON DELETE CASCADE,
  score INT NOT NULL,
  score_band TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  inflated_probability NUMERIC(5,2) NOT NULL,
  uncertainty_margin NUMERIC(4,2) NOT NULL DEFAULT 1.5,
  authenticity_probability NUMERIC(5,2) NOT NULL DEFAULT 95.0,
  comment_diversity_percent INT NOT NULL DEFAULT 85,
  growth_stability_score INT NOT NULL DEFAULT 90,
  consistency_score INT NOT NULL DEFAULT 90,
  volatility_index NUMERIC(5,2) NOT NULL DEFAULT 12.00,
  data_coverage TEXT NOT NULL DEFAULT 'Good',
  model_version TEXT NOT NULL DEFAULT 'v1.2',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT NOT NULL,
  is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  active_campaigns_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  budget NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  deliverables TEXT NOT NULL,
  target_min_trust_score INT NOT NULL DEFAULT 80,
  target_follower_range TEXT NOT NULL DEFAULT '10k-50k',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaborations (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES business_profiles(id) ON DELETE CASCADE,
  creator_id TEXT REFERENCES creator_profiles(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  campaign_name TEXT NOT NULL,
  campaign_description TEXT NOT NULL,
  budget NUMERIC(10,2) NOT NULL,
  deliverables TEXT NOT NULL,
  timeline TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  collaboration_id TEXT REFERENCES collaborations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS advertisements (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES business_profiles(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_text TEXT NOT NULL DEFAULT 'Sponsored',
  cta_text TEXT NOT NULL DEFAULT 'View Business',
  cta_link TEXT NOT NULL,
  placement TEXT NOT NULL DEFAULT 'left_sidebar',
  status TEXT NOT NULL DEFAULT 'Active',
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  creator_checks_remaining INT NOT NULL DEFAULT 50,
  creator_checks_limit INT NOT NULL DEFAULT 50,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_creator_username ON creator_profiles(username);
CREATE INDEX IF NOT EXISTS idx_creator_category ON creator_profiles(category);
CREATE INDEX IF NOT EXISTS idx_creator_followers ON creator_profiles(followers);
CREATE INDEX IF NOT EXISTS idx_trust_scores_creator ON trust_scores(creator_id, calculated_at);
CREATE INDEX IF NOT EXISTS idx_trust_scores_score ON trust_scores(score);
CREATE INDEX IF NOT EXISTS idx_business_slug ON business_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_collab_business ON collaborations(business_id);
CREATE INDEX IF NOT EXISTS idx_collab_creator ON collaborations(creator_id);
CREATE INDEX IF NOT EXISTS idx_ads_placement ON advertisements(placement, status);
