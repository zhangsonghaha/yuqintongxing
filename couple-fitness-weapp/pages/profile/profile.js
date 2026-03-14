/**
 * profile 页面 - 个人中心
 */

const storage = require('../../utils/storage');
const api = require('../../utils/api');

Page({
  data: {
    userInfo: null,
    avatarText: '用',
    partnerInfo: null,
    unreadCount: 0,
    daysCount: 0,
    totalCheckIns: 0,
    monthCheckIns: 0,
    achievementCount: 0
  },
  
  onLoad() {
    this.loadUserInfo();
  },
  
  onShow() {
    // 每次显示时刷新用户信息和未读通知数
    this.loadUserInfo();
    this.loadUnreadCount();
    this.loadStats();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // 从本地存储读取
    const userInfo = storage.getUserInfo();
    const partnerInfo = storage.getPartnerInfo();
    
    if (userInfo) {
      const nickname = userInfo.nickname || '用户';
      const avatarText = nickname.substring(0, 1).toUpperCase();

      // 计算在一起天数
      let daysCount = 0;
      if (partnerInfo && partnerInfo.pairedAt) {
        const pairedDate = new Date(partnerInfo.pairedAt.replace(/-/g, '/'));
        const today = new Date();
        daysCount = Math.max(1, Math.floor((today - pairedDate) / (1000 * 60 * 60 * 24)) + 1);
      }

      this.setData({
        userInfo,
        avatarText,
        partnerInfo,
        daysCount
      });
    }
  },

  /**
   * 加载统计数据（打卡天数、本月打卡、成就数）
   */
  loadStats() {
    const token = wx.getStorageSync('token');
    if (!token) return;

    // 用统计接口获取总打卡数和本月打卡数
    api.checkInAPI.getStatistics().then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          totalCheckIns: res.data.totalDays || res.data.totalCount || 0,
          monthCheckIns: res.data.monthDays || res.data.monthCount || 0
        });
      }
    }).catch(() => {});

    // 成就数
    api.achievementAPI.getAchievements().then(res => {
      if (res.code === 200) {
        const list = res.data || [];
        const unlocked = list.filter(a => a.unlocked).length;
        this.setData({ achievementCount: unlocked });
      }
    }).catch(() => {});
  },

  /**
   * 加载未读通知数量
   */
  loadUnreadCount() {
    const token = wx.getStorageSync('token');
    if (!token) {
      return;
    }

    api.notificationAPI.getUnreadCount().then(res => {
      if (res.code === 200) {
        this.setData({
          unreadCount: res.data || 0
        });
      }
    }).catch(err => {
      console.error('获取未读通知数失败:', err);
    });
  },

  /**
   * 跳转到通知中心
   */
  goToNotifications() {
    wx.navigateTo({
      url: '/pages/notifications/index'
    });
  },

  /**
   * 跳转到配对页面
   */
  goToPartnership() {
    wx.navigateTo({
      url: '/pages/partnership/index'
    });
  },

  /**
   * 跳转到目标设置页面
   */
  goToGoal() {
    wx.navigateTo({
      url: '/pages/goal/index'
    });
  },

  /**
   * 跳转到成就页面
   */
  goToAchievement() {
    wx.navigateTo({
      url: '/pages/achievement/index'
    });
  },

  /**
   * 跳转到通知设置页面
   */
  goToReminderSetting() {
    wx.navigateTo({
      url: '/pages/reminder-setting/index'
    });
  },

  /**
   * 跳转到隐私设置页面
   */
  goToPrivacySetting() {
    wx.navigateTo({
      url: '/pages/privacy-setting/index'
    });
  },

  /**
   * 查看伴侣信息
   */
  viewPartner() {
    if (!this.data.partnerInfo) {
      wx.showToast({
        title: '暂无配对伴侣',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到伴侣主页,传递伴侣ID
    const partnerId = this.data.partnerInfo.partnerId || this.data.partnerInfo.userId;
    if (!partnerId) {
      wx.showToast({
        title: '伴侣信息不完整',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/partner-profile/index?partnerId=${partnerId}`
    });
  },

  /**
   * 编辑资料
   */
  editProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/index'
    });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          storage.clearAll();
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/index'
          });
        }
      }
    });
  }
});