-- 创建互动表（点赞和评论）
CREATE TABLE IF NOT EXISTS `interaction` (
  `interaction_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '互动ID',
  `record_id` BIGINT(20) NOT NULL COMMENT '打卡记录ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `type` VARCHAR(20) NOT NULL COMMENT '互动类型：like-点赞, comment-评论',
  `content` TEXT COMMENT '评论内容（点赞时为空）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
  PRIMARY KEY (`interaction_id`),
  INDEX `idx_record_id` (`record_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='互动表（点赞和评论）';
