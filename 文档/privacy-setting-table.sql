-- 隐私设置表
CREATE TABLE IF NOT EXISTS `privacy_setting` (
  `setting_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `allow_partner_view_checkins` TINYINT(1) DEFAULT 1 COMMENT '是否允许伴侣查看打卡记录：0-否，1-是',
  `allow_partner_view_stats` TINYINT(1) DEFAULT 1 COMMENT '是否允许伴侣查看统计数据：0-否，1-是',
  `allow_partner_view_achievements` TINYINT(1) DEFAULT 1 COMMENT '是否允许伴侣查看成就：0-否，1-是',
  `data_share_scope` INT(1) DEFAULT 1 COMMENT '数据共享范围：0-仅自己，1-仅伴侣，2-公开',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='隐私设置表';

-- 为现有用户创建默认隐私设置
INSERT INTO privacy_setting (user_id, allow_partner_view_checkins, allow_partner_view_stats, 
    allow_partner_view_achievements, data_share_scope)
SELECT user_id, 1, 1, 1, 1
FROM couple_user
WHERE NOT EXISTS (
    SELECT 1 FROM privacy_setting WHERE privacy_setting.user_id = couple_user.user_id
);
