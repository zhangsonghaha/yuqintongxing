// components/custom/comment-list/index.js
const api = require('../../../utils/api');
const storage = require('../../../utils/storage');

Component({
  properties: {
    recordId: {
      type: Number,
      value: 0,
      observer: 'loadComments'
    }
  },

  data: {
    comments: [],
    likes: [],
    currentUserId: null,
    loading: false
  },

  lifetimes: {
    attached() {
      this.setData({
        currentUserId: storage.getUserId()
      });
      if (this.properties.recordId) {
        this.loadComments();
      }
    }
  },

  methods: {
    /**
     * 加载评论和点赞列表
     */
    loadComments() {
      const { recordId } = this.properties;
      
      if (!recordId) return;

      this.setData({ loading: true });

      api.interactionAPI.getInteractions(recordId)
        .then(res => {
          this.setData({ loading: false });
          if (res.code === 200) {
            this.setData({
              comments: res.data.comments || [],
              likes: res.data.likes || []
            });
          }
        })
        .catch(err => {
          this.setData({ loading: false });
          console.error('加载互动数据失败:', err);
        });
    },

    /**
     * 删除评论
     */
    onDeleteComment(e) {
      const { interactionId } = e.currentTarget.dataset;
      const { currentUserId } = this.data;

      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条评论吗？',
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '删除中...',
              mask: true
            });

            api.interactionAPI.deleteComment(interactionId, currentUserId)
              .then(res => {
                wx.hideLoading();
                if (res.code === 200) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                  // 重新加载评论列表
                  this.loadComments();
                  // 触发删除成功事件
                  this.triggerEvent('deletesuccess', { interactionId });
                  // 触发实时更新事件
                  this.triggerEvent('interactionupdate', { 
                    type: 'deleteComment',
                    recordId: this.properties.recordId 
                  });
                } else {
                  wx.showToast({
                    title: res.msg || '删除失败',
                    icon: 'none'
                  });
                }
              })
              .catch(err => {
                wx.hideLoading();
                console.error('删除评论失败:', err);
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              });
          }
        }
      });
    },

    /**
     * 格式化时间
     */
    formatTime(dateStr) {
      if (!dateStr) return '';
      
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now - date;
      
      // 1分钟内
      if (diff < 60000) {
        return '刚刚';
      }
      // 1小时内
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
      }
      // 24小时内
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
      }
      // 7天内
      if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前';
      }
      // 超过7天显示日期
      return date.toLocaleDateString();
    },

    /**
     * 刷新列表
     */
    refresh() {
      this.loadComments();
    }
  }
});
