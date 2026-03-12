// pages/goal/index.js
const api = require('../../utils/api');

Page({
  data: {
    weeklyTarget: '',
    monthlyTarget: '',
    hasWeeklyGoal: false,
    hasMonthlyGoal: false,
    weeklyProgress: {
      current: 0,
      target: 0,
      percentage: 0
    },
    monthlyProgress: {
      current: 0,
      target: 0,
      percentage: 0
    },
    saving: false,
    weeklyGoalId: null,
    monthlyGoalId: null
  },

  onLoad: function(options) {
    this.loadGoals();
  },

  /**
   * 页面显示时刷新数据
   */
  onShow: function() {
    // 如果已经有目标，刷新进度
    if (this.data.hasWeeklyGoal || this.data.hasMonthlyGoal) {
      this.refreshProgress();
    }
  },

  /**
   * 刷新进度（不显示加载提示）
   */
  refreshProgress: function() {
    const promises = [];
    
    if (this.data.hasWeeklyGoal) {
      promises.push(this.checkWeeklyProgress());
    }
    
    if (this.data.hasMonthlyGoal) {
      promises.push(this.checkMonthlyProgress());
    }
    
    return Promise.all(promises);
  },

  /**
   * 加载目标数据
   */
  loadGoals: function() {
    wx.showLoading({ title: '加载中...' });
    
    Promise.all([
      this.loadWeeklyGoal(),
      this.loadMonthlyGoal()
    ]).then(() => {
      // 加载完目标后，立即刷新进度
      return this.refreshProgress();
    }).finally(() => {
      wx.hideLoading();
    });
  },

  /**
   * 加载周目标
   */
  loadWeeklyGoal: function() {
    return api.goalAPI.getActiveGoal('weekly')
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            weeklyTarget: res.data.targetValue.toString(),
            weeklyGoalId: res.data.goalId,
            hasWeeklyGoal: true
          });
          return this.checkWeeklyProgress();
        }
      })
      .catch(err => {
        console.error('加载周目标失败:', err);
      });
  },

  /**
   * 加载月目标
   */
  loadMonthlyGoal: function() {
    return api.goalAPI.getActiveGoal('monthly')
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            monthlyTarget: res.data.targetValue.toString(),
            monthlyGoalId: res.data.goalId,
            hasMonthlyGoal: true
          });
          return this.checkMonthlyProgress();
        }
      })
      .catch(err => {
        console.error('加载月目标失败:', err);
      });
  },

  /**
   * 检查周目标进度
   */
  checkWeeklyProgress: function() {
    console.log('【目标进度】开始检查周目标进度');
    return api.goalAPI.checkGoalProgress('weekly')
      .then(res => {
        console.log('【目标进度】周目标API响应:', res);
        if (res.code === 200 && res.data) {
          // 注意：后端返回的字段是 actualValue，不是 currentValue
          const current = res.data.actualValue || 0;
          const target = res.data.targetValue || 1;
          // 计算百分比，超过100%时显示100%
          const percentage = Math.min(Math.round((current / target) * 100), 100);
          
          console.log('【目标进度】周目标计算结果:', {
            current: current,
            target: target,
            percentage: percentage
          });
          
          this.setData({
            weeklyProgress: {
              current: current,
              target: target,
              percentage: percentage
            }
          });
        }
      })
      .catch(err => {
        console.error('【目标进度】检查周目标进度失败:', err);
      });
  },

  /**
   * 检查月目标进度
   */
  checkMonthlyProgress: function() {
    console.log('【目标进度】开始检查月目标进度');
    return api.goalAPI.checkGoalProgress('monthly')
      .then(res => {
        console.log('【目标进度】月目标API响应:', res);
        if (res.code === 200 && res.data) {
          // 注意：后端返回的字段是 actualValue，不是 currentValue
          const current = res.data.actualValue || 0;
          const target = res.data.targetValue || 1;
          // 计算百分比，超过100%时显示100%
          const percentage = Math.min(Math.round((current / target) * 100), 100);
          
          console.log('【目标进度】月目标计算结果:', {
            current: current,
            target: target,
            percentage: percentage
          });
          
          this.setData({
            monthlyProgress: {
              current: current,
              target: target,
              percentage: percentage
            }
          });
        }
      })
      .catch(err => {
        console.error('【目标进度】检查月目标进度失败:', err);
      });
  },

  /**
   * 周目标输入变化
   */
  onWeeklyTargetChange: function(e) {
    this.setData({
      weeklyTarget: e.detail
    });
  },

  /**
   * 月目标输入变化
   */
  onMonthlyTargetChange: function(e) {
    this.setData({
      monthlyTarget: e.detail
    });
  },

  /**
   * 保存目标
   */
  onSave: function() {
    const { weeklyTarget, monthlyTarget } = this.data;
    
    // 验证输入
    if (!weeklyTarget && !monthlyTarget) {
      wx.showToast({
        title: '请至少设置一个目标',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (weeklyTarget) {
      const weekly = parseInt(weeklyTarget);
      if (isNaN(weekly) || weekly < 1 || weekly > 7) {
        wx.showToast({
          title: '周目标请输入1-7次',
          icon: 'none',
          duration: 2000
        });
        return;
      }
    }

    if (monthlyTarget) {
      const monthly = parseInt(monthlyTarget);
      if (isNaN(monthly) || monthly < 1 || monthly > 3000) {
        wx.showToast({
          title: '月目标请输入1-3000分钟',
          icon: 'none',
          duration: 2000
        });
        return;
      }
    }

    this.setData({ saving: true });

    const promises = [];
    
    // 保存周目标
    if (weeklyTarget) {
      promises.push(this.saveWeeklyGoal(parseInt(weeklyTarget)));
    }
    
    // 保存月目标
    if (monthlyTarget) {
      promises.push(this.saveMonthlyGoal(parseInt(monthlyTarget)));
    }

    Promise.all(promises)
      .then(() => {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        });
        setTimeout(() => {
          this.loadGoals();
        }, 1500);
      })
      .catch(err => {
        console.error('保存失败:', err);
        wx.showToast({
          title: err.message || '保存失败，请重试',
          icon: 'none',
          duration: 2000
        });
      })
      .finally(() => {
        this.setData({ saving: false });
      });
  },

  /**
   * 保存周目标
   */
  saveWeeklyGoal: function(targetValue) {
    const { weeklyGoalId } = this.data;
    
    console.log('【目标保存】保存周目标 - goalId:', weeklyGoalId, 'targetValue:', targetValue);
    
    // 统一使用 createGoal，后端会自动判断是创建还是更新
    console.log('【目标保存】调用 createGoal API');
    return api.goalAPI.createGoal('weekly', targetValue)
      .then(res => {
        console.log('【目标保存】周目标保存成功:', res);
        return res;
      })
      .catch(err => {
        console.error('【目标保存】周目标保存失败:', err);
        throw err;
      });
  },

  /**
   * 保存月目标
   */
  saveMonthlyGoal: function(targetValue) {
    const { monthlyGoalId } = this.data;
    
    console.log('【目标保存】保存月目标 - goalId:', monthlyGoalId, 'targetValue:', targetValue);
    
    // 统一使用 createGoal，后端会自动判断是创建还是更新
    console.log('【目标保存】调用 createGoal API');
    return api.goalAPI.createGoal('monthly', targetValue)
      .then(res => {
        console.log('【目标保存】月目标保存成功:', res);
        return res;
      })
      .catch(err => {
        console.error('【目标保存】月目标保存失败:', err);
        throw err;
      });
  },

  /**
   * 页面分享
   */
  onShareAppMessage: function() {
    return {
      title: '一起设定健身目标吧！',
      path: '/pages/goal/index'
    };
  }
});
