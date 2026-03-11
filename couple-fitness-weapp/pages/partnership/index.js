const api = require('../../utils/api');
const request = require('../../utils/request');

Page({
  data: {
    activeTab: 'generate',
    inviteCode: '',
    qrCodeUrl: '',
    inputInviteCode: '',
    pendingRequests: [],
    loading: false,
    loadingRequests: false,
    hasPaired: false,
    partnerInfo: null
  },

  onLoad() {
    this.checkPartnershipStatus();
  },

  onShow() {
    // 每次显示页面时刷新状态
    this.checkPartnershipStatus();
  },

  /**
   * 检查配对状态
   */
  checkPartnershipStatus() {
    request.get(api.partnership.partner)
      .then(res => {
        if (res.code === 200 && res.data) {
          // 已配对
          this.setData({
            hasPaired: true,
            partnerInfo: res.data
          });
        } else {
          // 未配对
          this.setData({
            hasPaired: false,
            partnerInfo: null
          });
          this.loadPendingRequests();
        }
      })
      .catch(err => {
        console.error('检查配对状态失败:', err);
        // 假设未配对
        this.setData({
          hasPaired: false,
          partnerInfo: null
        });
        this.loadPendingRequests();
      });
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    
    if (tab === 'pending') {
      this.loadPendingRequests();
    }
  },

  /**
   * 生成邀请码
   */
  generateInviteCode() {
    this.setData({ loading: true });
    
    request.post(api.partnership.generateCode, {})
      .then(res => {
        if (res.code === 200) {
          const inviteCode = res.data;
          this.setData({
            inviteCode: inviteCode,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${inviteCode}`
          });
          wx.showToast({
            title: '邀请码已生成',
            icon: 'success'
          });
        }
      })
      .catch(err => {
        wx.showToast({
          title: err.msg || '生成失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  /**
   * 复制邀请码
   */
  copyInviteCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 保存二维码
   */
  saveQRCode() {
    wx.downloadFile({
      url: this.data.qrCodeUrl,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({
              title: '已保存到相册',
              icon: 'success'
            });
          },
          fail: () => {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  /**
   * 输入邀请码
   */
  onInviteCodeInput(e) {
    this.setData({
      inputInviteCode: e.detail.value.toUpperCase()
    });
  },

  /**
   * 发送配对请求
   */
  sendPartnershipRequest() {
    const inviteCode = this.data.inputInviteCode.trim();
    
    if (!inviteCode || inviteCode.length !== 6) {
      wx.showToast({
        title: '请输入有效的邀请码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    request.post(api.partnership.request, { inviteCode })
      .then(res => {
        if (res.code === 200) {
          wx.showToast({
            title: '配对请求已发送',
            icon: 'success'
          });
          this.setData({ inputInviteCode: '' });
          setTimeout(() => {
            this.switchTab({ currentTarget: { dataset: { tab: 'pending' } } });
          }, 1000);
        }
      })
      .catch(err => {
        wx.showToast({
          title: err.msg || '发送失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  /**
   * 加载待接受请求
   */
  loadPendingRequests() {
    this.setData({ loadingRequests: true });
    
    request.get(api.partnership.pendingRequests)
      .then(res => {
        if (res.code === 200) {
          this.setData({
            pendingRequests: (res.data || []).map(item => ({
              ...item,
              processing: false
            }))
          });
        }
      })
      .catch(err => {
        console.error('加载请求失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loadingRequests: false });
      });
  },

  /**
   * 接受配对请求
   */
  acceptRequest(e) {
    const partnershipId = e.currentTarget.dataset.id;
    const index = this.data.pendingRequests.findIndex(item => item.partnershipId === partnershipId);
    
    wx.showModal({
      title: '确认配对',
      content: '确定要接受这个配对请求吗？',
      success: (res) => {
        if (res.confirm) {
          // 设置处理中状态
          const pendingRequests = this.data.pendingRequests;
          pendingRequests[index].processing = true;
          this.setData({ pendingRequests });

          request.post(`${api.partnership.accept}/${partnershipId}`, {})
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '配对成功',
                  icon: 'success'
                });
                // 保存伴侣信息（使用正确的key）
                const partner = res.data;
                wx.setStorageSync('partnerInfo', partner);
                
                // 更新状态
                this.setData({
                  hasPaired: true,
                  partnerInfo: partner
                });

                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/index/index'
                  });
                }, 1500);
              }
            })
            .catch(err => {
              wx.showToast({
                title: err.msg || '接受失败',
                icon: 'none'
              });
              // 恢复状态
              pendingRequests[index].processing = false;
              this.setData({ pendingRequests });
            });
        }
      }
    });
  },

  /**
   * 拒绝配对请求
   */
  rejectRequest(e) {
    const partnershipId = e.currentTarget.dataset.id;
    const index = this.data.pendingRequests.findIndex(item => item.partnershipId === partnershipId);
    
    wx.showModal({
      title: '确认拒绝',
      content: '确定要拒绝这个配对请求吗？',
      success: (res) => {
        if (res.confirm) {
          // 设置处理中状态
          const pendingRequests = this.data.pendingRequests;
          pendingRequests[index].processing = true;
          this.setData({ pendingRequests });

          request.post(`${api.partnership.reject}/${partnershipId}`, {})
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '已拒绝',
                  icon: 'success'
                });
                this.loadPendingRequests();
              }
            })
            .catch(err => {
              wx.showToast({
                title: err.msg || '拒绝失败',
                icon: 'none'
              });
              // 恢复状态
              pendingRequests[index].processing = false;
              this.setData({ pendingRequests });
            });
        }
      }
    });
  },

  /**
   * 解除配对
   */
  dissolvePartnership() {
    wx.showModal({
      title: '解除配对',
      content: '确定要解除与伴侣的配对关系吗？此操作不可恢复。',
      confirmText: '确定解除',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...',
            mask: true
          });

          request.del(api.partnership.dissolve)
            .then(res => {
              wx.hideLoading();
              if (res.code === 200) {
                wx.showToast({
                  title: '已解除配对',
                  icon: 'success'
                });
                // 清除本地存储的伴侣信息（使用正确的key）
                wx.removeStorageSync('partnerInfo');
                
                // 更新状态
                this.setData({
                  hasPaired: false,
                  partnerInfo: null,
                  activeTab: 'generate'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: err.msg || '解除失败',
                icon: 'none'
              });
            });
        }
      }
    });
  }
});
