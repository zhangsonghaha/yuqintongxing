const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    // 打卡表单数据
    checkInForm: {
      exerciseType: '',
      duration: '',
      photoUrl: '',
      notes: ''
    },
    
    // 运动类型列表
    exerciseTypes: ['跑步', '游泳', '骑行', '瑜伽', '健身', '篮球', '足球', '羽毛球', '乒乓球', '散步'],
    exerciseTypeIndex: 0,
    
    // UI状态
    estimatedCalories: 0,
    isUploading: false,
    isSubmitting: false,
    todayCheckIn: null
  },

  onLoad() {
    this.checkTodayCheckIn();
  },

  onShow() {
    this.checkTodayCheckIn();
  },

  /**
   * 检查今日是否已打卡
   */
  checkTodayCheckIn() {
    request({
      url: '/api/checkin/today',
      method: 'GET'
    }).then(res => {
      if (res.data) {
        this.setData({
          todayCheckIn: res.data
        });
        wx.showToast({
          title: '今日已打卡',
          icon: 'success'
        });
      }
    }).catch(err => {
      // 今日未打卡,继续
    });
  },

  /**
   * 选择运动类型
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
    const duration = e.detail.value;
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
        
        const BASE_URL = 'http://localhost:8080';
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
    const { exerciseType, duration, photoUrl } = this.data.checkInForm;
    
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
      checkInDate: new Date().toISOString().split('T')[0]
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
          notes: ''
        },
        estimatedCalories: 0,
        todayCheckIn: res.data
      });
      
      // 延迟返回首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
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
