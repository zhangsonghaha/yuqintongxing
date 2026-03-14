const api = require('../../utils/api');
const request = require('../../utils/request');
const storage = require('../../utils/storage');

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 检查是否已登录
    this.checkLogin();
  },

  /**
   * 检查用户是否已登录
   */
  checkLogin() {
    const token = wx.getStorageSync('token');
    if (token) {
      // 已登录，跳转到主页
      wx.redirectTo({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 微信授权回调（open-type="getUserInfo" 触发）
   * 新版微信基础库不再弹授权框，e.detail.userInfo 可能为空，直接用 wx.login 登录即可
   */
  onGetUserInfo(e) {
    this.setData({ loading: true });
    const userInfo = e.detail.userInfo || null;

    wx.login({
      success: (loginRes) => {
        this.handleWechatLogin(loginRes.code, userInfo);
      },
      fail: (err) => {
        console.error('wx.login 失败:', err);
        this.setData({ loading: false });
        this.showError('登录失败，请重试');
      }
    });
  },

  /**
   * 处理微信登录（已废弃的 onWechatLogin 保留兼容）
   */
  onWechatLogin() {
    this.setData({ loading: true });
    wx.login({
      success: (loginRes) => {
        this.handleWechatLogin(loginRes.code, null);
      },
      fail: (err) => {
        this.setData({ loading: false });
        this.showError('登录失败，请重试');
      }
    });
  },

  /**
   * 处理微信登录
   */
  handleWechatLogin(code, userInfo) {
    const loginData = {
      code: code,
      nickname: userInfo ? userInfo.nickName : null,
      avatar: userInfo ? userInfo.avatarUrl : null,
      gender: userInfo ? userInfo.gender : null
    };
    request.post(api.authAPI.wechatLogin, loginData)
      .then((response) => {
        console.log('登录请求成功，响应:', response);
        if (response.code === 200) {
          const data = response.data;
          
          // 保存令牌和用户信息
          storage.setToken(data.token);
          storage.setRefreshToken(data.refreshToken);
          storage.setUserId(data.user.userId);

          // 保存用户信息到本地存储
          wx.setStorageSync('userInfo', data.user);

          this.setData({ loading: false });

          // 显示成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          });

          // 使用 switchTab 跳转到首页（因为首页在 tabBar 中）
          console.log('准备跳转到首页');
          wx.switchTab({
            url: '/pages/index/index',
            success: () => {
              console.log('跳转成功');
            },
            fail: (err) => {
              console.log('跳转失败:', err);
            }
          });
        } else {
          this.setData({ loading: false });
          this.showError(response.msg || '登录失败，请重试');
        }
      })
      .catch((error) => {
        console.log('登录请求失败:', error);
        this.setData({ loading: false });
        this.showError(error.msg || '登录失败，请重试');
      });
  },

  /**
   * 显示错误提示
   */
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到测试登录页面
   */
  goToTestLogin() {
    wx.navigateTo({
      url: '/pages/login/test-login'
    });
  }
});
