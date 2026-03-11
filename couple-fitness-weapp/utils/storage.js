/**
 * 本地存储管理
 */

const storage = {
  // 用户信息
  setUserInfo: (userInfo) => {
    wx.setStorageSync('userInfo', userInfo);
  },
  
  getUserInfo: () => {
    return wx.getStorageSync('userInfo') || null;
  },
  
  // Token
  setToken: (token) => {
    wx.setStorageSync('token', token);
  },
  
  getToken: () => {
    return wx.getStorageSync('token') || '';
  },
  
  // 刷新令牌
  setRefreshToken: (refreshToken) => {
    wx.setStorageSync('refreshToken', refreshToken);
  },
  
  getRefreshToken: () => {
    return wx.getStorageSync('refreshToken') || '';
  },
  
  // 用户ID
  setUserId: (userId) => {
    wx.setStorageSync('userId', userId);
  },
  
  getUserId: () => {
    return wx.getStorageSync('userId') || null;
  },
  
  // 配对信息
  setPartnerInfo: (partnerInfo) => {
    wx.setStorageSync('partnerInfo', partnerInfo);
  },
  
  getPartnerInfo: () => {
    return wx.getStorageSync('partnerInfo') || null;
  },
  
  // 打卡记录
  setCheckInRecords: (records) => {
    wx.setStorageSync('checkInRecords', records);
  },
  
  getCheckInRecords: () => {
    return wx.getStorageSync('checkInRecords') || [];
  },
  
  // 统计数据
  setStatistics: (statistics) => {
    wx.setStorageSync('statistics', statistics);
  },
  
  getStatistics: () => {
    return wx.getStorageSync('statistics') || {};
  },
  
  // 清空所有数据
  clear: () => {
    wx.clearStorageSync();
  },
  
  // 清空所有数据 (别名)
  clearAll: () => {
    wx.clearStorageSync();
  },
  
  // 清空特定数据
  remove: (key) => {
    wx.removeStorageSync(key);
  }
};

module.exports = storage;
