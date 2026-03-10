-- Migration V2: Goal Contributions System
-- Adds source_account_id to goals and creates goal_contributions table

-- ============================================================
-- 1. ALTER goals table — add source_account_id and description
-- ============================================================

-- Add description column (optional)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS description TEXT;

-- Add source_account_id (references the account where money is saved)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS source_account_id UUID;

-- Ensure name column exists (code uses it but may not be in original schema)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS name TEXT;

-- ============================================================
-- 2. CREATE goal_contributions table
-- ============================================================

CREATE TABLE IF NOT EXISTS goal_contributions (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(uuid) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    contributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),

    -- A transaction can only be linked to a goal once
    UNIQUE (goal_id, transaction_id)
);

-- Index for fast SUM aggregation per goal
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id
    ON goal_contributions(goal_id);

-- Index for checking total allocations per transaction
CREATE INDEX IF NOT EXISTS idx_goal_contributions_transaction_id
    ON goal_contributions(transaction_id);

-- ============================================================
-- 3. RLS Policies for goal_contributions
-- ============================================================

ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on goal_contributions"
    ON goal_contributions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Users can SELECT their own contributions (via goals join)
CREATE POLICY "Users can view own contributions"
    ON goal_contributions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.uuid = goal_contributions.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Users can INSERT contributions to their own goals
CREATE POLICY "Users can insert own contributions"
    ON goal_contributions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.uuid = goal_contributions.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Users can DELETE their own contributions
CREATE POLICY "Users can delete own contributions"
    ON goal_contributions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.uuid = goal_contributions.goal_id
            AND goals.user_id = auth.uid()
        )
    );
