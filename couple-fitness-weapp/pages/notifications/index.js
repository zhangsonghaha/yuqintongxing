/**
 * 通知中心页面
 */

const api = require('../../utils/api');
const dateUtil = require('../../utils/date');

Page({
  data: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.loadNotifications();
  },

  onShow() {
    // 每次显示时刷新通知列表
    this.refreshNotifications();
  },

  /**
   * 加载通知列表
   */
  loadNotifications() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({ loading: true });

    api.notificationAPI.getNotifications(this.data.pageSize)
      .then(res => {
        if (res.code === 200) {
          const notifications = res.data || [];
          
          // 格式化时间
          notifications.forEach(item => {
            item.createdAt = this.formatTime(item.createdAt);
          });

          // 统计未读数量
          const unreadCount = notifications.filter(item => !item.isRead).length;

          this.setData({
            notifications: notifications,
            unreadCount: unreadCount,
            hasMore: notifications.length >= this.data.pageSize
          });
        } else {
          wx.showToast({
            title: res.msg || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('加载通知失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  /**
   * 刷新通知列表
   */
  refreshNotifications() {
    this.setData({
      page: 1,
      hasMore: true,
      notifications: []
    });
    this.loadNotifications();
  },

  /**
   * 点击通知项
   */
  onNotificationTap(e) {
    const item = e.currentTarget.dataset.item;
    
    // 标记为已读
    if (!item.isRead) {
      this.markAsRead(item.notificationId);
    }

    // 跳转到对应的打卡记录详情
    wx.navigateTo({
      url: `/pages/checkin-detail/index?recordId=${item.recordId}`
    });
  },

  /**
   * 标记单条通知为已读
   */
  markAsRead(notificationId) {
    api.notificationAPI.markAsRead(notificationId)
      .then(res => {
        if (res.code === 200) {
          // 更新本地状态
          const notifications = this.data.notifications.map(item => {
            if (item.notificationId === notificationId) {
              item.isRead = true;
            }
            return item;
          });

          const unreadCount = notifications.filter(item => !item.isRead).length;

          this.setData({
            notifications: notifications,
            unreadCount: unreadCount
          });
        }
      })
      .catch(err => {
        console.error('标记已读失败:', err);
      });
  },

  /**
   * 全部标记为已读
   */
  markAllAsRead() {
    wx.showModal({
      title: '提示',
      content: '确定要将所有通知标记为已读吗？',
      success: (res) => {
        if (res.confirm) {
          this.doMarkAllAsRead();
        }
      }
    });
  },

  /**
   * 执行全部标记为已读
   */
  doMarkAllAsRead() {
    wx.showLoading({ title: '处理中...' });

    api.notificationAPI.markAllAsRead()
      .then(res => {
        if (res.code === 200) {
          // 更新本地状态
          const notifications = this.data.notifications.map(item => {
            item.isRead = true;
            return item;
          });

          this.setData({
            notifications: notifications,
            unreadCount: 0
          });

          wx.showToast({
            title: '已全部标记为已读',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('标记全部已读失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 格式化时间
   */
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const time = new Date(timeStr);
    const now = new Date();
    const diff = now - time;
    
    // 1分钟内
    if (diff < 60000) {
      return '刚刚';
    }
    
    // 1小时内
    if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前';
    }
    
    // 今天
    if (time.toDateString() === now.toDateString()) {
      return Math.floor(diff / 3600000) + '小时前';
    }
    
    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (time.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    
    // 一周内
    if (diff < 7 * 24 * 3600000) {
      return Math.floor(diff / (24 * 3600000)) + '天前';
    }
    
    // 超过一周，显示具体日期
    return dateUtil.formatDate(time, 'MM-DD');
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.refreshNotifications();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      });
      this.loadNotifications();
    }
  }
});
