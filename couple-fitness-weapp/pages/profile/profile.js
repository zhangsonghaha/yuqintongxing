/**
 * profile 页面 - 个人中心
 */

const storage = require('../../utils/storage');

Page({
  data: {
    userInfo: null,
    partnerInfo: null
  },
  
  onLoad() {
    this.loadUserInfo();
  },
  
  onShow() {
    // 每次显示时刷新用户信息
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = storage.getUserInfo();
    const partnerInfo = storage.getPartnerInfo();
    
    this.setData({
      userInfo: userInfo || {},
      partnerInfo: partnerInfo
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
    
    wx.showModal({
      title: '伴侣信息',
      content: `昵称: ${this.data.partnerInfo.nickname || '未知'}\nID: ${this.data.partnerInfo.partnerId || '未知'}`,
      showCancel: false
    });
  },

  /**
   * 编辑资料
   */
  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 设置
   */
  settings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
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