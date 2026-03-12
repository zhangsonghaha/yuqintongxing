const api = require('../../utils/api');
const request = require('../../utils/request');
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

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
          Toast.success('邀请码已生成');
        }
      })
      .catch(err => {
        Toast.fail(err.msg || '生成失败');
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
        Toast.success('已复制到剪贴板');
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
            Toast.success('已保存到相册');
          },
          fail: () => {
            Toast.fail('保存失败');
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
      inputInviteCode: e.detail.toUpperCase()
    });
  },

  /**
   * 发送配对请求
   */
  sendPartnershipRequest() {
    const inviteCode = this.data.inputInviteCode.trim();
    
    if (!inviteCode || inviteCode.length !== 6) {
      Toast.fail('请输入有效的邀请码');
      return;
    }

    this.setData({ loading: true });

    request.post(api.partnership.request, { inviteCode })
      .then(res => {
        if (res.code === 200) {
          Toast.success('配对请求已发送');
          this.setData({ inputInviteCode: '' });
          setTimeout(() => {
            this.switchTab({ currentTarget: { dataset: { tab: 'pending' } } });
          }, 1000);
        }
      })
      .catch(err => {
        Toast.fail(err.msg || '发送失败');
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
        Toast.fail('加载失败');
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
    
    Dialog.confirm({
      title: '确认配对',
      message: '确定要接受这个配对请求吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then(() => {
      // 设置处理中状态
      const pendingRequests = this.data.pendingRequests;
      pendingRequests[index].processing = true;
      this.setData({ pendingRequests });

      request.post(`${api.partnership.accept}/${partnershipId}`, {})
        .then(res => {
          if (res.code === 200) {
            Toast.success('配对成功');
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
          Toast.fail(err.msg || '接受失败');
          // 恢复状态
          pendingRequests[index].processing = false;
          this.setData({ pendingRequests });
        });
    }).catch(() => {
      // 用户取消
    });
  },

  /**
   * 拒绝配对请求
   */
  rejectRequest(e) {
    const partnershipId = e.currentTarget.dataset.id;
    const index = this.data.pendingRequests.findIndex(item => item.partnershipId === partnershipId);
    
    Dialog.confirm({
      title: '确认拒绝',
      message: '确定要拒绝这个配对请求吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then(() => {
      // 设置处理中状态
      const pendingRequests = this.data.pendingRequests;
      pendingRequests[index].processing = true;
      this.setData({ pendingRequests });

      request.post(`${api.partnership.reject}/${partnershipId}`, {})
        .then(res => {
          if (res.code === 200) {
            Toast.success('已拒绝');
            this.loadPendingRequests();
          }
        })
        .catch(err => {
          Toast.fail(err.msg || '拒绝失败');
          // 恢复状态
          pendingRequests[index].processing = false;
          this.setData({ pendingRequests });
        });
    }).catch(() => {
      // 用户取消
    });
  },

  /**
   * 解除配对
   */
  dissolvePartnership() {
    Dialog.confirm({
      title: '解除配对',
      message: '确定要解除与伴侣的配对关系吗？此操作不可恢复。',
      confirmButtonText: '确定解除',
      cancelButtonText: '取消',
      confirmButtonColor: '#FF6B9D'
    }).then(() => {
      Toast.loading({
        message: '处理中...',
        forbidClick: true,
        duration: 0
      });

      request.del(api.partnership.dissolve)
        .then(res => {
          Toast.clear();
          if (res.code === 200) {
            Toast.success('已解除配对');
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
          Toast.clear();
          Toast.fail(err.msg || '解除失败');
        });
    }).catch(() => {
      // 用户取消
    });
  }
});
