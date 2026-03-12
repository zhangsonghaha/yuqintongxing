# 修复 partnerId 字段名问题

## 问题描述

用户点击首页"对方的状态"跳转到对方打卡记录页面时，出现以下错误：

```
【网络请求】业务错误: 请求参数类型不匹配，参数[userId]要求类型为：'java.lang.Long'，但输入值为：'NaN'
```

## 问题原因

后端 `PartnershipResponseDto` 返回的伴侣信息字段名与前端代码使用的字段名不匹配：

**后端返回的字段**:
- `partnerId` - 伴侣用户ID
- `partnerNickname` - 伴侣昵称
- `partnerAvatar` - 伴侣头像

**前端代码使用的字段**:
- `userId` - 用户ID（错误）
- `nickname` - 昵称（错误）
- `avatar` - 头像（错误）

导致 `partnerInfo.userId` 获取到 `undefined`，转换为数字后变成 `NaN`。

## 修复内容

### 1. 修复首页跳转方法

**文件**: `couple-fitness-weapp/pages/index/index.js`

**修改前**:
```javascript
goToPartnerCheckIns() {
  const { partnerInfo } = this.data;
  
  if (!partnerInfo) {
    wx.showToast({
      title: '还没有配对伴侣',
      icon: 'none'
    });
    return;
  }
  
  // 跳转到对方的打卡记录页面
  wx.navigateTo({
    url: `/pages/partner-checkins/index?partnerId=${partnerInfo.userId}&partnerName=${partnerInfo.nickname || '对方'}`
  });
}
```

**修改后**:
```javascript
goToPartnerCheckIns() {
  const { partnerInfo } = this.data;
  
  if (!partnerInfo) {
    wx.showToast({
      title: '还没有配对伴侣',
      icon: 'none'
    });
    return;
  }
  
  // 后端返回的字段是 partnerId，不是 userId
  const partnerId = partnerInfo.partnerId || partnerInfo.userId;
  const partnerName = partnerInfo.partnerNickname || partnerInfo.nickname || '对方';
  
  if (!partnerId) {
    console.error('【首页】partnerId为空:', partnerInfo);
    wx.showToast({
      title: '伴侣信息异常',
      icon: 'none'
    });
    return;
  }
  
  console.log('【首页】跳转到对方打卡记录页面:', { partnerId, partnerName });
  
  // 跳转到对方的打卡记录页面
  wx.navigateTo({
    url: `/pages/partner-checkins/index?partnerId=${partnerId}&partnerName=${encodeURIComponent(partnerName)}`
  });
}
```

**改进点**:
1. 使用正确的字段名 `partnerId` 和 `partnerNickname`
2. 添加兼容性处理（同时支持旧字段名）
3. 添加 partnerId 为空的检查
4. 添加调试日志
5. 对 partnerName 进行 URL 编码

### 2. 修复首页WXML显示

**文件**: `couple-fitness-weapp/pages/index/index.wxml`

**修改前**:
```xml
<text class="status-label">{{ partnerInfo.nickname || '对方' }}</text>
```

**修改后**:
```xml
<text class="status-label">{{ partnerInfo.partnerNickname || partnerInfo.nickname || '对方' }}</text>
```

### 3. 修复打卡记录格式化方法

**文件**: `couple-fitness-weapp/pages/index/index.js`

**修改前**:
```javascript
return records.map(record => {
  const isUser = record.userId === (userInfo ? userInfo.userId : null);
  const owner = isUser ? userInfo : partnerInfo;
  
  // ...
  
  return {
    recordId: record.recordId,
    userId: record.userId,
    nickname: owner ? owner.nickname : '用户',
    avatar: owner ? owner.avatar : '',
    // ...
  };
});
```

**修改后**:
```javascript
return records.map(record => {
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
  
  return {
    recordId: record.recordId,
    userId: record.userId,
    nickname: nickname,
    avatar: avatar,
    // ...
  };
});
```

### 4. 修复伴侣打卡记录判断

**文件**: `couple-fitness-weapp/pages/index/index.js`

**修改前**:
```javascript
if (partnerInfo && partnerInfo.userId) {
  // 获取伴侣打卡记录
}
```

**修改后**:
```javascript
// 后端返回的字段是 partnerId，不是 userId
const partnerId = partnerInfo ? (partnerInfo.partnerId || partnerInfo.userId) : null;
if (partnerId) {
  // 获取伴侣打卡记录
}
```

## 后端字段说明

### PartnershipResponseDto 结构

```java
@Data
public class PartnershipResponseDto {
    /** 配对关系ID */
    private Long partnershipId;
    
    /** 伴侣用户ID */
    private Long partnerId;
    
    /** 伴侣昵称 */
    private String partnerNickname;
    
    /** 伴侣头像 */
    private String partnerAvatar;
    
    /** 邀请码 */
    private String inviteCode;
    
    /** 二维码URL */
    private String qrCodeUrl;
    
    /** 配对状态 */
    private String status;
}
```

## 测试验证

### 测试步骤

1. 确保两个用户已配对
2. 登录用户A
3. 进入首页
4. 检查"对方的状态"区域是否显示对方昵称
5. 点击"对方的状态"区域
6. 应该成功跳转到对方打卡记录页面
7. 检查控制台日志，确认 partnerId 正确传递

### 预期结果

- ✅ 页面跳转成功
- ✅ partnerId 是有效的数字
- ✅ 对方昵称正确显示
- ✅ 对方打卡记录正常加载

### 调试日志

在控制台查看以下日志：

```
【首页】伴侣信息响应: { code: 200, data: { partnerId: 101, partnerNickname: "张三", ... } }
【首页】跳转到对方打卡记录页面: { partnerId: 101, partnerName: "张三" }
【对方打卡记录】API响应: { code: 200, rows: [...], total: 10 }
```

## 兼容性处理

为了保证代码的健壮性，所有修改都采用了兼容性处理：

```javascript
// 同时支持新旧字段名
const partnerId = partnerInfo.partnerId || partnerInfo.userId;
const partnerName = partnerInfo.partnerNickname || partnerInfo.nickname || '对方';
const partnerAvatar = partnerInfo.partnerAvatar || partnerInfo.avatar || '';
```

这样即使后端字段名发生变化，前端代码也能正常工作。

## 注意事项

1. **字段名一致性**: 前后端应该统一字段命名规范
2. **类型检查**: 传递参数前应该检查类型和有效性
3. **URL编码**: 传递中文参数时需要使用 `encodeURIComponent()`
4. **错误处理**: 添加完善的错误提示和日志
5. **兼容性**: 考虑旧版本数据的兼容性

## 相关文件

- `couple-fitness-weapp/pages/index/index.js` - 首页逻辑
- `couple-fitness-weapp/pages/index/index.wxml` - 首页模板
- `couple-fitness-weapp/pages/partner-checkins/index.js` - 对方打卡记录页面
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/domain/dto/PartnershipResponseDto.java` - 后端DTO

## 完成状态

✅ 修复首页跳转方法
✅ 修复首页WXML显示
✅ 修复打卡记录格式化
✅ 修复伴侣打卡记录判断
✅ 添加兼容性处理
✅ 添加错误检查和日志
