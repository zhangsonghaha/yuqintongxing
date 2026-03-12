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
    },
    // 回复模式相关属性
    replyMode: {
      type: Boolean,
      value: false
    },
    replyToId: {
      type: Number,
      value: null
    },
    replyToUserId: {
      type: Number,
      value: null
    },
    replyToUserName: {
      type: String,
      value: ''
    }
  },

  data: {
    commentText: '',
    isFocused: false,
    currentUserId: null,
    showEmojiPanel: false,
    // 常用表情
    commonEmojis: ['😊', '😂', '🤣', '😍', '🥰', '😘', '😎', '🤗', '🤔', '😅', '😆', '😉', '😋', '😌', '😏', '👍', '👏', '🙏', '💪', '✨'],
    // 运动健身表情
    fitnessEmojis: ['💪', '🏃', '🏃‍♀️', '🚴', '🚴‍♀️', '🏋️', '🏋️‍♀️', '🤸', '🤸‍♀️', '⛹️', '⛹️‍♀️', '🧘', '🧘‍♀️', '🏊', '🏊‍♀️', '🔥', '⚡', '🎯', '🏆', '🥇'],
    // 爱心表情
    loveEmojis: ['❤️', '💕', '💖', '💗', '💓', '💞', '💝', '💘', '💟', '💌', '💋', '😻', '🥰', '😍', '🤩', '💑', '👫', '💏', '🌹', '🎁']
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
     * 切换表情面板
     */
    toggleEmojiPanel() {
      this.setData({
        showEmojiPanel: !this.data.showEmojiPanel
      });
    },

    /**
     * 关闭表情面板
     */
    closeEmojiPanel() {
      this.setData({
        showEmojiPanel: false
      });
    },

    /**
     * 选择表情
     */
    onSelectEmoji(e) {
      const emoji = e.currentTarget.dataset.emoji;
      const currentText = this.data.commentText;
      
      // 检查长度限制
      if (currentText.length >= 500) {
        wx.showToast({
          title: '已达到字数上限',
          icon: 'none'
        });
        return;
      }
      
      // 将表情添加到输入框
      this.setData({
        commentText: currentText + emoji
      });
    },

    /**
     * 阻止冒泡
     */
    stopPropagation() {
      // 阻止事件冒泡
    },

    /**
     * 发送评论
     */
    onSend() {
      const { recordId, commentText, currentUserId } = this.data;
      const { replyMode, replyToId, replyToUserId, replyToUserName } = this.properties;

      if (!currentUserId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      if (!commentText || commentText.trim() === '') {
        wx.showToast({
          title: replyMode ? '请输入回复内容' : '请输入评论内容',
          icon: 'none'
        });
        return;
      }

      if (commentText.length > 500) {
        wx.showToast({
          title: replyMode ? '回复内容不能超过500字' : '评论内容不能超过500字',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({
        title: replyMode ? '回复中...' : '发送中...',
        mask: true
      });

      // 根据是否是回复模式调用不同的API
      const apiCall = replyMode 
        ? api.interactionAPI.reply(recordId, currentUserId, commentText.trim(), replyToId, replyToUserId, replyToUserName)
        : api.interactionAPI.comment(recordId, currentUserId, commentText.trim());

      apiCall
        .then(res => {
          wx.hideLoading();
          if (res.code === 200) {
            wx.showToast({
              title: replyMode ? '回复成功' : '评论成功',
              icon: 'success'
            });
            // 清空输入框
            this.setData({
              commentText: ''
            });
            // 触发成功事件
            this.triggerEvent('commentsuccess', { 
              recordId: recordId,
              comment: res.data,
              isReply: replyMode
            });
            // 触发实时更新事件
            this.triggerEvent('interactionupdate', { 
              type: replyMode ? 'reply' : 'comment',
              recordId: recordId 
            });
            // 如果是回复模式,取消回复模式
            if (replyMode) {
              this.triggerEvent('cancelreply');
            }
          } else {
            wx.showToast({
              title: res.msg || (replyMode ? '回复失败' : '评论失败'),
              icon: 'none'
            });
          }
        })
        .catch(err => {
          wx.hideLoading();
          console.error(replyMode ? '回复失败:' : '评论失败:', err);
          wx.showToast({
            title: replyMode ? '回复失败' : '评论失败',
            icon: 'none'
          });
        });
    }
  }
});
