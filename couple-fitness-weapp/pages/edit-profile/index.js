/**
 * 编辑资料页面
 */

const storage = require('../../utils/storage');
const api = require('../../utils/api');
const { UPLOAD_URL } = require('../../utils/config');
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    userInfo: {},
    avatarText: '用',
    genderOptions: ['保密', '男', '女'],
    genderIndex: 0,
    // 弹窗控制
    showGender: false,
    showBirthday: false,
    // 生日时间戳（van-datetime-picker 需要）
    birthdayTimestamp: Date.now(),
    minDate: new Date(1900, 0, 1).getTime(),
    maxDate: Date.now(),
    saving: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = storage.getUserInfo() || {};

    let genderIndex = 0;
    if (userInfo.gender === 1 || userInfo.gender === '1') genderIndex = 1;
    else if (userInfo.gender === 2 || userInfo.gender === '2') genderIndex = 2;

    const nickname = userInfo.nickname || '用户';
    const avatarText = nickname.substring(0, 1).toUpperCase();

    // 将生日字符串转为时间戳
    let birthdayTimestamp = Date.now();
    if (userInfo.birthday) {
      const ts = new Date(userInfo.birthday).getTime();
      if (!isNaN(ts)) birthdayTimestamp = ts;
    }

    this.setData({
      userInfo,
      avatarText,
      genderIndex,
      birthdayTimestamp
    });
  },

  // ---- 头像 ----
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadAvatar(res.tempFiles[0].tempFilePath);
      },
      fail: () => Toast.fail('选择图片失败')
    });
  },

  uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...' });
    const token = wx.getStorageSync('token');

    wx.uploadFile({
      url: UPLOAD_URL + '/api/user/avatar',
      filePath,
      name: 'file',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        wx.hideLoading();
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            this.setData({ 'userInfo.avatar': data.data });
            Toast.success('头像上传成功');
          } else {
            Toast.fail(data.msg || '上传失败');
          }
        } catch (e) {
          Toast.fail('上传失败');
        }
      },
      fail: () => {
        wx.hideLoading();
        Toast.fail('上传失败');
      }
    });
  },

  // ---- 昵称 ----
  onNicknameInput(e) {
    const nickname = e.detail;
    this.setData({
      'userInfo.nickname': nickname,
      avatarText: nickname ? nickname.substring(0, 1).toUpperCase() : '用'
    });
  },

  // ---- 性别 ----
  showGenderPicker() {
    this.setData({ showGender: true });
  },

  onGenderClose() {
    this.setData({ showGender: false });
  },

  onGenderConfirm(e) {
    const index = e.detail.index;
    this.setData({
      genderIndex: index,
      'userInfo.gender': index,
      showGender: false
    });
  },

  // ---- 生日 ----
  showBirthdayPicker() {
    this.setData({ showBirthday: true });
  },

  onBirthdayClose() {
    this.setData({ showBirthday: false });
  },

  onBirthdayConfirm(e) {
    const date = new Date(e.detail);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    this.setData({
      'userInfo.birthday': `${y}-${m}-${d}`,
      birthdayTimestamp: e.detail,
      showBirthday: false
    });
  },

  // ---- 签名 ----
  onSignatureInput(e) {
    this.setData({ 'userInfo.signature': e.detail });
  },

  // ---- 保存 ----
  saveProfile() {
    if (this.data.saving) return;
    const { userInfo } = this.data;

    if (!userInfo.nickname || !userInfo.nickname.trim()) {
      Toast.fail('请输入昵称');
      return;
    }

    this.setData({ saving: true });

    api.coupleUserAPI.updateProfile({
      nickname: userInfo.nickname,
      gender: userInfo.gender,
      birthday: userInfo.birthday,
      signature: userInfo.signature,
      avatar: userInfo.avatar
    }).then(res => {
      this.setData({ saving: false });
      if (res.code === 200) {
        storage.setUserInfo(userInfo);
        Toast.success('保存成功');
        setTimeout(() => wx.navigateBack(), 1500);
      } else {
        Toast.fail(res.msg || '保存失败');
      }
    }).catch(() => {
      this.setData({ saving: false });
      Toast.fail('保存失败');
    });
  }
});
