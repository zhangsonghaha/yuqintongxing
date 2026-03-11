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
  
  hasLiked: function(recordId, userId) {
    return request.get('/api/interaction/hasLiked?recordId=' + recordId + '&userId=' + userId);
  },
  
  getStats: function(recordId) {
    return request.get('/api/interaction/stats/' + recordId);
  }
};

module.exports = {
  authAPI: authAPI,
  userAPI: userAPI,
  checkInAPI: checkInAPI,
  chatAPI: chatAPI,
  achievementAPI: achievementAPI,
  partnership: partnershipAPI,
  interactionAPI: interactionAPI
};


// 便捷导出
module.exports.wechatLogin = authAPI.wechatLogin;
module.exports.refreshToken = authAPI.refreshToken;
