// pages/checkin-detail/index.js
const api = require('../../utils/api');

Page({
  data: {
    recordId: null,
    record: null,
    loading: true,
    comments: [],
    showDeleteDialog: false,
    currentUserId: null,
    // 回复模式相关
    replyMode: false,
    replyToId: null,
    replyToUserId: null,
    replyToUserName: '',
    replyPlaceholder: '说点什么...'
  },

  onLoad(options) {
    // 获取当前用户ID
    const currentUserId = wx.getStorageSync('userId');
    this.setData({ currentUserId: currentUserId });
    
    if (options.recordId) {
      this.setData({ recordId: options.recordId });
      this.loadCheckInDetail();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载打卡详情
   */
  loadCheckInDetail() {
    this.setData({ loading: true });
    
    api.checkInAPI.getCheckInById(this.data.recordId)
      .then(res => {
        if (res.code === 200 && res.data) {
          // 处理数据,添加必要的字段
          const record = res.data;
          
          // 判断是否是自己的记录
          const currentUserId = wx.getStorageSync('userId');
          record.isOwn = (record.userId === currentUserId);
          
          console.log('[详情页] 打卡记录加载成功:', record);
          console.log('[详情页] 点赞状态 hasLiked:', record.hasLiked);
          console.log('[详情页] 点赞数量:', record.likeCount);
          
          this.setData({
            record: record,
            loading: false
          });
          
          // 加载评论(如果加载失败不影响主流程)
          this.loadComments();
        } else {
          throw new Error(res.msg || '获取打卡详情失败');
        }
      })
      .catch(err => {
        console.error('加载打卡详情失败:', err);
        wx.showToast({
          title: err.message || '加载失败',
          icon: 'error'
        });
        this.setData({ loading: false });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      });
  },

  /**
   * 加载评论列表
   */
  loadComments() {
    api.interactionAPI.getComments(this.data.recordId)
      .then(res => {
        if (res.code === 200) {
          // 后端直接返回评论数组
          const comments = Array.isArray(res.data) ? res.data : [];
          
          console.log('[详情页] 加载评论成功:', comments);
          
          this.setData({
            comments: comments
          });
        }
      })
      .catch(err => {
        console.error('[详情页] 加载评论失败:', err);
        // 评论加载失败不影响主流程
        this.setData({ comments: [] });
      });
  },

  /**
   * 点赞/取消点赞
   */
  onLikeChange(e) {
    const { isLiked, likeCount } = e.detail;
    const record = this.data.record;
    
    console.log('[详情页] 点赞状态变化:', { 
      isLiked, 
      likeCount,
      当前状态: record.hasLiked 
    });
    
    // 直接使用组件传递的最新状态
    record.hasLiked = isLiked;
    record.likeCount = likeCount;
    
    this.setData({ record });
    
    console.log('[详情页] 更新后的点赞状态:', { 
      hasLiked: record.hasLiked, 
      likeCount: record.likeCount 
    });
  },

  /**
   * 点击评论按钮
   */
  onComment() {
    console.log('[详情页] 点击评论按钮');
    // 滚动到评论输入框
    wx.pageScrollTo({
      selector: '.comment-input-wrapper',
      duration: 300
    });
  },

  /**
   * 评论成功
   */
  onCommentSuccess(e) {
    console.log('[详情页] 评论成功:', e.detail);
    // 刷新评论列表
    this.loadComments();
    
    // 更新评论数
    const record = this.data.record;
    record.commentCount = (record.commentCount || 0) + 1;
    this.setData({ record });
    
    // 如果是回复模式,取消回复模式
    if (this.data.replyMode) {
      this.cancelReply();
    }
  },

  /**
   * 回复评论
   */
  onReplyComment(e) {
    const { interactionId, userId, userName } = e.currentTarget.dataset;
    console.log('[详情页] 回复评论 - 从dataset读取:', { interactionId, userId, userName });
    
    // 确保所有值都有效
    if (!interactionId || !userId || !userName) {
      console.error('[详情页] 回复评论参数无效:', { interactionId, userId, userName });
      wx.showToast({
        title: '回复参数错误',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      replyMode: true,
      replyToId: interactionId,
      replyToUserId: userId,
      replyToUserName: userName,
      replyPlaceholder: `回复 @${userName}`
    });
    
    console.log('[详情页] 回复模式已设置:', this.data);
    
    // 滚动到评论输入框
    wx.pageScrollTo({
      selector: '.comment-input-wrapper',
      duration: 300
    });
  },

  /**
   * 取消回复
   */
  cancelReply() {
    this.setData({
      replyMode: false,
      replyToId: null,
      replyToUserId: null,
      replyToUserName: '',
      replyPlaceholder: '说点什么...'
    });
  },

  /**
   * 互动更新
   */
  onInteractionUpdate() {
    this.loadCheckInDetail();
  },

  /**
   * 删除打卡记录
   */
  handleDelete() {
    this.setData({ showDeleteDialog: true });
  },

  /**
   * 确认删除
   */
  confirmDelete() {
    wx.showLoading({ title: '删除中...' });
    
    api.checkInAPI.deleteCheckIn(this.data.recordId)
      .then(res => {
        wx.hideLoading();
        if (res.code === 200) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          throw new Error(res.msg || '删除失败');
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: err.message || '删除失败',
          icon: 'error'
        });
      });
  },

  /**
   * 取消删除
   */
  cancelDelete() {
    this.setData({ showDeleteDialog: false });
  },

  /**
   * 删除评论
   */
  onDeleteComment(e) {
    const { interactionId } = e.currentTarget.dataset;
    const currentUserId = this.data.currentUserId;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });

          api.interactionAPI.deleteComment(interactionId, currentUserId)
            .then(res => {
              wx.hideLoading();
              if (res.code === 200) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                // 刷新评论列表
                this.loadComments();
                // 更新评论数
                const record = this.data.record;
                record.commentCount = Math.max((record.commentCount || 0) - 1, 0);
                this.setData({ record });
              } else {
                wx.showToast({
                  title: res.msg || '删除失败',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
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
   * 查看位置
   */
  viewLocation() {
    const { latitude, longitude, location } = this.data.record;
    
    if (!latitude || !longitude) {
      wx.showToast({
        title: '无位置信息',
        icon: 'none'
      });
      return;
    }
    
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name: location || '打卡位置',
      scale: 15
    });
  },

  /**
   * 预览图片
   */
  previewPhoto() {
    const { photoUrl } = this.data.record;
    
    if (!photoUrl) {
      return;
    }
    
    wx.previewImage({
      urls: [photoUrl],
      current: photoUrl
    });
  }
});
