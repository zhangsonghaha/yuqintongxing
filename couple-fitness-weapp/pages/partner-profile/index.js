/**
 * 伴侣个人主页
 */

import Toast from '@vant/weapp/toast/toast';

const { checkInAPI, achievementAPI } = require('../../utils/api');
const storage = require('../../utils/storage');

Page({
  data: {
    partnerId: null,
    partnerInfo: null,
    
    // 统计数据
    stats: {
      totalCheckIns: 0,
      consecutiveDays: 0,
      maxConsecutiveDays: 0,
      totalDuration: 0,
      totalCalories: 0
    },
    
    // 成就数据
    achievements: [],
    unlockedCount: 0,
    totalCount: 0,
    achievementsHidden: false, // 成就是否因隐私设置被隐藏
    
    // 最近打卡记录
    recentCheckIns: [],
    
    // 运动类型分布
    exerciseDistribution: [],
    
    // 加载状态
    loading: false,
    
    // 当前选中的标签页
    activeTab: 0
  },

  onLoad(options) {
    const { partnerId } = options;
    
    if (!partnerId) {
      Toast.fail('参数错误');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({
      partnerId: parseInt(partnerId)
    });
    
    this.loadData();
  },

  /**
   * 加载数据
   */
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 获取伴侣信息
      const partnerInfo = storage.getPartnerInfo();
      
      if (!partnerInfo) {
        Toast.fail('伴侣信息不存在');
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }
      
      // 设置导航栏标题
      const partnerName = partnerInfo.partnerNickname || partnerInfo.nickname || '对方';
      wx.setNavigationBarTitle({
        title: `${partnerName}的主页`
      });
      
      // 计算头像文字（取昵称第一个字符）
      partnerInfo.avatarText = partnerName.substring(0, 1);
      
      // 获取伴侣统计数据
      const statsResponse = await checkInAPI.getPartnerStatistics();
      const stats = statsResponse.data || statsResponse;
      
      // 获取伴侣成就数据
      let achievements = [];
      let unlockedCount = 0;
      let achievementsHidden = false; // 标记成就是否被隐藏
      
      try {
        console.log('【伴侣主页】开始获取成就数据，partnerId:', this.data.partnerId);
        const achievementsResponse = await achievementAPI.getAchievementsByUserId(this.data.partnerId);
        console.log('【伴侣主页】成就数据响应:', achievementsResponse);
        
        // 检查是否因为隐私设置被拒绝
        if (achievementsResponse && achievementsResponse.code !== 200) {
          console.warn('【伴侣主页】获取成就失败:', achievementsResponse.msg);
          if (achievementsResponse.msg && achievementsResponse.msg.includes('隐私')) {
            achievementsHidden = true;
          }
        } else if (achievementsResponse && achievementsResponse.code === 200) {
          achievements = achievementsResponse.data || [];
        } else if (Array.isArray(achievementsResponse)) {
          achievements = achievementsResponse;
        } else {
          console.warn('【伴侣主页】成就数据格式异常:', achievementsResponse);
        }
        
        console.log('【伴侣主页】解析后的成就数据:', achievements);
        console.log('【伴侣主页】成就数量:', achievements.length);
        
        unlockedCount = achievements.filter(a => a.unlocked).length;
        console.log('【伴侣主页】已解锁成就数量:', unlockedCount);
      } catch (error) {
        console.error('【伴侣主页】获取成就数据失败:', error);
        console.error('【伴侣主页】错误详情:', error.message);
        // 检查错误信息是否包含隐私相关
        if (error.message && error.message.includes('隐私')) {
          achievementsHidden = true;
        }
      }
      
      // 获取最近打卡记录
      let recentCheckIns = [];
      try {
        const checkInsResponse = await checkInAPI.getCheckInRecordsByUserId(this.data.partnerId, {
          pageNum: 1,
          pageSize: 6
        });
        const records = checkInsResponse.rows || checkInsResponse.data || [];
        recentCheckIns = this.formatCheckInRecords(records, partnerInfo);
      } catch (error) {
        console.error('获取打卡记录失败:', error);
      }
      
      // 处理运动类型分布
      let exerciseDistribution = [];
      if (stats.exerciseTypeDistribution && typeof stats.exerciseTypeDistribution === 'object') {
        // 将对象转换为数组格式
        exerciseDistribution = Object.entries(stats.exerciseTypeDistribution).map(([type, count]) => ({
          type: this.getExerciseTypeName(type),
          count: count,
          percentage: stats.totalCheckIns > 0 ? Math.round((count / stats.totalCheckIns) * 100) : 0
        }));
        // 按数量降序排序
        exerciseDistribution.sort((a, b) => b.count - a.count);
      }
      
      this.setData({
        partnerInfo,
        stats: {
          totalCheckIns: stats.totalCheckIns || 0,
          consecutiveDays: stats.consecutiveDays || 0,
          maxConsecutiveDays: stats.maxConsecutiveDays || stats.longestConsecutiveDays || 0,
          totalDuration: stats.totalDuration || 0,
          totalCalories: Math.round(stats.totalCalories || 0)
        },
        achievements,
        unlockedCount,
        totalCount: achievements.length,
        achievementsHidden, // 添加隐私标记
        recentCheckIns,
        exerciseDistribution,
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      Toast.fail('加载失败');
      this.setData({ loading: false });
    }
  },

  /**
   * 格式化打卡记录
   */
  formatCheckInRecords(records, partnerInfo) {
    const partnerName = partnerInfo.partnerNickname || partnerInfo.nickname || '对方';
    const partnerAvatar = partnerInfo.partnerAvatar || partnerInfo.avatar || '';
    
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
        timeStr = `${checkInDate.getMonth() + 1}月${checkInDate.getDate()}日`;
      }
      
      return {
        recordId: record.recordId,
        userId: record.userId,
        nickname: partnerName,
        avatar: partnerAvatar,
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
   * 切换标签页
   */
  onTabChange(e) {
    this.setData({
      activeTab: e.detail.index
    });
  },

  /**
   * 查看所有打卡记录
   */
  viewAllCheckIns() {
    const { partnerId, partnerInfo } = this.data;
    const partnerName = partnerInfo.partnerNickname || partnerInfo.nickname || '对方';
    
    wx.navigateTo({
      url: `/pages/partner-checkins/index?partnerId=${partnerId}&partnerName=${encodeURIComponent(partnerName)}`
    });
  },

  /**
   * 查看所有成就
   */
  viewAllAchievements() {
    const { partnerId } = this.data;
    
    wx.navigateTo({
      url: `/pages/partner-achievements/index?partnerId=${partnerId}`
    });
  },

  /**
   * 点击打卡记录
   */
  onCheckInTap(e) {
    const { recordid } = e.currentTarget.dataset;
    
    if (!recordid) {
      Toast.fail('记录ID不存在');
      return;
    }
    
    wx.navigateTo({
      url: `/pages/checkin-detail/index?recordId=${recordid}`
    });
  },

  /**
   * 点击成就徽章
   */
  onAchievementTap(e) {
    const { achievement } = e.currentTarget.dataset;
    
    if (!achievement) return;
    
    wx.showModal({
      title: achievement.badgeName,
      content: achievement.badgeDescription,
      showCancel: false
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
      Toast.success('刷新成功');
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 返回
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
