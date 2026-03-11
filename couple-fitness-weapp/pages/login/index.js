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
   * 微信登录
   */
  onWechatLogin() {
    console.log('点击了登录按钮');
    this.setData({ loading: true });

    // 同时发起 wx.login 和 wx.getUserProfile
    // 注意：wx.getUserProfile 必须在用户的直接点击事件中调用
    let code = null;
    let userInfo = null;
    let completed = 0;

    // 第一步：获取授权码
    wx.login({
      success: (loginRes) => {
        console.log('wx.login 成功，code:', loginRes.code);
        code = loginRes.code;
        completed++;
        if (completed === 2 && code && userInfo) {
          this.handleWechatLogin(code, userInfo);
        }
      },
      fail: (err) => {
        console.log('wx.login 失败:', err);
        this.setData({ loading: false });
        this.showError('登录失败，请重试');
      }
    });

    // 第二步：获取用户信息（必须在用户点击事件中调用）
    wx.getUserProfile({
      desc: '用于完善用户信息',
      success: (userRes) => {
        console.log('用户授权成功，userInfo:', userRes.userInfo);
        userInfo = userRes.userInfo;
        completed++;
        if (completed === 2 && code && userInfo) {
          this.handleWechatLogin(code, userInfo);
        }
      },
      fail: (err) => {
        console.log('用户拒绝授权:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '已取消授权',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  /**
   * 处理微信登录
   */
  handleWechatLogin(code, userInfo) {
    console.log('handleWechatLogin 被调用，code:', code);
    const loginData = {
      code: code,
      nickname: userInfo.nickName,
      avatar: userInfo.avatarUrl,
      gender: userInfo.gender // 0: 未知, 1: 男, 2: 女
    };

    console.log('发起登录请求，数据:', loginData);
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
  }
});
