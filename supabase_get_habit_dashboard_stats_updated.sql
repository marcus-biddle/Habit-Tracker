-- Updated get_habit_dashboard_stats function
-- This function calculates dashboard statistics for habits, accounting for the new metric system
-- with tracking_type, goal_period, and other enhanced fields

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_habit_dashboard_stats(UUID);

CREATE OR REPLACE FUNCTION get_habit_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  habit_id UUID,
  habit_name VARCHAR,
  is_public BOOLEAN,
  join_count INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  today_value NUMERIC,
  week_completion NUMERIC,
  period_total NUMERIC,
  last_entry_date DATE
) AS $$
BEGIN
  RETURN QUERY
  WITH habit_goals AS (
    -- Get active habits with their goals and tracking info
    SELECT 
      h.id as habit_id,
      h.name as habit_name,
      h.goal,
      COALESCE(h.tracking_type, 'count') as tracking_type,
      COALESCE(h.goal_period, 'per_day') as goal_period,
      -- For binary habits, goal is always 1
      CASE 
        WHEN COALESCE(h.tracking_type, 'count') = 'binary' THEN 1
        ELSE COALESCE(h.goal, 1)
      END as effective_goal
    FROM habits h
    WHERE h.user_id = p_user_id
      AND h.status = 'active'
      AND h.is_archived = false
  ),
  daily_sums AS (
    -- Get daily sums for all habits
    SELECT 
      he.habit_id,
      he.entry_date,
      SUM(he.value)::NUMERIC as daily_value
    FROM habit_entries he
    INNER JOIN habit_goals hg ON he.habit_id = hg.habit_id
    WHERE he.user_id = p_user_id
    GROUP BY he.habit_id, he.entry_date
  ),
  today_values AS (
    -- Get today's values
    SELECT 
      hg.habit_id,
      COALESCE(ds.daily_value, 0)::NUMERIC as today_value
    FROM habit_goals hg
    LEFT JOIN daily_sums ds 
      ON ds.habit_id = hg.habit_id 
      AND ds.entry_date = CURRENT_DATE
  ),
  goal_achievements AS (
    -- Determine if goal was met for each day
    SELECT 
      hg.habit_id,
      ds.entry_date,
      hg.tracking_type,
      hg.goal_period,
      hg.effective_goal,
      ds.daily_value,
      CASE 
        -- Binary habits: completed if value >= 1
        WHEN hg.tracking_type = 'binary' THEN
          CASE WHEN COALESCE(ds.daily_value, 0) >= 1 THEN 1 ELSE 0 END
        -- Daily goals: check daily value
        WHEN hg.goal_period = 'per_day' THEN
          CASE WHEN COALESCE(ds.daily_value, 0) >= hg.effective_goal THEN 1 ELSE 0 END
        -- Weekly goals: check weekly sum
        WHEN hg.goal_period = 'per_week' THEN
          CASE 
            WHEN (
              SELECT COALESCE(SUM(ds2.daily_value), 0)
              FROM daily_sums ds2
              WHERE ds2.habit_id = hg.habit_id
                AND ds2.entry_date >= DATE_TRUNC('week', ds.entry_date)
                AND ds2.entry_date <= ds.entry_date
            ) >= hg.effective_goal THEN 1 
            ELSE 0 
          END
        -- Monthly goals: check monthly sum
        WHEN hg.goal_period = 'per_month' THEN
          CASE 
            WHEN (
              SELECT COALESCE(SUM(ds2.daily_value), 0)
              FROM daily_sums ds2
              WHERE ds2.habit_id = hg.habit_id
                AND ds2.entry_date >= DATE_TRUNC('month', ds.entry_date)
                AND ds2.entry_date <= ds.entry_date
            ) >= hg.effective_goal THEN 1 
            ELSE 0 
          END
        -- Default: daily check
        ELSE
          CASE WHEN COALESCE(ds.daily_value, 0) >= hg.effective_goal THEN 1 ELSE 0 END
      END as goal_met
    FROM habit_goals hg
    LEFT JOIN daily_sums ds ON ds.habit_id = hg.habit_id
    WHERE ds.entry_date IS NOT NULL
  ),
  streak_groups AS (
    -- Group consecutive days where goal was met
    SELECT 
      ga.habit_id,
      ga.entry_date,
      ga.goal_met,
      SUM(CASE WHEN ga.goal_met = 0 THEN 1 ELSE 0 END) OVER (
        PARTITION BY ga.habit_id 
        ORDER BY ga.entry_date
      ) as streak_group_id
    FROM goal_achievements ga
  ),
  streak_lengths AS (
    -- Calculate streak lengths
    SELECT 
      sg.habit_id,
      sg.streak_group_id,
      MIN(sg.entry_date) as streak_start,
      MAX(sg.entry_date) as streak_end,
      COUNT(*) as streak_length
    FROM streak_groups sg
    WHERE sg.goal_met = 1
    GROUP BY sg.habit_id, sg.streak_group_id
  ),
  current_streaks AS (
    -- Get current streak (most recent streak that includes today or yesterday)
    SELECT 
      sl.habit_id,
      COALESCE(MAX(sl.streak_length), 0) as current_streak
    FROM streak_lengths sl
    WHERE sl.streak_end >= CURRENT_DATE - INTERVAL '1 day'
    GROUP BY sl.habit_id
  ),
  longest_streaks AS (
    -- Get longest streak ever
    SELECT 
      sl.habit_id,
      COALESCE(MAX(sl.streak_length), 0) as longest_streak
    FROM streak_lengths sl
    GROUP BY sl.habit_id
  ),
  week_completions AS (
    -- Calculate week completion percentage
    SELECT 
      hg.habit_id,
      CASE 
        -- For weekly goals: percentage of weekly goal achieved
        WHEN hg.goal_period = 'per_week' THEN
          CASE 
            WHEN hg.effective_goal > 0 THEN
              LEAST(100, ROUND(
                COALESCE((
                  SELECT SUM(ds.daily_value)::NUMERIC
                  FROM daily_sums ds
                  WHERE ds.habit_id = hg.habit_id
                    AND ds.entry_date >= DATE_TRUNC('week', CURRENT_DATE)
                    AND ds.entry_date <= CURRENT_DATE
                ), 0)::NUMERIC / hg.effective_goal * 100, 2
              ))
            ELSE 0
          END
        -- For monthly goals: percentage of monthly goal achieved
        WHEN hg.goal_period = 'per_month' THEN
          CASE 
            WHEN hg.effective_goal > 0 THEN
              LEAST(100, ROUND(
                COALESCE((
                  SELECT SUM(ds.daily_value)::NUMERIC
                  FROM daily_sums ds
                  WHERE ds.habit_id = hg.habit_id
                    AND ds.entry_date >= DATE_TRUNC('month', CURRENT_DATE)
                    AND ds.entry_date <= CURRENT_DATE
                ), 0)::NUMERIC / hg.effective_goal * 100, 2
              ))
            ELSE 0
          END
        -- For daily goals: percentage of days this week that met goal
        ELSE
          CASE 
            WHEN hg.effective_goal > 0 THEN
              ROUND(
                COALESCE((
                  SELECT COUNT(*) * 100.0 / 7
                  FROM daily_sums ds
                  WHERE ds.habit_id = hg.habit_id
                    AND ds.entry_date >= DATE_TRUNC('week', CURRENT_DATE)
                    AND ds.entry_date <= CURRENT_DATE
                    AND (
                      CASE 
                        WHEN hg.tracking_type = 'binary' THEN ds.daily_value >= 1
                        ELSE ds.daily_value >= hg.effective_goal
                      END
                    )
                ), 0), 2
              )
            ELSE 0
          END
      END as week_completion
    FROM habit_goals hg
  ),
  period_totals AS (
    -- Calculate period totals for weekly/monthly habits directly from habit_entries
    SELECT 
      hg.habit_id,
      CASE 
        -- For weekly goals: sum of values from start of week to today
        WHEN hg.goal_period = 'per_week' THEN
          COALESCE((
            SELECT SUM(he_inner.value)::NUMERIC
            FROM habit_entries he_inner
            WHERE he_inner.habit_id = hg.habit_id
              AND he_inner.user_id = p_user_id
              AND he_inner.entry_date >= DATE_TRUNC('week', CURRENT_DATE)
              AND he_inner.entry_date <= CURRENT_DATE
          ), 0)::NUMERIC
        -- For monthly goals: sum of values from start of month to today
        WHEN hg.goal_period = 'per_month' THEN
          COALESCE((
            SELECT SUM(he_inner.value)::NUMERIC
            FROM habit_entries he_inner
            WHERE he_inner.habit_id = hg.habit_id
              AND he_inner.user_id = p_user_id
              AND he_inner.entry_date >= DATE_TRUNC('month', CURRENT_DATE)
              AND he_inner.entry_date <= CURRENT_DATE
          ), 0)::NUMERIC
        -- For daily goals: use today's value
        ELSE
          COALESCE((
            SELECT SUM(he_inner.value)::NUMERIC
            FROM habit_entries he_inner
            WHERE he_inner.habit_id = hg.habit_id
              AND he_inner.user_id = p_user_id
              AND he_inner.entry_date = CURRENT_DATE
          ), 0)::NUMERIC
      END as period_total
    FROM habit_goals hg
  ),
  last_entry_dates AS (
    -- Get last entry date
    SELECT 
      ds.habit_id,
      MAX(ds.entry_date) as last_entry_date
    FROM daily_sums ds
    GROUP BY ds.habit_id
  )
  SELECT 
    hg.habit_id,
    hg.habit_name,
    false as is_public,  -- Update this if you have a public_habits table
    0 as join_count,      -- Update this if you track join counts
    COALESCE(cs.current_streak, 0)::INTEGER as current_streak,
    COALESCE(ls.longest_streak, 0)::INTEGER as longest_streak,
    COALESCE(tv.today_value, 0)::NUMERIC as today_value,
    COALESCE(wc.week_completion, 0)::NUMERIC as week_completion,
    COALESCE(pt.period_total, 0)::NUMERIC as period_total,
    led.last_entry_date
  FROM habit_goals hg
  LEFT JOIN today_values tv ON tv.habit_id = hg.habit_id
  LEFT JOIN current_streaks cs ON cs.habit_id = hg.habit_id
  LEFT JOIN longest_streaks ls ON ls.habit_id = hg.habit_id
  LEFT JOIN week_completions wc ON wc.habit_id = hg.habit_id
  LEFT JOIN period_totals pt ON pt.habit_id = hg.habit_id
  LEFT JOIN last_entry_dates led ON led.habit_id = hg.habit_id
  ORDER BY hg.habit_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_habit_dashboard_stats(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_habit_dashboard_stats(UUID) IS 
'Calculates dashboard statistics for habits with enhanced metric system support. Handles tracking_type (binary, count, duration, etc.), goal_period (per_day, per_week, per_month), and calculates streaks and completion rates accordingly.';
