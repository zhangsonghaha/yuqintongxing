// components/custom/interaction-bar/index.js
const api = require('../../../utils/api');
const storage = require('../../../utils/storage');

Component({
  properties: {
    recordId: {
      type: Number,
      value: 0
    },
    likeCount: {
      type: Number,
      value: 0
    },
    commentCount: {
      type: Number,
      value: 0
    },
    hasLiked: {
      type: Boolean,
      value: false
    }
  },

  data: {
    currentUserId: null,
    isLiked: false,
    likes: 0,
    comments: 0
  },

  lifetimes: {
    attached() {
      this.setData({
        currentUserId: storage.getUserId(),
        isLiked: this.properties.hasLiked,
        likes: this.properties.likeCount,
        comments: this.properties.commentCount
      });
    }
  },

  observers: {
    'hasLiked': function(newVal) {
      this.setData({
        isLiked: newVal
      });
    },
    'likeCount': function(newVal) {
      this.setData({
        likes: newVal
      });
    },
    'commentCount': function(newVal) {
      this.setData({
        comments: newVal
      });
    }
  },

  methods: {
    /**
     * 点赞/取消点赞
     */
    onLike() {
      const { recordId, currentUserId, isLiked } = this.data;
      
      if (!currentUserId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      if (isLiked) {
        // 取消点赞
        api.interactionAPI.unlike(recordId, currentUserId).then(res => {
          if (res.code === 200) {
            this.setData({
              isLiked: false,
              likes: this.data.likes - 1
            });
            this.triggerEvent('likechange', { 
              recordId: recordId, 
              isLiked: false,
              likeCount: this.data.likes
            });
            // 触发实时更新
            this.triggerEvent('interactionupdate', { 
              type: 'unlike',
              recordId: recordId 
            });
          } else {
            wx.showToast({
              title: res.msg || '取消点赞失败',
              icon: 'none'
            });
          }
        }).catch(err => {
          console.error('取消点赞失败:', err);
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        });
      } else {
        // 点赞
        api.interactionAPI.like(recordId, currentUserId).then(res => {
          if (res.code === 200) {
            this.setData({
              isLiked: true,
              likes: this.data.likes + 1
            });
            this.triggerEvent('likechange', { 
              recordId: recordId, 
              isLiked: true,
              likeCount: this.data.likes
            });
            // 点赞动画效果
            wx.vibrateShort();
            // 触发实时更新
            this.triggerEvent('interactionupdate', { 
              type: 'like',
              recordId: recordId 
            });
          } else {
            wx.showToast({
              title: res.msg || '点赞失败',
              icon: 'none'
            });
          }
        }).catch(err => {
          console.error('点赞失败:', err);
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        });
      }
    },

    /**
     * 打开评论
     */
    onComment() {
      this.triggerEvent('comment', { recordId: this.data.recordId });
    }
  }
});
