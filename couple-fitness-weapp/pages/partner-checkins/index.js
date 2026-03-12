/**
 * 对方的打卡记录页面
 */

import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

const { checkInAPI } = require('../../utils/api');
const storage = require('../../utils/storage');

Page({
  data: {
    partnerId: null,
    partnerName: '对方',
    checkInList: [],
    loading: false,
    hasMore: true,
    pageNum: 1,
    pageSize: 10,
    currentUserId: null
  },
  
  // 标记数据是否已更新
  dataChanged: false,

  onLoad(options) {
    const { partnerId, partnerName } = options;
    
    if (!partnerId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({
      partnerId: parseInt(partnerId),
      partnerName: decodeURIComponent(partnerName || '对方'),
      currentUserId: storage.getUserId()
    });
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: `${this.data.partnerName}的打卡记录`
    });
    
    this.loadCheckInList();
  },

  /**
   * 加载打卡记录列表
   */
  async loadCheckInList(isLoadMore = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const { partnerId, pageNum, pageSize, checkInList } = this.data;
      
      // 调用新的API获取指定用户的打卡记录
      const response = await checkInAPI.getCheckInRecordsByUserId(partnerId, {
        pageNum: isLoadMore ? pageNum : 1,
        pageSize: pageSize
      });
      
      console.log('【对方打卡记录】API响应:', response);
      
      let records = [];
      if (response && response.rows) {
        records = response.rows;
      } else if (response && response.data) {
        records = Array.isArray(response.data) ? response.data : [];
      }
      
      console.log('【对方打卡记录】解析后的记录数:', records.length);
      
      // 如果返回空数据,可能是隐私设置关闭了
      if (records.length === 0 && !isLoadMore) {
        Toast.fail('对方已关闭打卡记录查看权限');
      }
      
      // 格式化记录
      const formattedRecords = this.formatRecords(records);
      
      this.setData({
        checkInList: isLoadMore ? [...checkInList, ...formattedRecords] : formattedRecords,
        hasMore: records.length >= pageSize,
        pageNum: isLoadMore ? pageNum + 1 : 2,
        loading: false
      });
      
      console.log('【对方打卡记录】页面数据更新完成，记录数:', this.data.checkInList.length);
    } catch (error) {
      console.error('【对方打卡记录】加载失败:', error);
      Toast.fail('加载失败，请重试');
      this.setData({ loading: false });
    }
  },

  /**
   * 格式化打卡记录
   */
  formatRecords(records) {
    const { partnerName } = this.data;
    
    return records.map(record => {
      const checkInDate = new Date(record.checkInDate || record.createdAt);
      const now = new Date();
      const isToday = checkInDate.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = checkInDate.toDateString() === yesterday.toDateString();
      
      let timeStr = '';
      if (isToday) {
        timeStr = '今天 ' + this.formatTime(record.createdAt);
      } else if (isYesterday) {
        timeStr = '昨天 ' + this.formatTime(record.createdAt);
      } else {
        timeStr = `${checkInDate.getMonth() + 1}月${checkInDate.getDate()}日 ${this.formatTime(record.createdAt)}`;
      }
      
      return {
        recordId: record.recordId,
        userId: record.userId,
        nickname: partnerName,
        avatar: record.avatar || '',
        exerciseType: this.getExerciseTypeName(record.exerciseType),
        duration: record.duration || 0,
        calories: Math.round(record.calories || 0),
        photoUrl: record.photoUrl || '',
        checkInTime: timeStr,
        likeCount: record.likeCount || 0,
        commentCount: record.commentCount || 0,
        hasLiked: record.hasLiked || false
      };
    });
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  /**
   * 获取运动类型名称
   */
  getExerciseTypeName(type) {
    const typeMap = {
      'home': '居家运动',
      'gym': '健身房',
      'outdoor': '户外运动',
      'running': '跑步',
      'yoga': '瑜伽',
      'strength': '力量训练'
    };
    return typeMap[type] || type || '运动';
  },

  /**
   * 点赞状态变化
   */
  onLikeChange(e) {
    const { recordId, isLiked, likeCount } = e.detail;
    
    // 更新本地数据
    const checkInList = this.data.checkInList.map(item => {
      if (item.recordId === recordId) {
        return {
          ...item,
          hasLiked: isLiked,
          likeCount: likeCount
        };
      }
      return item;
    });
    
    this.setData({ checkInList });
    
    // 使用 Vant Toast 显示提示
    Toast.success(isLiked ? '点赞成功' : '取消点赞');
    
    // 标记数据已更新，返回时需要刷新首页
    this.dataChanged = true;
  },

  /**
   * 点击评论
   */
  onComment(e) {
    const { recordId } = e.detail;
    console.log('点击评论:', recordId);
    
    // 跳转到打卡详情页面
    if (!recordId) {
      wx.showToast({
        title: '记录ID不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/checkin-detail/index?recordId=${recordId}`
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadCheckInList().then(() => {
      wx.stopPullDownRefresh();
      Toast.success('刷新成功');
    }).catch(() => {
      wx.stopPullDownRefresh();
      Toast.fail('刷新失败');
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCheckInList(true);
    }
  },
  
  /**
   * 页面卸载时，如果数据有更新，通知首页刷新
   */
  onUnload() {
    if (this.dataChanged) {
      // 获取首页实例
      const pages = getCurrentPages();
      if (pages.length > 1) {
        const prevPage = pages[pages.length - 2];
        // 如果上一页是首页，触发刷新
        if (prevPage.route === 'pages/index/index') {
          prevPage.silentRefresh && prevPage.silentRefresh();
        }
      }
    }
  },
  
  /**
   * 返回首页
   */
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  }
});
