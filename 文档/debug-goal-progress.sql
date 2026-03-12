-- 调试目标进度问题
-- 检查打卡记录和目标数据

-- 1. 查看最近的打卡记录
SELECT 
    check_in_id,
    user_id,
    exercise_type,
    duration,
    check_in_date,
    created_at,
    deleted_at
FROM check_in_record
ORDER BY created_at DESC
LIMIT 10;

-- 2. 查看本周打卡次数（使用与后端相同的SQL）
SELECT 
    user_id,
    COUNT(*) as weekly_checkins
FROM check_in_record 
WHERE deleted_at IS NULL
AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
AND check_in_date <= CURDATE()
GROUP BY user_id;

-- 3. 查看本月运动时长（使用与后端相同的SQL）
SELECT 
    user_id,
    COALESCE(SUM(duration), 0) as monthly_duration
FROM check_in_record 
WHERE deleted_at IS NULL
AND YEAR(check_in_date) = YEAR(CURDATE())
AND MONTH(check_in_date) = MONTH(CURDATE())
GROUP BY user_id;

-- 4. 查看当前活跃的目标
SELECT 
    goal_id,
    user_id,
    goal_type,
    target_value,
    current_value,
    start_date,
    end_date,
    status,
    completed_at,
    created_at
FROM goal
WHERE status = 'active'
ORDER BY created_at DESC;

-- 5. 检查今天的日期和本周范围
SELECT 
    CURDATE() as today,
    DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) as week_start,
    WEEKDAY(CURDATE()) as weekday_number;

-- 6. 检查check_in_date字段类型
DESCRIBE check_in_record;
