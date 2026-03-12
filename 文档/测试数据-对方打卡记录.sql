-- 测试数据：对方打卡记录功能
-- 用于测试查看对方打卡记录的功能

-- 说明：
-- 假设用户A的ID是100，用户B的ID是101
-- 他们已经配对
-- 以下SQL为用户B创建一些测试打卡记录

-- 1. 清理旧的测试数据（可选）
-- DELETE FROM check_in_record WHERE user_id = 101;
-- DELETE FROM interaction WHERE record_id IN (SELECT record_id FROM check_in_record WHERE user_id = 101);

-- 2. 为用户B插入今天的打卡记录
INSERT INTO check_in_record (
    user_id, 
    check_in_date, 
    exercise_type, 
    duration, 
    calories, 
    photo_url,
    created_at,
    updated_at
)
VALUES (
    101,                    -- 用户B的ID
    CURDATE(),              -- 今天
    'running',              -- 跑步
    30,                     -- 30分钟
    300,                    -- 300卡路里
    NULL,                   -- 无照片
    NOW(),
    NOW()
);

-- 3. 为用户B插入昨天的打卡记录
INSERT INTO check_in_record (
    user_id, 
    check_in_date, 
    exercise_type, 
    duration, 
    calories, 
    photo_url,
    created_at,
    updated_at
)
VALUES (
    101,
    DATE_SUB(CURDATE(), INTERVAL 1 DAY),  -- 昨天
    'gym',                                 -- 健身房
    60,                                    -- 60分钟
    500,                                   -- 500卡路里
    NULL,
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- 4. 为用户B插入前天的打卡记录
INSERT INTO check_in_record (
    user_id, 
    check_in_date, 
    exercise_type, 
    duration, 
    calories, 
    photo_url,
    created_at,
    updated_at
)
VALUES (
    101,
    DATE_SUB(CURDATE(), INTERVAL 2 DAY),  -- 前天
    'yoga',                                -- 瑜伽
    45,                                    -- 45分钟
    200,                                   -- 200卡路里
    NULL,
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY)
);

-- 5. 为用户B插入3天前的打卡记录
INSERT INTO check_in_record (
    user_id, 
    check_in_date, 
    exercise_type, 
    duration, 
    calories, 
    photo_url,
    created_at,
    updated_at
)
VALUES (
    101,
    DATE_SUB(CURDATE(), INTERVAL 3 DAY),
    'strength',                            -- 力量训练
    50,
    400,
    NULL,
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- 6. 为用户B插入4天前的打卡记录
INSERT INTO check_in_record (
    user_id, 
    check_in_date, 
    exercise_type, 
    duration, 
    calories, 
    photo_url,
    created_at,
    updated_at
)
VALUES (
    101,
    DATE_SUB(CURDATE(), INTERVAL 4 DAY),
    'outdoor',                             -- 户外运动
    90,
    600,
    NULL,
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    DATE_SUB(NOW(), INTERVAL 4 DAY)
);

-- 7. 为用户B插入5天前的打卡记录
INSERT INTO check_in_record (
    user_id, 
    check_in_date, 
    exercise_type, 
    duration, 
    calories, 
    photo_url,
    created_at,
    updated_at
)
VALUES (
    101,
    DATE_SUB(CURDATE(), INTERVAL 5 DAY),
    'home',                                -- 居家运动
    40,
    250,
    NULL,
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY)
);

-- 8. 为某些记录添加点赞（用户A给用户B的记录点赞）
-- 获取最新的3条记录ID并添加点赞
INSERT INTO interaction (record_id, user_id, interaction_type, created_at)
SELECT record_id, 100, 'like', NOW()
FROM check_in_record 
WHERE user_id = 101 
ORDER BY created_at DESC 
LIMIT 3;

-- 9. 为某些记录添加评论（用户A给用户B的记录评论）
INSERT INTO interaction (record_id, user_id, interaction_type, content, created_at)
SELECT record_id, 100, 'comment', '加油！坚持下去！', NOW()
FROM check_in_record 
WHERE user_id = 101 
ORDER BY created_at DESC 
LIMIT 1;

INSERT INTO interaction (record_id, user_id, interaction_type, content, created_at)
SELECT record_id, 100, 'comment', '今天表现不错哦~', NOW()
FROM check_in_record 
WHERE user_id = 101 
ORDER BY created_at DESC 
LIMIT 1 OFFSET 1;

-- 10. 查询验证数据
-- 查看用户B的所有打卡记录
SELECT 
    record_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    calories,
    created_at
FROM check_in_record 
WHERE user_id = 101 
ORDER BY check_in_date DESC;

-- 查看用户B的打卡记录的互动数据
SELECT 
    cr.record_id,
    cr.check_in_date,
    cr.exercise_type,
    COUNT(CASE WHEN i.interaction_type = 'like' THEN 1 END) as like_count,
    COUNT(CASE WHEN i.interaction_type = 'comment' THEN 1 END) as comment_count
FROM check_in_record cr
LEFT JOIN interaction i ON cr.record_id = i.record_id
WHERE cr.user_id = 101
GROUP BY cr.record_id, cr.check_in_date, cr.exercise_type
ORDER BY cr.check_in_date DESC;

-- 11. 测试API查询（模拟后端查询）
-- 分页查询用户B的打卡记录（第1页，每页10条）
SELECT * FROM check_in_record
WHERE user_id = 101 AND deleted_at IS NULL
ORDER BY check_in_date DESC, created_at DESC
LIMIT 10 OFFSET 0;

-- 12. 清理测试数据（测试完成后执行）
-- DELETE FROM interaction WHERE record_id IN (SELECT record_id FROM check_in_record WHERE user_id = 101);
-- DELETE FROM check_in_record WHERE user_id = 101;
