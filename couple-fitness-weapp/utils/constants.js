/**
 * 常量定义
 */

// 运动类型
const EXERCISE_TYPES = {
  GYM: { id: 1, name: '健身房', icon: '🏋️' },
  RUNNING: { id: 2, name: '跑步', icon: '🏃' },
  YOGA: { id: 3, name: '瑜伽', icon: '🧘' },
  CYCLING: { id: 4, name: '骑行', icon: '🚴' },
  SWIMMING: { id: 5, name: '游泳', icon: '🏊' },
  WALKING: { id: 6, name: '散步', icon: '🚶' },
  DANCING: { id: 7, name: '舞蹈', icon: '💃' },
  OTHER: { id: 8, name: '其他', icon: '⚽' }
};

// 打卡状态
const CHECK_IN_STATUS = {
  CHECKED_IN: 'checked_in',      // 已打卡
  NOT_CHECKED_IN: 'not_checked_in' // 未打卡
};

// 等级配置
const LEVEL_CONFIG = {
  1: { name: '新手', minExp: 0, maxExp: 100 },
  2: { name: '初级', minExp: 100, maxExp: 300 },
  3: { name: '中级', minExp: 300, maxExp: 600 },
  4: { name: '高级', minExp: 600, maxExp: 1000 },
  5: { name: '专家', minExp: 1000, maxExp: 1500 },
  6: { name: '大师', minExp: 1500, maxExp: 2000 }
};

// 成就类型
const ACHIEVEMENT_TYPES = {
  FIRST_CHECK_IN: 'first_check_in',           // 首次打卡
  CONSECUTIVE_7: 'consecutive_7',             // 连续打卡 7 天
  CONSECUTIVE_30: 'consecutive_30',           // 连续打卡 30 天
  CONSECUTIVE_100: 'consecutive_100',         // 连续打卡 100 天
  TOTAL_100: 'total_100',                     // 累计打卡 100 次
  TOTAL_500: 'total_500',                     // 累计打卡 500 次
  PARTNER_SYNC: 'partner_sync',               // 情侣同步打卡
  LEVEL_UP: 'level_up'                        // 等级提升
};

// API 错误码
const ERROR_CODES = {
  SUCCESS: 0,
  INVALID_PARAMS: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// 消息类型
const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  SYSTEM: 'system'
};

module.exports = {
  EXERCISE_TYPES,
  CHECK_IN_STATUS,
  LEVEL_CONFIG,
  ACHIEVEMENT_TYPES,
  ERROR_CODES,
  MESSAGE_TYPES
};
