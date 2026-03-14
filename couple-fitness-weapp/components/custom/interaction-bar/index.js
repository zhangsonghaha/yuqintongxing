// components/custom/interaction-bar/index.js
const api = require('../../../utils/api');
const storage = require('../../../utils/storage');

Component({
  properties: {
    recordId: {
      type: Number,
      value: 0
    },
    recordOwnerId: {
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
      const userInfo = wx.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.userId : null;
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
      const { recordId, recordOwnerId, currentUserId, isLiked } = this.data;

      if (!currentUserId) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      // 不能给自己的打卡记录点赞
      if (recordOwnerId && currentUserId === recordOwnerId) {
        wx.showToast({
          title: '不能给自己的打卡点赞哦',
          icon: 'none',
          duration: 2000
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
            // 显示取消点赞成功提示
            wx.showToast({
              title: '已取消点赞',
              icon: 'success',
              duration: 1500
            });
          } else {
            // 回滚状态
            this.setData({
              isLiked: isLiked,
              likes: this.data.likes + 1
            });
            wx.showToast({
              title: res.msg || '取消点赞失败',
              icon: 'none',
              duration: 2000
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
            icon: 'none',
            duration: 2000
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
            // 显示点赞成功提示
            wx.showToast({
              title: '点赞成功',
              icon: 'success',
              duration: 1500
            });
          } else if (res.msg && (res.msg.includes('已经点过赞') || res.msg.includes('重复点赞'))) {
            // 如果提示已经点过赞，保持点赞状态
            console.log('【interaction-bar】已经点过赞，保持点赞状态');
            this.triggerEvent('likechange', { 
              recordId: recordId, 
              isLiked: true,
              likeCount: newLikes
            });
            wx.showToast({
              title: '你已经点过赞了',
              icon: 'none',
              duration: 2000
            });
          } else {
            // 其他错误，回滚状态
            this.setData({
              isLiked: isLiked,
              likes: this.data.likes - 1
            });
            wx.showToast({
              title: res.msg || '点赞失败',
              icon: 'none',
              duration: 2000
            });
          }
        }).catch(err => {
          console.error('【interaction-bar】点赞失败:', err);
          // 回滚状态
          this.setData({
            isLiked: isLiked,
            likes: this.data.likes - 1
          });
          
          // 检查是否是重复点赞错误
          const errorMsg = err.message || err.msg || '';
          if (errorMsg.includes('已经点过赞') || errorMsg.includes('重复点赞')) {
            wx.showToast({
              title: '你已经点过赞了',
              icon: 'none',
              duration: 2000
            });
            // 保持点赞状态
            this.setData({
              isLiked: true,
              likes: this.data.likes + 1
            });
          } else {
            wx.showToast({
              title: '操作失败',
              icon: 'none',
              duration: 2000
            });
          }
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
