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
      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.userId : null;
      
      console.log('【interaction-bar】组件初始化:', {
        userId: userId,
        recordId: this.properties.recordId,
        hasLiked: this.properties.hasLiked,
        likeCount: this.properties.likeCount
      });
      
      this.setData({
        currentUserId: userId,
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
      
      console.log('【interaction-bar】点赞操作:', {
        recordId: recordId,
        currentUserId: currentUserId,
        isLiked: isLiked
      });
      
      if (!currentUserId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      // 乐观更新 UI
      const newIsLiked = !isLiked;
      const newLikes = isLiked ? this.data.likes - 1 : this.data.likes + 1;
      
      this.setData({
        isLiked: newIsLiked,
        likes: newLikes
      });

      if (isLiked) {
        // 取消点赞
        api.interactionAPI.unlike(recordId, currentUserId).then(res => {
          console.log('【interaction-bar】取消点赞响应:', res);
          if (res.code === 200) {
            this.triggerEvent('likechange', { 
              recordId: recordId, 
              isLiked: false,
              likeCount: newLikes
            });
            // 触发实时更新
            this.triggerEvent('interactionupdate', { 
              type: 'unlike',
              recordId: recordId 
            });
          } else {
            // 回滚状态
            this.setData({
              isLiked: isLiked,
              likes: this.data.likes + 1
            });
            wx.showToast({
              title: res.msg || '取消点赞失败',
              icon: 'none'
            });
          }
        }).catch(err => {
          console.error('【interaction-bar】取消点赞失败:', err);
          // 回滚状态
          this.setData({
            isLiked: isLiked,
            likes: this.data.likes + 1
          });
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        });
      } else {
        // 点赞
        api.interactionAPI.like(recordId, currentUserId).then(res => {
          console.log('【interaction-bar】点赞响应:', res);
          if (res.code === 200) {
            this.triggerEvent('likechange', { 
              recordId: recordId, 
              isLiked: true,
              likeCount: newLikes
            });
            // 点赞动画效果
            wx.vibrateShort();
            // 触发实时更新
            this.triggerEvent('interactionupdate', { 
              type: 'like',
              recordId: recordId 
            });
          } else if (res.msg && res.msg.includes('已经点过赞')) {
            // 如果提示已经点过赞，保持点赞状态
            console.log('【interaction-bar】已经点过赞，保持点赞状态');
            this.triggerEvent('likechange', { 
              recordId: recordId, 
              isLiked: true,
              likeCount: newLikes
            });
            wx.showToast({
              title: '已经点过赞了',
              icon: 'none'
            });
          } else {
            // 其他错误，回滚状态
            this.setData({
              isLiked: isLiked,
              likes: this.data.likes - 1
            });
            wx.showToast({
              title: res.msg || '点赞失败',
              icon: 'none'
            });
          }
        }).catch(err => {
          console.error('【interaction-bar】点赞失败:', err);
          // 回滚状态
          this.setData({
            isLiked: isLiked,
            likes: this.data.likes - 1
          });
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
