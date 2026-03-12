-- 成就表 SQL 创建脚本
-- 用于存储用户解锁的成就徽章

CREATE TABLE IF NOT EXISTS achievement (
    achievement_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '成就ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    badge_type VARCHAR(50) NOT NULL COMMENT '徽章类型',
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
    UNIQUE KEY unique_achievement (user_id, badge_type) COMMENT '用户+徽章类型唯一索引',
    INDEX idx_user_id (user_id) COMMENT '用户ID索引',
    INDEX idx_badge_type (badge_type) COMMENT '徽章类型索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就表';

-- 徽章类型说明：
-- FIRST_CHECKIN: 首次打卡
-- STREAK_7: 连续打卡7天
-- STREAK_30: 连续打卡30天
-- TOTAL_100: 累计打卡100次
-- COUPLE_GOAL: 情侣共同目标（双方各打卡50次以上）
