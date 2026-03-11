/**
 * 应用入口文件
 */

App({
  onLaunch() {
    // 初始化应用
    this.initApp();
  },

  onShow() {
    // 应用显示时
    this.checkTokenExpiration();
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
    
    if (!token || !userId) {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/index'
      });
    } else {
      // 已登录，加载用户信息
      this.loadUserInfo();
    }
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
   * 全局数据
   */
  globalData: {
    userInfo: null,
    partnerInfo: null,
    token: '',
    apiBaseUrl: 'https://api.example.com'
  }
});
