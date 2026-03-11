/**
 * 测试登录页面
 */

const request = require('../../utils/request');
const storage = require('../../utils/storage');

Page({
  data: {
    phone: '',
    code: '',
    codeCountdown: 0,
    loading: false
  },

  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  /**
   * 验证码输入
   */
  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    });
  },

  /**
   * 获取验证码
   */
  getCode() {
    const { phone } = this.data;
    
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    // 模拟发送验证码
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
    
    // 开始倒计时
    this.startCountdown();
  },

  /**
   * 开始倒计时
   */
  startCountdown() {
    let countdown = 60;
    this.setData({ codeCountdown: countdown });
    
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({ codeCountdown: 0 });
      } else {
        this.setData({ codeCountdown: countdown });
      }
    }, 1000);
  },

  /**
   * 登录
   */
  async handleLogin() {
    const { phone, code } = this.data;
    
    // 验证输入
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }
    
    // 验证码校验（测试环境固定为123456）
    if (code !== '123456') {
      wx.showToast({
        title: '验证码错误',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      // 调用手机号登录接口
      const response = await request.post('/api/auth/phone-login', {
        phone: phone,
        code: code
      });
      
      if (response.code === 200 && response.data) {
        // 保存令牌和用户信息
        wx.setStorageSync('token', response.data.token);
        wx.setStorageSync('refreshToken', response.data.refreshToken);
        wx.setStorageSync('userId', response.data.user.userId);
        
        // 保存用户信息
        storage.setUserInfo(response.data.user);
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: response.msg || '登录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 返回微信登录
   */
  backToWechatLogin() {
    wx.navigateBack();
  }
});
