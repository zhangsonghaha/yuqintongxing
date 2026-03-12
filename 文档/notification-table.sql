-- 创建通知表
CREATE TABLE `notification` (
  `notification_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '接收通知的用户ID',
  `from_user_id` BIGINT(20) NOT NULL COMMENT '触发通知的用户ID',
  `type` VARCHAR(20) NOT NULL COMMENT '通知类型：like-点赞，comment-评论',
  `record_id` BIGINT(20) NOT NULL COMMENT '关联的打卡记录ID',
  `content` VARCHAR(500) DEFAULT NULL COMMENT '通知内容（评论内容）',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `read_at` DATETIME DEFAULT NULL COMMENT '阅读时间',
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';
