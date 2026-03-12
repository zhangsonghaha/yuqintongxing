const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    setting: {
      allowPartnerViewCheckins: true,
      allowPartnerViewStats: true,
      allowPartnerViewAchievements: true,
      dataShareScope: 1
    },
    shareScopeOptions: [
      { label: '仅自己', value: 0 },
      { label: '仅伴侣', value: 1 },
      { label: '公开', value: 2 }
    ],
    showShareScopePicker: false
  },

  onLoad() {
    this.loadSettings();
  },

  /**
   * 加载隐私设置
   */
  async loadSettings() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await request.get('/api/privacy');
      
      if (res.code === 200 && res.data) {
        this.setData({
          setting: res.data
        });
      }
      
    } catch (error) {
      console.error('加载设置失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 切换打卡记录查看权限
   */
  onCheckinsViewChange(e) {
    const enabled = e.detail;
    this.setData({
      'setting.allowPartnerViewCheckins': enabled
    });
    this.saveSettings();
  },

  /**
   * 切换统计数据查看权限
   */
  onStatsViewChange(e) {
    const enabled = e.detail;
    this.setData({
      'setting.allowPartnerViewStats': enabled
    });
    this.saveSettings();
  },

  /**
   * 切换成就查看权限
   */
  onAchievementsViewChange(e) {
    const enabled = e.detail;
    this.setData({
      'setting.allowPartnerViewAchievements': enabled
    });
    this.saveSettings();
  },

  /**
   * 显示数据共享范围选择器
   */
  showShareScopePicker() {
    this.setData({
      showShareScopePicker: true
    });
  },

  /**
   * 关闭数据共享范围选择器
   */
  closeShareScopePicker() {
    this.setData({
      showShareScopePicker: false
    });
  },

  /**
   * 数据共享范围确认
   */
  onShareScopeConfirm(e) {
    const { value } = e.detail;
    this.setData({
      'setting.dataShareScope': value,
      showShareScopePicker: false
    });
    this.saveSettings();
  },

  /**
   * 保存设置
   */
  async saveSettings() {
    try {
      const res = await request.put('/api/privacy', this.data.setting);
      
      if (res.code === 200) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        });
      } else {
        throw new Error(res.msg || '保存失败');
      }
      
    } catch (error) {
      console.error('保存设置失败:', error);
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    }
  },

  /**
   * 注销账号
   */
  deactivateAccount() {
    wx.showModal({
      title: '注销账号',
      content: '注销后将无法登录，确定要注销账号吗？',
      confirmText: '确定注销',
      confirmColor: '#FF6B9D',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            
            const result = await request.post('/api/privacy/deactivate', {});
            
            if (result.code === 200) {
              wx.showToast({
                title: '账号已注销',
                icon: 'success'
              });
              
              // 清除本地数据并跳转到登录页
              setTimeout(() => {
                wx.clearStorageSync();
                wx.reLaunch({
                  url: '/pages/login/index'
                });
              }, 1500);
            } else {
              throw new Error(result.msg || '注销失败');
            }
            
          } catch (error) {
            console.error('注销账号失败:', error);
            wx.showToast({
              title: error.message || '注销失败',
              icon: 'none'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  /**
   * 删除所有数据
   */
  deleteAllData() {
    wx.showModal({
      title: '删除所有数据',
      content: '此操作将永久删除您的所有数据，包括打卡记录、成就、目标等，且无法恢复。确定要删除吗？',
      confirmText: '确定删除',
      confirmColor: '#FF0000',
      success: async (res) => {
        if (res.confirm) {
          // 二次确认
          wx.showModal({
            title: '最后确认',
            content: '数据删除后无法恢复，请再次确认',
            confirmText: '确定删除',
            confirmColor: '#FF0000',
            success: async (res2) => {
              if (res2.confirm) {
                try {
                  wx.showLoading({ title: '删除中...' });
                  
                  const result = await request.delete('/api/privacy/delete-all');
                  
                  if (result.code === 200) {
                    wx.showToast({
                      title: '数据已删除',
                      icon: 'success'
                    });
                    
                    // 清除本地数据并跳转到登录页
                    setTimeout(() => {
                      wx.clearStorageSync();
                      wx.reLaunch({
                        url: '/pages/login/index'
                      });
                    }, 1500);
                  } else {
                    throw new Error(result.msg || '删除失败');
                  }
                  
                } catch (error) {
                  console.error('删除数据失败:', error);
                  wx.showToast({
                    title: error.message || '删除失败',
                    icon: 'none'
                  });
                } finally {
                  wx.hideLoading();
                }
              }
            }
          });
        }
      }
    });
  }
});
