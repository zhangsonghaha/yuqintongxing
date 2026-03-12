const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    setting: {
      exerciseReminderEnabled: false,
      reminderTime: '20:00',
      likeNotificationEnabled: true,
      commentNotificationEnabled: true,
      goalNotificationEnabled: true
    },
    timePickerVisible: false,
    currentTime: '20:00'
  },

  onLoad() {
    this.loadSettings();
  },

  /**
   * 加载用户提醒设置
   */
  async loadSettings() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await request.get('/api/reminder-setting');
      
      if (res.code === 200 && res.data) {
        this.setData({
          setting: res.data,
          currentTime: res.data.reminderTime || '20:00'
        });
      }
      
    } catch (error) {
      console.error('加载设置失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 切换运动提醒开关
   */
  onExerciseReminderChange(e) {
    const enabled = e.detail;
    this.setData({
      'setting.exerciseReminderEnabled': enabled
    });
    this.saveSettings();
  },

  /**
   * 显示时间选择器
   */
  showTimePicker() {
    this.setData({
      timePickerVisible: true
    });
  },

  /**
   * 关闭时间选择器
   */
  closeTimePicker() {
    this.setData({
      timePickerVisible: false
    });
  },

  /**
   * 时间选择器确认
   */
  onTimeConfirm(e) {
    const time = e.detail;
    this.setData({
      'setting.reminderTime': time,
      currentTime: time,
      timePickerVisible: false
    });
    this.saveSettings();
  },

  /**
   * 切换点赞通知开关
   */
  onLikeNotificationChange(e) {
    const enabled = e.detail;
    this.setData({
      'setting.likeNotificationEnabled': enabled
    });
    this.saveSettings();
  },

  /**
   * 切换评论通知开关
   */
  onCommentNotificationChange(e) {
    const enabled = e.detail;
    this.setData({
      'setting.commentNotificationEnabled': enabled
    });
    this.saveSettings();
  },

  /**
   * 切换目标完成通知开关
   */
  onGoalNotificationChange(e) {
    const enabled = e.detail;
    this.setData({
      'setting.goalNotificationEnabled': enabled
    });
    this.saveSettings();
  },

  /**
   * 保存设置
   */
  async saveSettings() {
    try {
      const res = await request.put('/api/reminder-setting', this.data.setting);
      
      if (res.code === 200) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        });
      } else {
        throw new Error(res.msg || '保存失败');
      }
      
    } catch (error) {
      console.error('保存设置失败:', error);
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    }
  },

  /**
   * 申请订阅消息权限
   */
  async requestSubscribeMessage() {
    // 开发阶段提示：订阅消息需要在微信公众平台申请模板ID
    wx.showModal({
      title: '订阅消息功能',
      content: '订阅消息功能需要在微信公众平台申请模板ID后才能使用。\n\n开发阶段可以先保存设置，正式发布前需要配置真实的模板ID。',
      showCancel: false,
      confirmText: '我知道了'
    });
    
    return;
    
    // 正式环境使用以下代码（需要替换为真实的模板ID）
    /*
    try {
      const res = await wx.requestSubscribeMessage({
        tmplIds: [
          'YOUR_TEMPLATE_ID_1', // 运动提醒 - 需要在微信公众平台申请
          'YOUR_TEMPLATE_ID_2', // 点赞通知 - 需要在微信公众平台申请
          'YOUR_TEMPLATE_ID_3', // 评论通知 - 需要在微信公众平台申请
          'YOUR_TEMPLATE_ID_4'  // 目标完成通知 - 需要在微信公众平台申请
        ]
      });
      
      console.log('订阅消息结果:', res);
      
      wx.showToast({
        title: '订阅成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('订阅消息失败:', error);
      wx.showToast({
        title: '订阅失败',
        icon: 'none'
      });
    }
    */
  }
});
