-- 调试点赞显示问题的SQL脚本

-- 1. 查看所有打卡记录
SELECT 
    record_id,
    user_id,
    check_in_date,
    exercise_type,
    duration,
    created_at
FROM check_in_record
ORDER BY created_at DESC
LIMIT 10;

-- 2. 查看所有点赞记录
SELECT 
    interaction_id,
    record_id,
    user_id AS '点赞用户ID',
    type,
    created_at
FROM interaction
WHERE type = 'like'
ORDER BY created_at DESC;

-- 3. 查看特定打卡记录的点赞情况（替换 {recordId} 为实际的记录ID）
-- 从截图看，用户8260的打卡记录应该有1个点赞
SELECT 
    i.interaction_id,
    i.record_id AS '打卡记录ID',
    i.user_id AS '点赞用户ID',
    u.nickname AS '点赞用户昵称',
    c.user_id AS '打卡记录所有者ID',
    i.created_at AS '点赞时间'
FROM interaction i
LEFT JOIN couple_user u ON i.user_id = u.user_id
LEFT JOIN check_in_record c ON i.record_id = c.record_id
WHERE i.record_id = {recordId}  -- 替换为实际的记录ID
  AND i.type = 'like';

-- 4. 统计每条打卡记录的点赞数
SELECT 
    c.record_id,
    c.user_id AS '打卡用户ID',
    u.nickname AS '打卡用户昵称',
    c.check_in_date,
    COUNT(i.interaction_id) AS '点赞数'
FROM check_in_record c
LEFT JOIN interaction i ON c.record_id = i.record_id AND i.type = 'like'
LEFT JOIN couple_user u ON c.user_id = u.user_id
GROUP BY c.record_id, c.user_id, u.nickname, c.check_in_date
ORDER BY c.created_at DESC
LIMIT 10;

-- 5. 检查是否有用户给自己点赞的情况（不应该存在）
SELECT 
    i.interaction_id,
    i.record_id,
    i.user_id AS '点赞用户ID',
    c.user_id AS '打卡记录所有者ID',
    '自己给自己点赞' AS '问题'
FROM interaction i
JOIN check_in_record c ON i.record_id = c.record_id
WHERE i.type = 'like'
  AND i.user_id = c.user_id;

-- 6. 查看用户8260的打卡记录及其点赞情况
SELECT 
    c.record_id,
    c.user_id AS '打卡用户ID',
    c.check_in_date,
    c.exercise_type,
    COUNT(i.interaction_id) AS '点赞数',
    GROUP_CONCAT(i.user_id) AS '点赞用户ID列表'
FROM check_in_record c
LEFT JOIN interaction i ON c.record_id = i.record_id AND i.type = 'like'
WHERE c.user_id = 8260  -- 用户8260
GROUP BY c.record_id, c.user_id, c.check_in_date, c.exercise_type
ORDER BY c.created_at DESC;

-- 7. 检查特定用户是否给特定记录点过赞
-- 例如：检查用户4342是否给用户8260的某条记录点过赞
SELECT 
    i.interaction_id,
    i.record_id,
    i.user_id AS '点赞用户ID',
    c.user_id AS '打卡记录所有者ID',
    i.created_at AS '点赞时间'
FROM interaction i
JOIN check_in_record c ON i.record_id = c.record_id
WHERE i.type = 'like'
  AND i.record_id = {recordId}  -- 替换为实际的记录ID
  AND i.user_id = {userId};     -- 替换为点赞用户ID

-- 8. 查看所有用户信息
SELECT 
    user_id,
    username,
    nickname,
    created_at
FROM couple_user
ORDER BY created_at DESC;

-- 9. 查看配对关系
SELECT 
    partnership_id,
    user_id AS '用户1',
    partner_id AS '用户2',
    status,
    created_at
FROM partnership
WHERE status = 'accepted';

-- 10. 完整的打卡记录信息（包含点赞和评论统计）
SELECT 
    c.record_id,
    c.user_id,
    u.nickname AS '用户昵称',
    c.check_in_date,
    c.exercise_type,
    c.duration,
    (SELECT COUNT(*) FROM interaction WHERE record_id = c.record_id AND type = 'like') AS '点赞数',
    (SELECT COUNT(*) FROM interaction WHERE record_id = c.record_id AND type = 'comment') AS '评论数',
    c.created_at
FROM check_in_record c
LEFT JOIN couple_user u ON c.user_id = u.user_id
ORDER BY c.created_at DESC
LIMIT 10;
