/**
 * API 调用
 */

var request = require('./request');

// API 基础地址
const BASE_URL = 'http://localhost:8080';

// 认证相关 API
var authAPI = {
  wechatLogin: '/api/auth/wechat-login',
  refreshToken: '/api/auth/refresh-token'
};

// 用户相关 API
var userAPI = {
  login: function(code) {
    return request.post('/user/login', { code: code });
  },
  
  getUserInfo: function() {
    return request.get('/user/info');
  },
  
  updateUserInfo: function(data) {
    return request.put('/user/info', data);
  },
  
  pair: function(inviteCode) {
    return request.post('/user/pair', { inviteCode: inviteCode });
  },
  
  generateInviteCode: function() {
    return request.post('/user/invite-code');
  },
  
  getPartnerInfo: function() {
    return request.get('/user/partner');
  }
};

// 打卡相关 API
var checkInAPI = {
  checkIn: function(data) {
    return request.post('/api/checkin/add', data);
  },
  
  getCheckInRecords: function(params) {
    // 将参数对象转换为 URL 查询字符串
    let queryString = '';
    if (params) {
      const queryParams = [];
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
          queryParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
      }
      if (queryParams.length > 0) {
        queryString = '?' + queryParams.join('&');
      }
    }
    return request.get('/api/checkin/list' + queryString);
  },
  
  getCheckInRecordsByUserId: function(userId, params) {
    // 获取指定用户的打卡记录（用于查看伴侣的打卡记录）
    let queryString = '';
    if (params) {
      const queryParams = [];
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
          queryParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
      }
      if (queryParams.length > 0) {
        queryString = '?' + queryParams.join('&');
      }
    }
    return request.get('/api/checkin/user/' + userId + queryString);
  },
  
  getStatistics: function() {
    return request.get('/api/checkin/statistics/user');
  },
  
  getPartnerStatistics: function() {
    return request.get('/api/checkin/statistics/partner');
  },
  
  getTodayStatus: function() {
    return request.get('/api/checkin/today');
  },
  
  getRecentCheckIns: function(limit) {
    const limitParam = limit || 10;
    return request.get('/api/checkin/recent?limit=' + limitParam);
  },
  
  // 根据ID获取打卡详情
  getCheckInById: function(recordId) {
    return request.get('/api/checkin/' + recordId);
  },
  
  // 删除打卡记录
  deleteCheckIn: function(recordId) {
    return request.delete('/api/checkin/' + recordId);
  }
};

// 聊天相关 API
var chatAPI = {
  sendMessage: function(data) {
    return request.post('/chat/message', data);
  },
  
  getMessages: function(params) {
    // 将参数对象转换为 URL 查询字符串
    let queryString = '';
    if (params) {
      const queryParams = [];
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
          queryParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
      }
      if (queryParams.length > 0) {
        queryString = '?' + queryParams.join('&');
      }
    }
    return request.get('/chat/messages' + queryString);
  },
  
  getQuickReplies: function() {
    return request.get('/chat/quick-replies');
  }
};

// 成就相关 API
var achievementAPI = {
  // 获取用户所有成就
  getAchievements: function() {
    return request.get('/api/achievement/list');
  },
  
  // 检查并自动解锁成就
  checkAchievements: function() {
    return request.get('/api/achievement/check');
  },
  
  // 手动解锁成就（测试用）
  unlockAchievement: function(badgeType) {
    return request.post('/api/achievement/unlock?badgeType=' + badgeType);
  }
};

// 配对相关 API
var partnershipAPI = {
  generateCode: '/api/partnership/generate-invite',
  getInviteCodeInfo: '/api/partnership/invite-info',
  request: '/api/partnership/request',
  accept: '/api/partnership/accept',
  reject: '/api/partnership/reject',
  pendingRequests: '/api/partnership/pending',
  partner: '/api/partnership/partner',
  dissolve: '/api/partnership/dissolve'
};

// 互动相关 API
var interactionAPI = {
  like: function(recordId, userId) {
    return request.post('/api/interaction/like?recordId=' + recordId + '&userId=' + userId);
  },
  
  unlike: function(recordId, userId) {
    return request.del('/api/interaction/like?recordId=' + recordId + '&userId=' + userId);
  },
  
  comment: function(recordId, userId, content) {
    return request.post('/api/interaction/comment?recordId=' + recordId + '&userId=' + userId + '&content=' + encodeURIComponent(content));
  },
  
  deleteComment: function(interactionId, userId) {
    return request.del('/api/interaction/comment/' + interactionId + '?userId=' + userId);
  },
  
  getInteractions: function(recordId) {
    return request.get('/api/interaction/list/' + recordId);
  },
  
  // 获取评论列表
  getComments: function(recordId) {
    return request.get('/api/interaction/comments/' + recordId);
  },
  
  hasLiked: function(recordId, userId) {
    return request.get('/api/interaction/hasLiked?recordId=' + recordId + '&userId=' + userId);
  },
  
  getStats: function(recordId) {
    return request.get('/api/interaction/stats/' + recordId);
  }
};

// 通知相关 API
var notificationAPI = {
  // 获取未读通知数量
  getUnreadCount: function() {
    return request.get('/api/notification/unread/count');
  },
  
  // 获取未读通知列表
  getUnreadNotifications: function() {
    return request.get('/api/notification/unread');
  },
  
  // 获取通知列表
  getNotifications: function(limit) {
    return request.get('/api/notification/list?limit=' + (limit || 20));
  },
  
  // 标记为已读
  markAsRead: function(notificationId) {
    return request.post('/api/notification/read/' + notificationId);
  },
  
  // 标记所有为已读
  markAllAsRead: function() {
    return request.post('/api/notification/read/all');
  }
};

// 目标相关 API
var goalAPI = {
  // 获取当前活跃目标
  getActiveGoal: function(goalType) {
    return request.get('/api/goal/active?goalType=' + goalType);
  },
  
  // 创建目标
  createGoal: function(goalType, targetValue) {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    console.log('【目标API】创建目标 - goalType:', goalType, 'targetValue:', targetValue);
    console.log('【目标API】当前token:', token ? '已设置' : '未设置');
    console.log('【目标API】当前userId:', userId);
    
    return request.post('/api/goal/create', {
      goalType: goalType,
      targetValue: targetValue
    });
  },
  
  // 更新目标
  updateGoal: function(goalId, targetValue) {
    return request.put('/api/goal/update', {
      goalId: goalId,
      targetValue: targetValue
    });
  },
  
  // 检查目标完成情况
  checkGoalProgress: function(goalType) {
    return request.get('/api/goal/check?goalType=' + goalType);
  }
};

// 情侣用户相关 API
var coupleUserAPI = {
  // 获取用户资料
  getProfile: function() {
    return request.get('/api/user/profile');
  },
  
  // 更新用户资料
  updateProfile: function(data) {
    return request.put('/api/user/profile', data);
  },
  
  // 上传头像 - 注意：这个方法在页面中直接使用 wx.uploadFile
  uploadAvatar: function(filePath) {
    return Promise.resolve();
  }
};

module.exports = {
  BASE_URL: BASE_URL,
  authAPI: authAPI,
  userAPI: userAPI,
  checkInAPI: checkInAPI,
  chatAPI: chatAPI,
  achievementAPI: achievementAPI,
  partnership: partnershipAPI,
  interactionAPI: interactionAPI,
  notificationAPI: notificationAPI,
  goalAPI: goalAPI,
  coupleUserAPI: coupleUserAPI
};


// 便捷导出
module.exports.wechatLogin = authAPI.wechatLogin;
module.exports.refreshToken = authAPI.refreshToken;
