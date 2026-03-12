/**
 * 首页
 */

import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

const { checkInAPI, achievementAPI } = require('../../utils/api');
const api = require('../../utils/api');
const request = require('../../utils/request');
const storage = require('../../utils/storage');
const { getToday } = require('../../utils/date');
const realtimeUpdater = require('../../utils/realtime');

Page({
  data: {
    // 用户信息
    userInfo: null,
    partnerInfo: null,
    
    // 打卡状态
    todayStatus: {
      userCheckedIn: false,
      partnerCheckedIn: false,
      userCheckInTime: '',
      partnerCheckInTime: ''
    },
    
    // 成就数据
    consecutiveDays: 0,
    level: 1,
    experience: 0,
    
    // 最近打卡记录
    recentCheckIns: [],
    
    // 加载状态
    loading: false,
    error: null,
    
    // 实时更新状态
    isPageVisible: true,
    lastUpdateTime: null
  },

  onLoad() {
    this.loadData();
    this.setupRealtimeUpdate();
  },

  onShow() {
    // 每次显示时刷新数据
    this.setData({ isPageVisible: true });
    this.loadData();
    // 恢复轮询
    this.resumeRealtimeUpdate();
  },

  onHide() {
    // 页面隐藏时暂停轮询
    this.setData({ isPageVisible: false });
    this.pauseRealtimeUpdate();
  },

  onUnload() {
    // 页面卸载时停止轮询
    this.stopRealtimeUpdate();
  },

  /**
   * 加载数据
   */
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 获取用户信息
      const userInfo = storage.getUserInfo();
      console.log('【首页】用户信息:', userInfo);
      
      if (!userInfo || !userInfo.userId) {
        console.error('【首页】用户信息不完整，跳转到登录页');
        wx.redirectTo({
          url: '/pages/login/index'
        });
        return;
      }
      
      // 从后端获取伴侣信息
      let partnerInfo = null;
      try {
        const partnerRes = await request.get(api.partnership.partner);
        console.log('【首页】伴侣信息响应:', partnerRes);
        if (partnerRes.code === 200 && partnerRes.data) {
          partnerInfo = partnerRes.data;
          // 保存到本地存储
          storage.setPartnerInfo(partnerInfo);
        }
      } catch (error) {
        console.log('【首页】获取伴侣信息失败，可能未配对:', error);
        // 清除本地存储的过期数据
        storage.setPartnerInfo(null);
      }
      
      // 获取用户统计数据
      let userStats = {
        todayCheckedIn: false,
        todayCheckInTime: null,
        weeklyCheckIns: 0,
        weeklyDuration: 0,
        weeklyCalories: 0,
        consecutiveDays: 0
      };
      try {
        const userStatsResponse = await checkInAPI.getStatistics();
        console.log('【首页】用户统计数据响应:', userStatsResponse);
        console.log('【首页】用户统计数据 - todayCheckedIn:', userStatsResponse.data ? userStatsResponse.data.todayCheckedIn : 'data为空');
        console.log('【首页】用户统计数据 - todayCheckInTime:', userStatsResponse.data ? userStatsResponse.data.todayCheckInTime : 'data为空');
        userStats = userStatsResponse.data || userStatsResponse;
        console.log('【首页】解析后的 userStats:', userStats);
        console.log('【首页】解析后的 todayCheckedIn:', userStats.todayCheckedIn);
      } catch (error) {
        console.error('【首页】获取用户统计数据失败:', error);
        // 使用默认值
      }
      
      // 获取伴侣统计数据（仅在已配对时）
      let partnerStats = {
        todayCheckedIn: false,
        todayCheckInTime: null,
        weeklyCheckIns: 0,
        weeklyDuration: 0,
        weeklyCalories: 0
      };
      if (partnerInfo) {
        try {
          const partnerStatsResponse = await checkInAPI.getPartnerStatistics();
          console.log('【首页】伴侣统计数据响应:', partnerStatsResponse);
          partnerStats = partnerStatsResponse.data || partnerStatsResponse;
        } catch (error) {
          console.error('【首页】获取伴侣统计数据失败:', error);
          // 使用默认值
        }
      }
      
      // 获取成就数据（暂时使用默认值，成就系统尚未实现）
      let levelInfo = {
        level: 1,
        experience: 0
      };
      // TODO: 等成就系统实现后再启用
      // try {
      //   const levelInfoResponse = await achievementAPI.getLevelInfo();
      //   console.log('【首页】成就数据响应:', levelInfoResponse);
      //   levelInfo = levelInfoResponse.data || levelInfoResponse;
      // } catch (error) {
      //   console.error('【首页】获取成就数据失败:', error);
      //   // 使用默认值
      // }
      
      // 获取最近打卡记录（双方的最近3条，共6条）
      let recentCheckIns = [];
      try {
        console.log('【首页】开始获取最近打卡记录...');
        // 获取用户自己的打卡记录
        const userResponse = await checkInAPI.getRecentCheckIns(3);
        console.log('【首页】用户打卡记录响应:', JSON.stringify(userResponse));
        
        let userRecords = [];
        if (userResponse && userResponse.data) {
          userRecords = Array.isArray(userResponse.data) ? userResponse.data : [];
        } else if (Array.isArray(userResponse)) {
          userRecords = userResponse;
        }
        
        // 如果有伴侣，获取伴侣的打卡记录
        let partnerRecords = [];
        // 后端返回的字段是 partnerId，不是 userId
        const partnerId = partnerInfo ? (partnerInfo.partnerId || partnerInfo.userId) : null;
        if (partnerId) {
          try {
            // TODO: 需要后端提供获取伴侣打卡记录的API
            // 暂时使用相同的API，后续需要修改
            console.log('【首页】获取伴侣打卡记录...');
          } catch (error) {
            console.error('【首页】获取伴侣打卡记录失败:', error);
          }
        }
        
        // 合并双方的打卡记录
        recentCheckIns = [...userRecords, ...partnerRecords];
        
        // 按时间倒序排序
        recentCheckIns.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.checkInDate).getTime();
          const timeB = new Date(b.createdAt || b.checkInDate).getTime();
          return timeB - timeA;
        });
        
        // 只取最近6条
        recentCheckIns = recentCheckIns.slice(0, 6);
        
        console.log('【首页】合并后的打卡记录:', recentCheckIns);
        console.log('【首页】打卡记录数量:', recentCheckIns.length);
      } catch (error) {
        console.error('【首页】获取最近打卡记录失败:', error);
        console.error('【首页】错误详情:', error.message);
        recentCheckIns = [];
      }
      
      // 构建今日状态对象
      const todayStatus = {
        userCheckedIn: userStats.todayCheckedIn || false,
        partnerCheckedIn: partnerStats.todayCheckedIn || false,
        userCheckInTime: userStats.todayCheckInTime ? this.formatTime(userStats.todayCheckInTime) : '',
        partnerCheckInTime: partnerStats.todayCheckInTime ? this.formatTime(partnerStats.todayCheckInTime) : ''
      };
      
      // 格式化打卡记录
      console.log('【首页】准备格式化打卡记录:', {
        recentCheckIns: recentCheckIns,
        isArray: Array.isArray(recentCheckIns),
        length: recentCheckIns ? recentCheckIns.length : 'null',
        userInfo: userInfo,
        partnerInfo: partnerInfo
      });
      const formattedCheckIns = this.formatCheckInRecords(recentCheckIns, userInfo, partnerInfo);
      console.log('【首页】格式化后的打卡记录:', formattedCheckIns);
      
      this.setData({
        userInfo,
        partnerInfo,
        todayStatus,
        consecutiveDays: userStats.consecutiveDays || 0,
        level: levelInfo.level || 1,
        experience: levelInfo.experience || 0,
        recentCheckIns: formattedCheckIns,
        // 添加统计数据
        userStats: userStats,
        partnerStats: partnerStats,
        loading: false,
        error: null
      });
      
      console.log('【首页】数据加载完成');
    } catch (error) {
      console.error('【首页】加载数据失败:', error);
      this.setData({
        error: error.message || '加载失败',
        loading: false
      });
      Toast.fail(error.message || '加载失败');
    }
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
   * 格式化打卡记录
   */
  formatCheckInRecords(records, userInfo, partnerInfo) {
    console.log('formatCheckInRecords 被调用:', {
      records: records,
      recordsType: typeof records,
      isArray: Array.isArray(records)
    });
    
    // 验证 records 是否为数组
    if (!records) {
      console.log('records 为空，返回空数组');
      return [];
    }
    if (!Array.isArray(records)) {
      console.warn('records 不是数组:', records);
      return [];
    }
    if (records.length === 0) {
      console.log('records 是空数组');
      return [];
    }
    
    console.log('开始格式化', records.length, '条记录');
    return records.map(record => {
      // 判断是用户还是伴侣的记录
      const isUser = record.userId === (userInfo ? userInfo.userId : null);
      const owner = isUser ? userInfo : partnerInfo;
      
      // 获取昵称和头像（兼容不同的字段名）
      let nickname = '用户';
      let avatar = '';
      if (owner) {
        if (isUser) {
          nickname = owner.nickname || owner.nickName || '用户';
          avatar = owner.avatar || '';
        } else {
          // 伴侣信息使用 partnerNickname 和 partnerAvatar
          nickname = owner.partnerNickname || owner.nickname || '对方';
          avatar = owner.partnerAvatar || owner.avatar || '';
        }
      }
      
      // 格式化时间
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
        nickname: nickname,
        avatar: avatar,
        exerciseType: this.getExerciseTypeName(record.exerciseType),
        duration: record.duration || 0,
        calories: Math.round(record.calories || 0),
        photoUrl: record.photoUrl || '',
        checkInTime: timeStr
      };
    });
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
   * 打卡
   */
  handleCheckIn() {
    // 检查是否已打卡
    if (this.data.todayStatus.userCheckedIn) {
      Toast.success('今天已打卡');
      return;
    }
    
    // 导航到打卡页面
    wx.navigateTo({
      url: '/pages/checkin/index',
      fail: (err) => {
        Toast.fail('打卡页面加载失败');
      }
    });
  },

  /**
   * 叫醒对方
   */
  handleWakeUp() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  /**
   * 查看日历
   */
  handleViewCalendar() {
    wx.switchTab({
      url: '/pages/calendar/calendar'
    });
  },

  /**
   * 跳转到配对页面
   */
  goToPartnership(e) {
    // 阻止事件冒泡
    if (e) {
      e.stopPropagation();
    }
    wx.navigateTo({
      url: '/pages/partnership/index'
    });
  },
  
  /**
   * 查看对方的打卡记录
   */
  goToPartnerCheckIns() {
    const { partnerInfo } = this.data;
    
    if (!partnerInfo) {
      Toast.fail('还没有配对伴侣');
      return;
    }
    
    // 后端返回的字段是 partnerId，不是 userId
    const partnerId = partnerInfo.partnerId || partnerInfo.userId;
    const partnerName = partnerInfo.partnerNickname || partnerInfo.nickname || '对方';
    
    if (!partnerId) {
      console.error('【首页】partnerId为空:', partnerInfo);
      Toast.fail('伴侣信息异常');
      return;
    }
    
    console.log('【首页】跳转到对方打卡记录页面:', { partnerId, partnerName });
    
    // 跳转到对方的打卡记录页面
    wx.navigateTo({
      url: `/pages/partner-checkins/index?partnerId=${partnerId}&partnerName=${encodeURIComponent(partnerName)}`
    });
  },
  
  /**
   * 点击打卡记录卡片
   */
  onCheckInCardTap(e) {
    const { recordId } = e.detail;
    console.log('点击打卡记录:', recordId);
    
    if (!recordId) {
      wx.showToast({
        title: '记录ID不存在',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到打卡详情页面
    wx.navigateTo({
      url: `/pages/checkin-detail/index?recordId=${recordId}`
    });
  },

  /**
   * 点赞状态变化
   */
  onLikeChange(e) {
    const { recordId, isLiked, likeCount } = e.detail;
    console.log('点赞状态变化:', { recordId, isLiked, likeCount });
    
    // 更新本地数据
    const recentCheckIns = this.data.recentCheckIns.map(item => {
      if (item.recordId === recordId) {
        return {
          ...item,
          hasLiked: isLiked,
          likeCount: likeCount
        };
      }
      return item;
    });
    
    this.setData({ recentCheckIns });
  },

  /**
   * 点击评论按钮
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
   * 互动更新事件处理
   */
  onInteractionUpdate(e) {
    const { type, recordId } = e.detail;
    console.log('互动更新:', type, recordId);
    
    // 立即触发一次静默刷新
    this.silentRefresh();
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
      Toast.fail('刷新失败');
    });
  },

  /**
   * 设置实时更新
   */
  setupRealtimeUpdate() {
    // 开发阶段：禁用自动轮询，减少日志输出
    // 生产环境：取消注释以下代码启用轮询
    
    /*
    // 添加更新回调
    realtimeUpdater.addCallback(() => {
      if (this.data.isPageVisible) {
        this.silentRefresh();
      }
    });
    
    // 开始轮询（5分钟间隔，减少服务器压力）
    realtimeUpdater.startPolling(() => {
      if (this.data.isPageVisible) {
        this.silentRefresh();
      }
    }, 300000); // 300秒 = 5分钟
    */
  },

  /**
   * 恢复实时更新
   */
  resumeRealtimeUpdate() {
    // 开发阶段：禁用自动轮询
    /*
    if (!realtimeUpdater.isPolling) {
      realtimeUpdater.startPolling(() => {
        if (this.data.isPageVisible) {
          this.silentRefresh();
        }
      }, 300000); // 300秒 = 5分钟
    }
    */
  },

  /**
   * 暂停实时更新
   */
  pauseRealtimeUpdate() {
    realtimeUpdater.stopPolling();
  },

  /**
   * 停止实时更新
   */
  stopRealtimeUpdate() {
    realtimeUpdater.stopPolling();
    realtimeUpdater.clearCallbacks();
  },

  /**
   * 静默刷新（不显示加载状态）
   */
  async silentRefresh() {
    try {
      // 获取用户信息
      const userInfo = storage.getUserInfo();
      
      // 从后端获取伴侣信息
      let partnerInfo = null;
      try {
        const partnerRes = await request.get(api.partnership.partner);
        if (partnerRes.code === 200 && partnerRes.data) {
          partnerInfo = partnerRes.data;
          // 保存到本地存储
          storage.setPartnerInfo(partnerInfo);
        }
      } catch (error) {
        console.log('静默刷新：获取伴侣信息失败');
        // 使用本地缓存
        partnerInfo = storage.getPartnerInfo();
      }
      
      // 获取用户统计数据
      let userStats = {
        todayCheckedIn: false,
        todayCheckInTime: null,
        weeklyCheckIns: 0,
        weeklyDuration: 0,
        weeklyCalories: 0,
        consecutiveDays: 0
      };
      try {
        const userStatsResponse = await checkInAPI.getStatistics();
        userStats = userStatsResponse.data || userStatsResponse;
      } catch (error) {
        console.error('静默刷新：获取用户统计数据失败:', error);
      }
      
      // 获取伴侣统计数据（仅在已配对时）
      let partnerStats = {
        todayCheckedIn: false,
        todayCheckInTime: null,
        weeklyCheckIns: 0,
        weeklyDuration: 0,
        weeklyCalories: 0
      };
      if (partnerInfo) {
        try {
          const partnerStatsResponse = await checkInAPI.getPartnerStatistics();
          partnerStats = partnerStatsResponse.data || partnerStatsResponse;
        } catch (error) {
          console.error('静默刷新：获取伴侣统计数据失败:', error);
        }
      }
      
      // 获取成就数据（暂时使用默认值）
      let levelInfo = {
        level: 1,
        experience: 0
      };
      
      // 获取最近打卡记录（最近3条）
      let recentCheckIns = [];
      try {
        const response = await checkInAPI.getRecentCheckIns(3);
        
        // 处理不同的响应格式
        if (response && response.data) {
          recentCheckIns = Array.isArray(response.data) ? response.data : [];
        } else if (response && response.rows) {
          recentCheckIns = Array.isArray(response.rows) ? response.rows : [];
        } else if (Array.isArray(response)) {
          recentCheckIns = response;
        } else {
          recentCheckIns = [];
        }
      } catch (error) {
        console.error('静默刷新：获取最近打卡记录失败:', error);
        recentCheckIns = [];
      }
      
      // 构建今日状态对象
      const todayStatus = {
        userCheckedIn: userStats.todayCheckedIn || false,
        partnerCheckedIn: partnerStats.todayCheckedIn || false,
        userCheckInTime: userStats.todayCheckInTime ? this.formatTime(userStats.todayCheckInTime) : '',
        partnerCheckInTime: partnerStats.todayCheckInTime ? this.formatTime(partnerStats.todayCheckInTime) : ''
      };
      
      // 格式化打卡记录
      const formattedCheckIns = this.formatCheckInRecords(recentCheckIns, userInfo, partnerInfo);
      
      // 检查是否有新数据
      const hasNewData = this.checkForNewData(formattedCheckIns, todayStatus);
      
      this.setData({
        userInfo,
        partnerInfo,
        todayStatus,
        consecutiveDays: userStats.consecutiveDays || 0,
        level: levelInfo.level || 1,
        experience: levelInfo.experience || 0,
        recentCheckIns: formattedCheckIns,
        userStats: userStats,
        partnerStats: partnerStats,
        lastUpdateTime: Date.now()
      });
      
      // 如果有新数据，显示提示
      if (hasNewData) {
        console.log('检测到新数据');
      }
    } catch (error) {
      console.error('静默刷新失败:', error);
    }
  },

  /**
   * 检查是否有新数据
   */
  checkForNewData(newCheckIns, newTodayStatus) {
    const oldCheckIns = this.data.recentCheckIns;
    const oldTodayStatus = this.data.todayStatus;
    
    // 检查打卡状态是否变化
    if (newTodayStatus.userCheckedIn !== oldTodayStatus.userCheckedIn ||
        newTodayStatus.partnerCheckedIn !== oldTodayStatus.partnerCheckedIn) {
      return true;
    }
    
    // 检查打卡记录数量是否变化
    if (newCheckIns.length !== oldCheckIns.length) {
      return true;
    }
    
    // 检查第一条记录是否变化（最新的记录）
    if (newCheckIns.length > 0 && oldCheckIns.length > 0) {
      if (newCheckIns[0].recordId !== oldCheckIns[0].recordId) {
        return true;
      }
    }
    
    return false;
  }
});
