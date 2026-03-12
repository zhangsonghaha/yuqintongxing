/**
 * 编辑资料页面
 */

const storage = require('../../utils/storage');
const api = require('../../utils/api');
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    userInfo: {},
    avatarText: '用',
    genderOptions: ['保密', '男', '女'],
    genderIndex: 0,
    today: '',
    saving: false
  },

  onLoad() {
    // 获取今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    this.setData({
      today: `${year}-${month}-${day}`
    });

    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = storage.getUserInfo() || {};
    
    // 设置性别索引（后端：0=保密, 1=男, 2=女）
    let genderIndex = 0; // 默认保密
    if (userInfo.gender === 1 || userInfo.gender === '1') {
      genderIndex = 1; // 男
    } else if (userInfo.gender === 2 || userInfo.gender === '2') {
      genderIndex = 2; // 女
    }

    // 计算头像文字（昵称首字母）
    const nickname = userInfo.nickname || '用户';
    const avatarText = nickname.substring(0, 1).toUpperCase();

    this.setData({
      userInfo: userInfo,
      avatarText: avatarText,
      genderIndex: genderIndex
    });
  },

  /**
   * 选择头像
   */
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        Toast.fail('选择图片失败');
      }
    });
  },

  /**
   * 上传头像
   */
  uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...' });

    const token = wx.getStorageSync('token');
    
    wx.uploadFile({
      url: api.BASE_URL + '/api/user/avatar',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        wx.hideLoading();
        
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            const avatarUrl = data.data;
            this.setData({
              'userInfo.avatar': avatarUrl
            });
            Toast.success('头像上传成功');
          } else {
            Toast.fail(data.msg || '上传失败');
          }
        } catch (e) {
          console.error('解析响应失败:', e);
          Toast.fail('上传失败');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传头像失败:', err);
        Toast.fail('上传失败');
      }
    });
  },

  /**
   * 昵称输入
   */
  onNicknameInput(e) {
    const nickname = e.detail.value;
    const avatarText = nickname ? nickname.substring(0, 1).toUpperCase() : '用';
    
    this.setData({
      'userInfo.nickname': nickname,
      avatarText: avatarText
    });
  },

  /**
   * 性别选择
   */
  onGenderChange(e) {
    const index = parseInt(e.detail.value);
    const genderValue = index; // 0: 保密, 1: 男, 2: 女
    
    this.setData({
      genderIndex: index,
      'userInfo.gender': genderValue
    });
  },

  /**
   * 生日选择
   */
  onBirthdayChange(e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    });
  },

  /**
   * 个性签名输入
   */
  onSignatureInput(e) {
    this.setData({
      'userInfo.signature': e.detail.value
    });
  },

  /**
   * 保存资料
   */
  saveProfile() {
    const { userInfo } = this.data;

    // 验证昵称
    if (!userInfo.nickname || userInfo.nickname.trim() === '') {
      Toast.fail('请输入昵称');
      return;
    }

    this.setData({ saving: true });

    // 调用更新接口
    api.coupleUserAPI.updateProfile({
      nickname: userInfo.nickname,
      gender: userInfo.gender,
      birthday: userInfo.birthday,
      signature: userInfo.signature,
      avatar: userInfo.avatar
    }).then(res => {
      this.setData({ saving: false });
      
      if (res.code === 200) {
        // 更新本地存储
        storage.setUserInfo(userInfo);
        
        Toast.success('保存成功');
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        Toast.fail(res.msg || '保存失败');
      }
    }).catch(err => {
      this.setData({ saving: false });
      console.error('保存资料失败:', err);
      Toast.fail('保存失败');
    });
  }
});
