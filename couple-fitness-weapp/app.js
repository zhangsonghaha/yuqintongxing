/**
 * 应用入口文件
 */
const api = require('./utils/api');

App({
  onLaunch() {
    // 初始化应用
    this.initApp();
  },

  onShow() {
    // 应用显示时
    this.checkTokenExpiration();
    // 检查通知
    this.checkNotifications();
  },

  onHide() {
    // 应用隐藏时
  },

  /**
   * 初始化应用
   */
  initApp() {
    // 检查登录状态
    this.checkLogin();
  },

  /**
   * 检查登录状态
   */
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    
    if (token && userId) {
      // 已登录，加载用户信息
      this.loadUserInfo();
    }
    // 注意：不在这里跳转到登录页，让各个页面自己处理未登录的情况
  },

  /**
   * 检查令牌是否过期
   */
  checkTokenExpiration() {
    const token = wx.getStorageSync('token');
    if (!token) {
      return;
    }

    // 这里可以添加令牌过期检查逻辑
    // 例如：检查令牌的过期时间戳
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  /**
   * 检查未读通知
   */
  checkNotifications() {
    const token = wx.getStorageSync('token');
    if (!token) {
      return;
    }
    
    api.notificationAPI.getUnreadCount().then(res => {
      if (res.code === 200) {
        const count = res.data || 0;
        const oldCount = this.globalData.unreadNotificationCount || 0;
        
        this.globalData.unreadNotificationCount = count;
        
        // 如果有新通知，显示提示
        if (count > oldCount && count > 0) {
          const newCount = count - oldCount;
          wx.showToast({
            title: `收到${newCount}条新通知`,
            icon: 'none',
            duration: 2000
          });
          // 震动提示
          wx.vibrateShort();
        }
      }
    }).catch(err => {
      console.error('检查通知失败:', err);
    });
  },

  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    partnerInfo: null,
    token: '',
    apiBaseUrl: 'https://api.example.com',
    unreadNotificationCount: 0
  }
});
