// components/custom/comment-input/index.js
const api = require('../../../utils/api');
const storage = require('../../../utils/storage');

Component({
  properties: {
    recordId: {
      type: Number,
      value: 0
    },
    placeholder: {
      type: String,
      value: '说点什么...'
    }
  },

  data: {
    commentText: '',
    isFocused: false,
    currentUserId: null
  },

  lifetimes: {
    attached() {
      this.setData({
        currentUserId: storage.getUserId()
      });
    }
  },

  methods: {
    /**
     * 输入框获得焦点
     */
    onFocus() {
      this.setData({
        isFocused: true
      });
    },

    /**
     * 输入框失去焦点
     */
    onBlur() {
      this.setData({
        isFocused: false
      });
    },

    /**
     * 输入内容变化
     */
    onInput(e) {
      this.setData({
        commentText: e.detail.value
      });
    },

    /**
     * 发送评论
     */
    onSend() {
      const { recordId, commentText, currentUserId } = this.data;

      if (!currentUserId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      if (!commentText || commentText.trim() === '') {
        wx.showToast({
          title: '请输入评论内容',
          icon: 'none'
        });
        return;
      }

      if (commentText.length > 500) {
        wx.showToast({
          title: '评论内容不能超过500字',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({
        title: '发送中...',
        mask: true
      });

      api.interactionAPI.comment(recordId, currentUserId, commentText.trim())
        .then(res => {
          wx.hideLoading();
          if (res.code === 200) {
            wx.showToast({
              title: '评论成功',
              icon: 'success'
            });
            // 清空输入框
            this.setData({
              commentText: ''
            });
            // 触发评论成功事件
            this.triggerEvent('commentsuccess', { 
              recordId: recordId,
              comment: res.data 
            });
            // 触发实时更新事件
            this.triggerEvent('interactionupdate', { 
              type: 'comment',
              recordId: recordId 
            });
          } else {
            wx.showToast({
              title: res.msg || '评论失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          wx.hideLoading();
          console.error('评论失败:', err);
          wx.showToast({
            title: '评论失败',
            icon: 'none'
          });
        });
    }
  }
});
