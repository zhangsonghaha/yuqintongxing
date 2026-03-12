-- 目标管理表
-- 用于存储用户的周目标和月目标设置

CREATE TABLE IF NOT EXISTS `goal` (
  `goal_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '目标ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `goal_type` VARCHAR(20) NOT NULL COMMENT '目标类型：weekly-周目标, monthly-月目标',
  `target_value` INT(11) NOT NULL COMMENT '目标值（周目标：次数，月目标：分钟数）',
  `current_value` INT(11) DEFAULT 0 COMMENT '当前完成值',
  `start_date` DATE NOT NULL COMMENT '目标开始日期',
  `end_date` DATE NOT NULL COMMENT '目标结束日期',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '目标状态：active-进行中, completed-已完成, expired-已过期',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
  PRIMARY KEY (`goal_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goal_type` (`goal_type`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='目标管理表';

-- 插入示例数据（可选）
-- 用户1的周目标：每周打卡3次
INSERT INTO `goal` (`user_id`, `goal_type`, `target_value`, `current_value`, `start_date`, `end_date`, `status`)
VALUES (1, 'weekly', 3, 2, '2026-03-10', '2026-03-16', 'active');

-- 用户1的月目标：每月运动600分钟
INSERT INTO `goal` (`user_id`, `goal_type`, `target_value`, `current_value`, `start_date`, `end_date`, `status`)
VALUES (1, 'monthly', 600, 246, '2026-03-01', '2026-03-31', 'active');

-- 查询验证
SELECT * FROM `goal` WHERE `user_id` = 1 AND `deleted_at` IS NULL;
