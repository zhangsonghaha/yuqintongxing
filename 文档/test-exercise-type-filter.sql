-- 测试运动类型筛选功能
-- Test Exercise Type Filter Functionality

-- 1. 查询所有打卡记录（不筛选）
SELECT 
    check_in_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record
WHERE deleted_at IS NULL
ORDER BY check_in_date DESC, created_at DESC;

-- 2. 按运动类型筛选 - 跑步 (running)
SELECT 
    check_in_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record
WHERE deleted_at IS NULL
AND exercise_type = 'running'
ORDER BY check_in_date DESC, created_at DESC;

-- 3. 按运动类型筛选 - 健身 (fitness)
SELECT 
    check_in_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record
WHERE deleted_at IS NULL
AND exercise_type = 'fitness'
ORDER BY check_in_date DESC, created_at DESC;

-- 4. 按运动类型筛选 - 瑜伽 (yoga)
SELECT 
    check_in_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record
WHERE deleted_at IS NULL
AND exercise_type = 'yoga'
ORDER BY check_in_date DESC, created_at DESC;

-- 5. 组合筛选：运动类型 + 日期范围
SELECT 
    check_in_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record
WHERE deleted_at IS NULL
AND exercise_type = 'running'
AND DATE_FORMAT(check_in_date, '%Y-%m-%d') >= '2026-03-01'
AND DATE_FORMAT(check_in_date, '%Y-%m-%d') <= '2026-03-31'
ORDER BY check_in_date DESC, created_at DESC;

-- 6. 组合筛选：运动类型 + 用户ID
SELECT 
    check_in_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record
WHERE deleted_at IS NULL
AND user_id = 1
AND exercise_type = 'fitness'
ORDER BY check_in_date DESC, created_at DESC;

-- 7. 统计各运动类型的打卡次数
SELECT 
    exercise_type,
    COUNT(*) as count,
    SUM(duration) as total_duration,
    SUM(calories) as total_calories
FROM check_in_record
WHERE deleted_at IS NULL
GROUP BY exercise_type
ORDER BY count DESC;

-- 8. 统计特定用户各运动类型的打卡次数
SELECT 
    exercise_type,
    COUNT(*) as count,
    SUM(duration) as total_duration,
    SUM(calories) as total_calories
FROM check_in_record
WHERE deleted_at IS NULL
AND user_id = 1
GROUP BY exercise_type
ORDER BY count DESC;
