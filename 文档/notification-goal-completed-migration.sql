-- 修改通知表以支持目标完成通知
-- 目标完成通知不需要关联打卡记录，因此将 record_id 改为可空

ALTER TABLE `notification` 
MODIFY COLUMN `record_id` BIGINT(20) DEFAULT NULL COMMENT '关联的打卡记录ID（目标完成通知时为空）';

-- 更新 type 字段注释以包含新的通知类型
ALTER TABLE `notification` 
MODIFY COLUMN `type` VARCHAR(20) NOT NULL COMMENT '通知类型：like-点赞，comment-评论，goal_completed-目标完成';

-- 验证修改
DESCRIBE `notification`;
