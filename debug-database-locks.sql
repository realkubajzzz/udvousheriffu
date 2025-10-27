-- Debug database locks and performance issues
-- Run this in Supabase SQL Editor if you experience timeouts

-- 1. Check for long-running queries
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state = 'active';

-- 2. Check for locks on cms_actions table
SELECT 
  t.relname,
  l.locktype,
  l.mode,
  l.granted,
  a.query
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
JOIN pg_class t ON l.relation = t.oid
WHERE t.relname = 'cms_actions'
AND NOT l.granted;

-- 3. Check table size and analyze cms_actions
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables 
WHERE tablename = 'cms_actions';

-- 4. If you have admin access, you can kill long-running queries:
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 'PROBLEMATIC_PID';

-- 5. Refresh table statistics (if allowed)
-- ANALYZE cms_actions;