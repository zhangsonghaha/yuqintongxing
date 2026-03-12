-- 测试日历页面日期筛选功能
-- 用于验证数据库中的打卡记录和日期筛选逻辑

-- 1. 查看所有打卡记录（最近10条）
SELECT 
  check_in_id,
  user_id,
  check_in_date,
  DATE(check_in_date) as date_only,
  exercise_type,
  duration,
  calories,
  created_at
FROM check_in_record 
WHERE deleted_at IS NULL
ORDER BY check_in_date DESC, created_at DESC
LIMIT 10;

-- 2. 查看 3月11日 的打卡记录
SELECT 
  check_in_id,
  user_id,
  check_in_date,
  DATE(check_in_date) as date_only,
  exercise_type,
  duration,
  calories,
  created_at
FROM check_in_record 
WHERE DATE(check_in_date) = '2026-03-11'
AND deleted_at IS NULL
ORDER BY created_at DESC;

-- 3. 查看 3月12日 的打卡记录
SELECT 
  check_in_id,
  user_id,
  check_in_date,
  DATE(check_in_date) as date_only,
  exercise_type,
  duration,
  calories,
  created_at
FROM check_in_record 
WHERE DATE(check_in_date) = '2026-03-12'
AND deleted_at IS NULL
ORDER BY created_at DESC;

-- 4. 测试日期范围筛选（模拟后端查询）
-- 这个查询应该只返回 3月11日 的记录
SELECT 
  check_in_id,
  user_id,
  check_in_date,
  DATE(check_in_date) as date_only,
  exercise_type,
  duration,
  calories,
  created_at
FROM check_in_record 
WHERE DATE(check_in_date) >= DATE('2026-03-11')
AND DATE(check_in_date) <= DATE('2026-03-11')
AND deleted_at IS NULL
ORDER BY check_in_date DESC, created_at DESC;

-- 5. 检查 check_in_date 字段的数据类型和格式
SELECT 
  check_in_id,
  check_in_date,
  DATE(check_in_date) as date_only,
  TIME(check_in_date) as time_only,
  YEAR(check_in_date) as year,
  MONTH(check_in_date) as month,
  DAY(check_in_date) as day
FROM check_in_record 
WHERE deleted_at IS NULL
ORDER BY check_in_date DESC
LIMIT 5;

-- 6. 查看 3月份的所有打卡记录
SELECT 
  check_in_id,
  user_id,
  DATE(check_in_date) as date_only,
  exercise_type,
  duration,
  created_at
FROM check_in_record 
WHERE YEAR(check_in_date) = 2026
AND MONTH(check_in_date) = 3
AND deleted_at IS NULL
ORDER BY check_in_date DESC, created_at DESC;

-- 7. 统计每天的打卡次数
SELECT 
  DATE(check_in_date) as date,
  COUNT(*) as count
FROM check_in_record 
WHERE YEAR(check_in_date) = 2026
AND MONTH(check_in_date) = 3
AND deleted_at IS NULL
GROUP BY DATE(check_in_date)
ORDER BY date DESC;
