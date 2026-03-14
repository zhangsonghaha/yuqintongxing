// pages/achievement/index.js
const api = require('../../utils/api');

// 徽章配置
const BADGE_CONFIG = {
  FIRST_CHECKIN: {
    name: '首次打卡',
    icon: '🎯',
    description: '完成第一次健身打卡',
    unlockCondition: '完成1次打卡即可解锁',
    detailedCondition: '只要完成任意一次健身打卡，无论运动类型和时长，即可解锁此徽章。',
    tips: '💡 这是最容易获得的徽章，开始你的健身之旅吧！'
  },
  STREAK_7: {
    name: '连续7天',
    icon: '🔥',
    description: '连续打卡7天',
    unlockCondition: '连续7天每天至少打卡1次',
    detailedCondition: '需要连续7天，每天至少完成1次打卡。如果中间有一天未打卡，连续天数将重新计算。',
    tips: '💡 坚持就是胜利！养成每天运动的好习惯。'
  },
  STREAK_30: {
    name: '连续30天',
    icon: '💪',
    description: '连续打卡30天',
    unlockCondition: '连续30天每天至少打卡1次',
    detailedCondition: '需要连续30天，每天至少完成1次打卡。这是对毅力的真正考验，中断后需要重新开始累计。',
    tips: '💡 30天养成一个习惯！和TA一起坚持下去。'
  },
  TOTAL_100: {
    name: '累计100次',
    icon: '⭐',
    description: '累计打卡100次',
    unlockCondition: '累计完成100次打卡',
    detailedCondition: '累计打卡次数达到100次即可解锁。不要求连续，只要总次数达标即可。',
    tips: '💡 积少成多！每一次打卡都在向目标迈进。'
  },
  COUPLE_GOAL: {
    name: '情侣目标',
    icon: '💑',
    description: '完成情侣共同目标',
    unlockCondition: '你和伴侣各自完成50次打卡',
    detailedCondition: '需要你和你的伴侣各自累计完成至少50次打卡。双方都达标后，两人同时解锁此徽章。',
    tips: '💡 一起努力，一起进步！这是属于你们的共同成就。'
  }
};

Page({
  data: {
    loading: true,
    achievements: [],
    unlockedCount: 0,
    totalCount: 5,
    showUnlockModal: false,
    newlyUnlockedBadge: null,
    confettiParticles: [],
    previousUnlockedBadges: [], // 存储上次已解锁的徽章
    shouldShowAnimation: false // 是否应该显示动画
  },

  onLoad: function(options) {
    // 检查是否需要显示动画
    const showAnimation = options.showAnimation === 'true';
    this.setData({
      shouldShowAnimation: showAnimation
    });
    
    this.loadAchievements(showAnimation);
  },

  onShow: function() {
    // 每次显示页面时刷新数据，检查是否有新解锁的成就
    this.loadAchievements(true);
  },

  /**
   * 加载成就数据
   * @param {boolean} checkNewUnlock - 是否检查新解锁的成就
   */
  loadAchievements: function(checkNewUnlock = false) {
    console.log('[成就页面] 开始加载成就数据...');
    this.setData({ loading: true });

    // 并行获取成就列表和统计数据
    Promise.all([
      api.achievementAPI.getAchievements().catch(err => {
        console.error('[成就页面] 获取成就列表失败:', err);
        return { code: 500, msg: '获取成就列表失败', data: [] };
      }),
      api.checkInAPI.getStatistics().catch(err => {
        console.error('[成就页面] 获取统计数据失败:', err);
        return { code: 500, msg: '获取统计数据失败', data: {} };
      })
    ])
      .then(([achievementRes, statsRes]) => {
        console.log('[成就页面] 成就列表响应:', achievementRes);
        console.log('[成就页面] 统计数据响应:', statsRes);
        
        // 即使接口失败，也要显示默认数据
        const stats = (statsRes && statsRes.code === 200) ? statsRes.data : {};
        const achievementList = (achievementRes && achievementRes.code === 200) ? (achievementRes.data || []) : [];
        
        const achievements = this.processAchievements(achievementList, stats);
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        
        console.log('[成就页面] 处理后的成就数据:', achievements);
        console.log('[成就页面] 已解锁数量:', unlockedCount);
        
        // 检查是否有新解锁的成就
        let newlyUnlockedBadgeType = null;
        
        // 如果是从打卡页面跳转过来的，显示最新解锁的成就动画
        if (this.data.shouldShowAnimation && unlockedCount > 0) {
          // 找到最新解锁的成就（按解锁时间排序）
          const sortedUnlocked = achievements
            .filter(a => a.unlocked)
            .sort((a, b) => {
              const dateA = new Date(a.unlockedAt || 0);
              const dateB = new Date(b.unlockedAt || 0);
              return dateB - dateA; // 降序，最新的在前
            });
          
          if (sortedUnlocked.length > 0) {
            const latestUnlocked = sortedUnlocked[0];
            newlyUnlockedBadgeType = latestUnlocked.badgeType;
            console.log('[成就页面] 显示最新解锁的徽章:', newlyUnlockedBadgeType);
            // 延迟显示动画，确保页面已渲染
            setTimeout(() => {
              this.showUnlockAnimation(latestUnlocked);
            }, 300);
            // 重置标志，避免重复显示
            this.setData({ shouldShowAnimation: false });
          }
        } else if (checkNewUnlock && this.data.previousUnlockedBadges.length > 0) {
          // 正常的新解锁检查逻辑
          const newlyUnlocked = this.findNewlyUnlockedBadge(achievements);
          if (newlyUnlocked) {
            newlyUnlockedBadgeType = newlyUnlocked.badgeType;
            console.log('[成就页面] 发现新解锁的徽章:', newlyUnlockedBadgeType);
            // 延迟显示动画，确保页面已渲染
            setTimeout(() => {
              this.showUnlockAnimation(newlyUnlocked);
            }, 300);
          }
        }
        
        // 标记新解锁的徽章
        if (newlyUnlockedBadgeType) {
          achievements.forEach(a => {
            a.isNewlyUnlocked = (a.badgeType === newlyUnlockedBadgeType);
          });
        }
        
        this.setData({
          achievements: achievements,
          unlockedCount: unlockedCount,
          loading: false,
          previousUnlockedBadges: achievements.filter(a => a.unlocked).map(a => a.badgeType)
        });
        
        console.log('[成就页面] 数据加载完成');
        
        // 如果接口失败，显示提示
        if (achievementRes && achievementRes.code !== 200) {
          wx.showToast({
            title: achievementRes.msg || '获取成就数据失败',
            icon: 'none',
            duration: 2000
          });
        }
      })
      .catch(err => {
        console.error('[成就页面] 加载成就失败:', err);
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
        
        // 即使失败也要设置 loading 为 false，并显示默认数据
        const achievements = this.processAchievements([], {});
        this.setData({ 
          achievements: achievements,
          unlockedCount: 0,
          loading: false 
        });
      });
  },

  /**
   * 处理成就数据
   * 将后端返回的成就列表与徽章配置合并，并计算进度
   */
  processAchievements: function(achievementList, stats = {}) {
    const achievements = [];
    
    // 遍历所有徽章类型
    for (const badgeType in BADGE_CONFIG) {
      const config = BADGE_CONFIG[badgeType];
      
      // 查找后端返回的成就数据
      const achievementData = achievementList.find(a => a.badgeType === badgeType);
      
      // 判断是否已解锁 - 必须检查 unlocked 字段的值
      const isUnlocked = achievementData && achievementData.unlocked === true;
      
      // 计算进度
      const progress = this.calculateProgress(badgeType, stats, isUnlocked);
      
      achievements.push({
        badgeType: badgeType,
        name: config.name,
        icon: config.icon,
        description: config.description,
        unlockCondition: config.unlockCondition,
        detailedCondition: config.detailedCondition,
        tips: config.tips,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked && achievementData ? this.formatDate(achievementData.unlockedAt) : null,
        progress: progress.current,
        progressMax: progress.max,
        progressPercent: progress.percent,
        progressText: progress.text,
        isAlmostUnlocked: progress.percent >= 80 && !isUnlocked
      });
    }
    
    return achievements;
  },

  /**
   * 计算成就进度
   */
  calculateProgress: function(badgeType, stats, isUnlocked) {
    let current = 0;
    let max = 0;
    let text = '';

    switch (badgeType) {
      case 'FIRST_CHECKIN':
        current = Math.min(stats.totalCheckIns || 0, 1);
        max = 1;
        text = `${current}/${max}次`;
        break;
      
      case 'STREAK_7':
        current = Math.min(stats.consecutiveDays || 0, 7);
        max = 7;
        text = `${current}/${max}天`;
        break;
      
      case 'STREAK_30':
        current = Math.min(stats.consecutiveDays || 0, 30);
        max = 30;
        text = `${current}/${max}天`;
        break;
      
      case 'TOTAL_100':
        current = Math.min(stats.totalCheckIns || 0, 100);
        max = 100;
        text = `${current}/${max}次`;
        break;
      
      case 'COUPLE_GOAL':
        // 情侣目标：双方各完成50次打卡
        current = Math.min(stats.totalCheckIns || 0, 50);
        max = 50;
        text = `${current}/${max}次`;
        break;
      
      default:
        current = 0;
        max = 1;
        text = '未知';
    }

    // 计算百分比，已解锁的显示100%
    const percent = isUnlocked ? 100 : Math.min(Math.round((current / max) * 100), 100);

    return {
      current,
      max,
      percent,
      text
    };
  },

  /**
   * 格式化日期
   */
  formatDate: function(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  /**
   * 点击徽章
   */
  onBadgeClick: function(e) {
    const { badge } = e.currentTarget.dataset;
    
    if (badge.unlocked) {
      // 已解锁：显示解锁信息
      wx.showModal({
        title: `🎉 ${badge.name}`,
        content: `${badge.description}\n\n解锁条件：${badge.unlockCondition}\n\n解锁时间：${badge.unlockedAt}`,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#667eea'
      });
    } else {
      // 未解锁：显示详细条件和进度
      const progressInfo = `当前进度：${badge.progressText}\n完成度：${badge.progressPercent}%`;
      const encouragement = badge.isAlmostUnlocked 
        ? '\n\n🔥 即将解锁！再接再厉！' 
        : '\n\n💪 继续努力，你可以的！';
      
      wx.showModal({
        title: `🔒 ${badge.name}`,
        content: `${badge.detailedCondition}\n\n${progressInfo}${encouragement}\n\n${badge.tips}`,
        showCancel: false,
        confirmText: '继续努力',
        confirmColor: badge.isAlmostUnlocked ? '#ffa500' : '#667eea'
      });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.loadAchievements();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 查找新解锁的徽章
   */
  findNewlyUnlockedBadge: function(currentAchievements) {
    const currentUnlocked = currentAchievements.filter(a => a.unlocked).map(a => a.badgeType);
    const newBadges = currentUnlocked.filter(badgeType => 
      !this.data.previousUnlockedBadges.includes(badgeType)
    );
    
    if (newBadges.length > 0) {
      // 返回第一个新解锁的徽章
      return currentAchievements.find(a => a.badgeType === newBadges[0]);
    }
    
    return null;
  },

  /**
   * 显示解锁动画
   */
  showUnlockAnimation: function(badge) {
    // 生成彩纸粒子
    const particles = this.generateConfetti();
    
    this.setData({
      showUnlockModal: true,
      newlyUnlockedBadge: badge,
      confettiParticles: particles
    });

    // 播放成功音效（如果需要）
    wx.vibrateShort({
      type: 'medium'
    });

    // 3秒后自动关闭
    setTimeout(() => {
      this.closeUnlockModal();
    }, 3000);
  },

  /**
   * 生成彩纸粒子
   */
  generateConfetti: function() {
    const particles = [];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    
    for (let i = 0; i < 30; i++) {
      particles.push({
        id: i,
        left: Math.random() * 100, // 0-100%
        delay: Math.random() * 0.5, // 0-0.5s
        duration: 1.5 + Math.random() * 1, // 1.5-2.5s
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8, // 8-16rpx
        rotation: Math.random() * 360 // 0-360deg
      });
    }
    
    return particles;
  },

  /**
   * 关闭解锁弹窗
   */
  closeUnlockModal: function() {
    this.setData({
      showUnlockModal: false,
      newlyUnlockedBadge: null,
      confettiParticles: [],
      shouldShowAnimation: false
    });
  },

  /**
   * 返回首页
   */
  goToHome: function() {
    // 先关闭弹窗
    this.setData({
      showUnlockModal: false,
      newlyUnlockedBadge: null,
      confettiParticles: [],
      shouldShowAnimation: false
    });
    
    // 延迟跳转,让关闭动画完成
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 300);
  }
});
