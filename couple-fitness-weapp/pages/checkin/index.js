const app = getApp();
const { request } = require('../../utils/request');
const { BASE_URL } = require('../../utils/config');
const realtimeUpdater = require('../../utils/realtime');
const location = require('../../utils/location');
const api = require('../../utils/api');

Page({
  data: {
    // 打卡表单数据
    checkInForm: {
      exerciseType: '',
      duration: '',
      photoUrl: '',
      notes: '',
      latitude: null,
      longitude: null,
      location: ''
    },
    
    // 运动类型列表
    exerciseTypes: ['跑步', '游泳', '骑行', '瑜伽', '健身', '篮球', '足球', '羽毛球', '乒乓球', '散步'],
    exerciseTypeIndex: 0,
    
    // Vant ActionSheet 数据
    showExerciseTypeSheet: false,
    exerciseTypeActions: [],
    
    // UI状态
    estimatedCalories: 0,
    isUploading: false,
    isSubmitting: false,
    isGettingLocation: false,
    todayCheckIn: null
  },

  onLoad() {
    // 移除检查今日是否已打卡的限制,支持一天多次打卡
    this.getLocation(); // 自动获取位置
    
    // 初始化运动类型选择器数据
    const exerciseTypeActions = this.data.exerciseTypes.map(type => ({
      name: type
    }));
    this.setData({
      exerciseTypeActions: exerciseTypeActions
    });
  },

  onShow() {
    // 移除检查今日是否已打卡的限制,支持一天多次打卡
  },

  /**
   * 获取用户位置
   */
  getLocation() {
    this.setData({ isGettingLocation: true });
    
    // 先检查权限
    location.checkLocationAuth()
      .then(hasAuth => {
        if (!hasAuth) {
          // 请求权限
          return location.requestLocationAuth();
        }
        return true;
      })
      .then(() => {
        // 获取位置和地址
        return location.getLocationWithAddress();
      })
      .then(locationData => {
        console.log('位置信息:', locationData);
        
        // 格式化地址
        const formattedAddress = location.formatAddress(locationData);
        
        this.setData({
          'checkInForm.latitude': locationData.latitude,
          'checkInForm.longitude': locationData.longitude,
          'checkInForm.location': formattedAddress,
          isGettingLocation: false
        });
        
        wx.showToast({
          title: '位置获取成功',
          icon: 'success',
          duration: 1500
        });
      })
      .catch(err => {
        console.error('获取位置失败:', err);
        this.setData({ isGettingLocation: false });
        
        wx.showToast({
          title: '位置获取失败',
          icon: 'none',
          duration: 2000
        });
      });
  },

  /**
   * 重新获取位置
   */
  refreshLocation() {
    this.getLocation();
  },

  /**
   * 检查今日是否已打卡 (已废弃 - 支持一天多次打卡)
   */
  // checkTodayCheckIn() {
  //   request({
  //     url: '/api/checkin/today',
  //     method: 'GET'
  //   }).then(res => {
  //     if (res.data) {
  //       this.setData({
  //         todayCheckIn: res.data
  //       });
  //       wx.showToast({
  //         title: '今日已打卡',
  //         icon: 'success'
  //       });
  //     }
  //   }).catch(err => {
  //     // 今日未打卡,继续
  //   });
  // },

  /**
   * 显示运动类型选择器
   */
  showExerciseTypePicker() {
    this.setData({
      showExerciseTypeSheet: true
    });
  },

  /**
   * 选择运动类型
   */
  onExerciseTypeSelect(e) {
    const { name, index } = e.detail;
    this.setData({
      'checkInForm.exerciseType': name,
      exerciseTypeIndex: index,
      showExerciseTypeSheet: false
    });
    this.calculateCalories();
  },

  /**
   * 关闭运动类型选择器
   */
  onExerciseTypeClose() {
    this.setData({
      showExerciseTypeSheet: false
    });
  },

  /**
   * 选择运动类型 (旧方法,保留兼容)
   */
  onExerciseTypeChange(e) {
    const index = e.detail.value;
    const exerciseType = this.data.exerciseTypes[index];
    this.setData({
      'checkInForm.exerciseType': exerciseType,
      exerciseTypeIndex: index
    });
    this.calculateCalories();
  },

  /**
   * 输入运动时长
   */
  onDurationInput(e) {
    let duration = e.detail.value || e.detail;
    
    // 只保留数字
    duration = duration.toString().replace(/[^\d]/g, '');
    
    // 限制最大值为9999分钟
    if (duration && parseInt(duration) > 9999) {
      duration = '9999';
    }
    
    this.setData({
      'checkInForm.duration': duration
    });
    this.calculateCalories();
  },

  /**
   * 备注输入
   */
  onNotesInput(e) {
    this.setData({
      'checkInForm.notes': e.detail.value
    });
  },

  /**
   * 计算卡路里
   */
  calculateCalories() {
    const { exerciseType, duration } = this.data.checkInForm;
    
    if (!exerciseType || !duration) {
      this.setData({ estimatedCalories: 0 });
      return;
    }
    
    // 卡路里估算（每分钟消耗）
    const caloriesPerMinute = {
      '跑步': 10,
      '游泳': 11,
      '骑行': 8,
      '瑜伽': 3,
      '健身': 7,
      '篮球': 9,
      '足球': 9.5,
      '羽毛球': 7.5,
      '乒乓球': 6,
      '散步': 4
    };
    
    const rate = caloriesPerMinute[exerciseType] || 5;
    const calories = Math.round(rate * parseInt(duration));
    
    this.setData({
      estimatedCalories: calories
    });
  },

  /**
   * 拍照
   */
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 先显示本地预览
        this.setData({
          'checkInForm.photoUrl': tempFilePath
        });
        // 然后上传到服务器
        this.uploadPhoto(tempFilePath);
      },
      fail: (err) => {
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 从相册选择
   */
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 先显示本地预览
        this.setData({
          'checkInForm.photoUrl': tempFilePath
        });
        // 然后上传到服务器
        this.uploadPhoto(tempFilePath);
      },
      fail: (err) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 上传图片
   */
  uploadPhoto(tempFilePath) {
    this.setData({ isUploading: true });
    
    wx.compressImage({
      src: tempFilePath,
      quality: 80,
      success: (res) => {
        const compressedPath = res.tempFilePath;
        const token = wx.getStorageSync('token');
        
        if (!token) {
          wx.showToast({
            title: '未登录，请重新登录',
            icon: 'error'
          });
          this.setData({ isUploading: false });
          return;
        }
        
        wx.uploadFile({
          url: BASE_URL + '/api/upload/checkin-photo',
          filePath: compressedPath,
          name: 'file',
          header: {
            'Authorization': 'Bearer ' + token
          },
          success: (uploadRes) => {
            console.log('【图片上传】响应:', uploadRes);
            try {
              const data = JSON.parse(uploadRes.data);
              if (uploadRes.statusCode === 200 && data.code === 200 && data.data) {
                // 上传成功，更新为服务器返回的 URL
                this.setData({
                  'checkInForm.photoUrl': data.data,
                  isUploading: false
                });
                wx.showToast({
                  title: '图片上传成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: data.msg || '上传失败',
                  icon: 'error'
                });
                this.setData({ isUploading: false });
              }
            } catch (e) {
              console.error('【图片上传】解析响应失败:', e);
              wx.showToast({
                title: '上传失败',
                icon: 'error'
              });
              this.setData({ isUploading: false });
            }
          },
          fail: (err) => {
            console.error('【图片上传】请求失败:', err);
            wx.showToast({
              title: '上传失败，请检查网络',
              icon: 'error'
            });
            this.setData({ isUploading: false });
          }
        });
      },
      fail: (err) => {
        console.error('【图片压缩】失败:', err);
        wx.showToast({
          title: '图片压缩失败',
          icon: 'error'
        });
        this.setData({ isUploading: false });
      }
    });
  },

  /**
   * 删除图片
   */
  deletePhoto() {
    this.setData({
      'checkInForm.photoUrl': ''
    });
  },

  /**
   * 提交打卡
   */
  submitCheckIn() {
    const { exerciseType, duration, photoUrl, latitude, longitude, location: locationStr } = this.data.checkInForm;
    
    // 验证必填字段
    if (!exerciseType) {
      wx.showToast({
        title: '请选择运动类型',
        icon: 'error'
      });
      return;
    }
    
    if (!duration || parseInt(duration) <= 0) {
      wx.showToast({
        title: '请输入有效的运动时长',
        icon: 'error'
      });
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    const checkInData = {
      exerciseType: exerciseType,
      duration: parseInt(duration),
      photoUrl: photoUrl || null,
      notes: this.data.checkInForm.notes,
      checkInDate: new Date().toISOString().split('T')[0],
      latitude: latitude,
      longitude: longitude,
      location: locationStr
    };
    
    console.log('【打卡提交】数据:', checkInData);
    
    request({
      url: '/api/checkin/add',
      method: 'POST',
      data: checkInData
    }).then(res => {
      console.log('【打卡提交】成功:', res);
      this.setData({ isSubmitting: false });
      wx.showToast({
        title: '打卡成功',
        icon: 'success'
      });
      
      // 重置表单
      this.setData({
        checkInForm: {
          exerciseType: '',
          duration: '',
          photoUrl: '',
          notes: '',
          latitude: null,
          longitude: null,
          location: ''
        },
        estimatedCalories: 0,
        todayCheckIn: res.data
      });
      
      // 触发实时更新
      realtimeUpdater.triggerUpdate();
      
      // 延迟返回首页
      setTimeout(() => {
        // 检查是否有新解锁的成就
        if (res.data && res.data.newAchievements && res.data.newAchievements.length > 0) {
          // 有新成就解锁,跳转到成就页面并显示动画
          console.log('【打卡成功】解锁了新成就:', res.data.newAchievements);
          wx.navigateTo({
            url: '/pages/achievement/index?showAnimation=true'
          });
        } else {
          // 没有新成就,返回首页
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }, 1500);
    }).catch(err => {
      console.error('【打卡提交】失败:', err);
      this.setData({ isSubmitting: false });
      
      // 判断是否是 JWT 错误
      if (err.message && err.message.includes('JWT')) {
        wx.showToast({
          title: '登录已过期，请重新登录',
          icon: 'error'
        });
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: err.msg || err.message || '打卡失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 取消打卡
   */
  cancelCheckIn() {
    wx.navigateBack();
  }
});
