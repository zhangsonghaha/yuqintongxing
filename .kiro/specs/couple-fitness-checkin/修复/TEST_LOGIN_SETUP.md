# 测试登录功能设置说明

## 需要手动完成的配置

### 1. 注册测试登录页面

在 `couple-fitness-weapp/app.json` 的 `pages` 数组中添加测试登录页面：

```json
{
  "pages": [
    "pages/index/index",
    "pages/login/index",
    "pages/login/test-login",  // 添加这一行
    "pages/checkin/index",
    "pages/calendar/calendar",
    "pages/chat/chat",
    "pages/profile/profile",
    "pages/partnership/index"
  ],
  ...
}
```

### 2. 后端添加手机号登录接口

需要在后端创建手机号登录的控制器和服务。

#### 创建 DTO 类

文件: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/domain/dto/PhoneLoginRequest.java`

```java
package com.ruoyi.web.domain.dto;

import lombok.Data;

@Data
public class PhoneLoginRequest {
    private String phone;
    private String code;
}
```

#### 在 AuthController 中添加接口

文件: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/AuthController.java`

```java
/**
 * 手机号登录（测试用）
 */
@PostMapping("/phone-login")
public AjaxResult phoneLogin(@RequestBody PhoneLoginRequest request) {
    // 验证手机号格式
    if (request.getPhone() == null || !request.getPhone().matches("^1[3-9]\\d{9}$")) {
        return AjaxResult.error("手机号格式不正确");
    }
    
    // 验证验证码（测试环境固定为123456）
    if (!"123456".equals(request.getCode())) {
        return AjaxResult.error("验证码错误");
    }
    
    // 使用手机号作为唯一标识
    String wechatId = "phone_" + request.getPhone();
    
    // 查询或创建用户
    CoupleUser user = coupleUserService.selectCoupleUserByWechatId(wechatId);
    if (user == null) {
        user = CoupleUser.builder()
                .wechatId(wechatId)
                .nickname("用户" + request.getPhone().substring(7))
                .build();
        coupleUserService.insertCoupleUser(user);
    }
    
    // 生成令牌
    String token = tokenProvider.generateToken(user.getUserId());
    String refreshToken = tokenProvider.generateRefreshToken(user.getUserId());
    
    // 构建响应
    LoginResponse response = LoginResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .user(LoginResponse.UserInfo.builder()
                    .userId(user.getUserId())
                    .nickname(user.getNickname())
                    .avatar(user.getAvatar())
                    .gender(user.getGender())
                    .build())
            .build();
    
    return AjaxResult.success(response);
}
```

### 3. 修复微信登录的用户识别问题

当前微信登录使用 `code` 作为 `wechatId`，但 code 每次都不同。需要修改为使用微信的 `openid`。

#### 方案A: 使用固定测试ID（快速方案）

在 `AuthServiceImpl.wechatLogin` 方法中：

```java
// 临时方案：使用固定的测试ID
String wechatId = "test_user_" + request.getNickname();
```

#### 方案B: 集成微信API（生产方案）

需要调用微信 API 获取 openid：

```java
// 调用微信API获取openid
String openid = wechatService.getOpenId(request.getCode());
String wechatId = openid;
```

### 4. 打卡后刷新主页数据

在打卡页面成功提交后，需要通知主页刷新数据。

#### 方法1: 使用全局事件（推荐）

在 `app.js` 中添加全局事件管理：

```javascript
App({
  globalData: {
    eventBus: {}
  },
  
  // 触发事件
  emit(event, data) {
    if (this.globalData.eventBus[event]) {
      this.globalData.eventBus[event].forEach(callback => callback(data));
    }
  },
  
  // 监听事件
  on(event, callback) {
    if (!this.globalData.eventBus[event]) {
      this.globalData.eventBus[event] = [];
    }
    this.globalData.eventBus[event].push(callback);
  },
  
  // 移除监听
  off(event, callback) {
    if (this.globalData.eventBus[event]) {
      const index = this.globalData.eventBus[event].indexOf(callback);
      if (index > -1) {
        this.globalData.eventBus[event].splice(index, 1);
      }
    }
  }
});
```

在主页 `index.js` 中监听打卡事件：

```javascript
onLoad() {
  this.loadData();
  
  // 监听打卡成功事件
  const app = getApp();
  app.on('checkin-success', () => {
    console.log('收到打卡成功事件，刷新数据');
    this.loadData();
  });
},

onUnload() {
  // 移除监听
  const app = getApp();
  app.off('checkin-success');
}
```

在打卡页面 `checkin/index.js` 提交成功后触发事件：

```javascript
// 打卡成功后
const app = getApp();
app.emit('checkin-success');
```

#### 方法2: 使用 onShow 刷新（简单方案）

在主页 `index.js` 中：

```javascript
onShow() {
  // 每次显示时刷新数据
  this.loadData();
}
```

这个方法已经在当前代码中实现了，所以打卡后返回主页应该会自动刷新。

## 使用说明

### 测试登录

1. 打开小程序，进入登录页面
2. 点击"开发测试登录"链接
3. 输入任意11位手机号（如：13800138000）
4. 点击"获取验证码"
5. 输入验证码：123456
6. 点击"登录"

### 验证数据持久性

1. 使用手机号登录（如：13800138000）
2. 完成打卡
3. 关闭小程序
4. 重新打开小程序
5. 再次使用相同手机号登录
6. 应该能看到之前的打卡记录

## 注意事项

1. 测试登录仅用于开发环境，生产环境应禁用
2. 验证码固定为 123456，仅用于测试
3. 手机号会被转换为 `phone_13800138000` 格式作为唯一标识
4. 建议使用不同的手机号测试多用户场景

## 已创建的文件

- `couple-fitness-weapp/pages/login/test-login.wxml` - 测试登录页面模板
- `couple-fitness-weapp/pages/login/test-login.js` - 测试登录页面逻辑
- `couple-fitness-weapp/pages/login/test-login.wxss` - 测试登录页面样式
- `couple-fitness-weapp/pages/login/test-login.json` - 测试登录页面配置

## 待完成的任务

- [ ] 在 app.json 中注册测试登录页面
- [ ] 后端添加手机号登录接口
- [ ] 修复微信登录的用户识别问题
- [ ] 验证打卡后主页数据刷新功能
