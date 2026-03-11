/**
 * API 调用
 */

var request = require('./request');

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
    return request.post('/check-in', data);
  },
  
  getCheckInRecords: function(params) {
    return request.get('/check-in/records', { params: params });
  },
  
  getStatistics: function() {
    return request.get('/check-in/statistics');
  },
  
  getTodayStatus: function() {
    return request.get('/check-in/today');
  }
};

// 聊天相关 API
var chatAPI = {
  sendMessage: function(data) {
    return request.post('/chat/message', data);
  },
  
  getMessages: function(params) {
    return request.get('/chat/messages', { params: params });
  },
  
  getQuickReplies: function() {
    return request.get('/chat/quick-replies');
  }
};

// 成就相关 API
var achievementAPI = {
  getAchievements: function() {
    return request.get('/achievement/list');
  },
  
  getBadges: function() {
    return request.get('/achievement/badges');
  },
  
  getLevelInfo: function() {
    return request.get('/achievement/level');
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

module.exports = {
  authAPI: authAPI,
  userAPI: userAPI,
  checkInAPI: checkInAPI,
  chatAPI: chatAPI,
  achievementAPI: achievementAPI,
  partnership: partnershipAPI
};


// 便捷导出
module.exports.wechatLogin = authAPI.wechatLogin;
module.exports.refreshToken = authAPI.refreshToken;
