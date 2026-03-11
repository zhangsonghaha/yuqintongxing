-- Test SQL for date range filtering functionality
-- This verifies the date range filter implementation in CheckInMapper.xml

-- Setup: Insert test data
INSERT INTO check_in_record (user_id, check_in_date, exercise_type, duration, calories, created_at, updated_at)
VALUES 
  (1, '2026-03-01', 'running', 30, 200, NOW(), NOW()),
  (1, '2026-03-05', 'fitness', 45, 300, NOW(), NOW()),
  (1, '2026-03-10', 'yoga', 60, 150, NOW(), NOW()),
  (1, '2026-03-15', 'running', 30, 200, NOW(), NOW()),
  (1, '2026-03-20', 'fitness', 45, 300, NOW(), NOW());

-- Test 1: Filter with beginTime only (should return records >= 2026-03-10)
SELECT * FROM check_in_record 
WHERE user_id = 1 
  AND deleted_at IS NULL
  AND DATE_FORMAT(check_in_date, '%Y-%m-%d') >= DATE_FORMAT('2026-03-10', '%Y-%m-%d')
ORDER BY check_in_date DESC;
-- Expected: 3 records (2026-03-10, 2026-03-15, 2026-03-20)

-- Test 2: Filter with endTime only (should return records <= 2026-03-10)
SELECT * FROM check_in_record 
WHERE user_id = 1 
  AND deleted_at IS NULL
  AND DATE_FORMAT(check_in_date, '%Y-%m-%d') <= DATE_FORMAT('2026-03-10', '%Y-%m-%d')
ORDER BY check_in_date DESC;
-- Expected: 3 records (2026-03-01, 2026-03-05, 2026-03-10)

-- Test 3: Filter with both beginTime and endTime (should return records between dates)
SELECT * FROM check_in_record 
WHERE user_id = 1 
  AND deleted_at IS NULL
  AND DATE_FORMAT(check_in_date, '%Y-%m-%d') >= DATE_FORMAT('2026-03-05', '%Y-%m-%d')
  AND DATE_FORMAT(check_in_date, '%Y-%m-%d') <= DATE_FORMAT('2026-03-15', '%Y-%m-%d')
ORDER BY check_in_date DESC;
-- Expected: 3 records (2026-03-05, 2026-03-10, 2026-03-15)

-- Test 4: No date filter (should return all records)
SELECT * FROM check_in_record 
WHERE user_id = 1 
  AND deleted_at IS NULL
ORDER BY check_in_date DESC;
-- Expected: 5 records (all)

-- Cleanup
DELETE FROM check_in_record WHERE user_id = 1 AND check_in_date BETWEEN '2026-03-01' AND '2026-03-20';
