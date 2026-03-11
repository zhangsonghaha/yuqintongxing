/**
 * 首页
 */

const { checkInAPI, achievementAPI } = require('../../utils/api');
const storage = require('../../utils/storage');
const { getToday } = require('../../utils/date');

Page({
  data: {
    // 用户信息
    userInfo: null,
    partnerInfo: null,
    
    // 打卡状态
    todayStatus: {
      userCheckedIn: false,
      partnerCheckedIn: false,
      userCheckInTime: '',
      partnerCheckInTime: ''
    },
    
    // 成就数据
    consecutiveDays: 0,
    level: 1,
    experience: 0,
    
    // 加载状态
    loading: false,
    error: null
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadData();
  },

  /**
   * 加载数据
   */
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 获取用户信息
      const userInfo = storage.getUserInfo();
      const partnerInfo = storage.getPartnerInfo();
      
      // 获取今日打卡状态
      const todayStatus = await checkInAPI.getTodayStatus();
      
      // 获取成就数据
      const levelInfo = await achievementAPI.getLevelInfo();
      
      this.setData({
        userInfo,
        partnerInfo,
        todayStatus,
        consecutiveDays: levelInfo.consecutiveDays || 0,
        level: levelInfo.level || 1,
        experience: levelInfo.experience || 0,
        loading: false
      });
    } catch (error) {
      this.setData({
        error: error.message,
        loading: false
      });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 打卡
   */
  handleCheckIn() {
    // 检查是否已打卡
    if (this.data.todayStatus.userCheckedIn) {
      wx.showToast({
        title: '今天已打卡',
        icon: 'success'
      });
      return;
    }
    
    // 导航到打卡页面
    wx.navigateTo({
      url: '/pages/checkin/index',
      fail: (err) => {
        wx.showToast({
          title: '打卡页面加载失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 叫醒对方
   */
  handleWakeUp() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  /**
   * 查看日历
   */
  handleViewCalendar() {
    wx.switchTab({
      url: '/pages/calendar/calendar'
    });
  },

  /**
   * 跳转到配对页面
   */
  goToPartnership() {
    wx.navigateTo({
      url: '/pages/partnership/index'
    });
  }
});
