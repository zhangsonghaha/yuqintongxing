-- 用户提醒设置表
CREATE TABLE IF NOT EXISTS `user_reminder_setting` (
  `setting_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `exercise_reminder_enabled` TINYINT(1) DEFAULT 0 COMMENT '是否启用运动提醒：0-否，1-是',
  `reminder_time` VARCHAR(5) DEFAULT '20:00' COMMENT '提醒时间（格式：HH:mm）',
  `like_notification_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用点赞通知：0-否，1-是',
  `comment_notification_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用评论通知：0-否，1-是',
  `goal_notification_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用目标完成通知：0-否，1-是',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_reminder_time` (`reminder_time`, `exercise_reminder_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户提醒设置表';

-- 插入默认设置（为现有用户创建默认设置）
INSERT INTO user_reminder_setting (user_id, exercise_reminder_enabled, reminder_time, 
    like_notification_enabled, comment_notification_enabled, goal_notification_enabled)
SELECT user_id, 0, '20:00', 1, 1, 1
FROM couple_user
WHERE NOT EXISTS (
    SELECT 1 FROM user_reminder_setting WHERE user_reminder_setting.user_id = couple_user.user_id
);
