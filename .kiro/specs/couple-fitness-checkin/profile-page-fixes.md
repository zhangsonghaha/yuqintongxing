# 个人中心页面修复 Spec

## 问题描述

用户反馈了两个关于个人中心页面的问题：

1. **头像显示错误**：在"我的"页面（profile），头像应该显示伴侣的头像，而不是自己的头像
2. **"我的伴侣"菜单行为错误**：点击"我的伴侣"菜单项应该直接跳转到伴侣主页，而不是弹出伴侣信息对话框

## 当前实现分析

### 当前代码（profile.js）

```javascript
// 加载用户信息
loadUserInfo() {
  const userInfo = storage.getUserInfo();
  const partnerInfo = storage.getPartnerInfo();
  
  if (userInfo) {
    const nickname = userInfo.nickname || '用户';
    const avatarText = nickname.substring(0, 1).toUpperCase();
    
    this.setData({
      userInfo: userInfo,        // 显示自己的信息
      avatarText: avatarText,    // 显示自己的头像文字
      partnerInfo: partnerInfo
    });
  }
}

// 查看伴侣信息
viewPartner() {
  if (!this.data.partnerInfo) {
    wx.showToast({
      title: '暂无配对伴侣',
      icon: 'none'
    });
    return;
  }
  
  // 当前：弹出对话框显示伴侣信息
  wx.showModal({
    title: '伴侣信息',
    content: `昵称: ${this.data.partnerInfo.nickname || '未知'}\nID: ${this.data.partnerInfo.partnerId || '未知'}`,
    showCancel: false
  });
}
```

### 当前模板（profile.wxml）

```xml
<!-- 