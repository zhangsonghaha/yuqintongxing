-- 调试打卡统计问题的SQL

-- 1. 查看所有打卡记录
SELECT 
    record_id,
    user_id,
    check_in_date,
    DATE(check_in_date) as date_only,
    exercise_type,
    duration,
    calories,
    created_at,
    deleted_at
FROM check_in_record
WHERE deleted_at IS NULL
ORDER BY check_in_date DESC, created_at DESC
LIMIT 10;

-- 2. 查看今天的打卡记录
SELECT 
    record_id,
    user_id,
    check_in_date,
    DATE(check_in_date) as date_only,
    CURDATE() as today,
    DATE(check_in_date) = CURDATE() as is_today,
    exercise_type,
    duration,
    calories
FROM check_in_record
WHERE deleted_at IS NULL
AND DATE(check_in_date) = CURDATE();

-- 3. 查看本周的打卡记录
SELECT 
    record_id,
    user_id,
    check_in_date,
    YEARWEEK(check_in_date, 1) as record_week,
    YEARWEEK(CURDATE(), 1) as current_week,
    exercise_type,
    duration,
    calories
FROM check_in_record
WHERE deleted_at IS NULL
AND YEARWEEK(check_in_date, 1) = YEARWEEK(CURDATE(), 1);

-- 4. 统计本周数据
SELECT 
    user_id,
    COUNT(*) as weekly_checkins,
    SUM(duration) as weekly_duration,
    SUM(calories) as weekly_calories
FROM check_in_record
WHERE deleted_at IS NULL
AND YEARWEEK(check_in_date, 1) = YEARWEEK(CURDATE(), 1)
GROUP BY user_id;

-- 5. 检查check_in_date字段的数据类型
DESCRIBE check_in_record;
