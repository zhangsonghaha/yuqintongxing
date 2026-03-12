-- 测试本周统计查询
-- 请将 user_id = 37 替换为你的实际用户ID

-- 1. 查看当前日期和本周一
SELECT 
    CURDATE() as today,
    WEEKDAY(CURDATE()) as weekday_number,
    DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) as this_monday;

-- 2. 查看你的所有打卡记录
SELECT 
    check_in_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record
WHERE user_id = 37
AND deleted_at IS NULL
ORDER BY check_in_date DESC;

-- 3. 测试本周打卡次数查询
SELECT COUNT(*) as weekly_checkins
FROM check_in_record 
WHERE user_id = 37
AND deleted_at IS NULL
AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
AND check_in_date <= CURDATE();

-- 4. 测试本周运动时长
SELECT COALESCE(SUM(duration), 0) as weekly_duration
FROM check_in_record 
WHERE user_id = 37
AND deleted_at IS NULL
AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
AND check_in_date <= CURDATE();

-- 5. 测试本周消耗卡路里
SELECT COALESCE(SUM(calories), 0) as weekly_calories
FROM check_in_record 
WHERE user_id = 37
AND deleted_at IS NULL
AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
AND check_in_date <= CURDATE();

-- 6. 测试今日打卡查询
SELECT *
FROM check_in_record 
WHERE user_id = 37
AND DATE(check_in_date) = DATE(CURDATE())
AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;
