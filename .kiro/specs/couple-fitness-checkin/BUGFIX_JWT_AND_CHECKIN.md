# 打卡页面 Bug 修复 - JWT 认证和图片上传

## 问题描述

### 1. JWT 签名验证失败
**错误信息**：
```
JWT signature does not match locally computed signature. JWT validity cannot be asserted and should not be trusted.
```

**原因**：
- 后端 JWT 密钥配置与前端发送的 token 不匹配
- 可能是服务器重启后密钥改变
- 或者多个服务实例使用不同的密钥

### 2. 打卡页面请求失败
- 由于 JWT 验证失败，所有需要认证的请求都返回 401
- 打卡提交、图片上传都失败

### 3. 图片不回显
- 选择图片后没有立即显示本地预览
- 只有上传成功后才显示，但由于请求失败，图片永远不显示

## 解决方案

### 前端修复（已完成）

#### 1. 图片预览改进
**文件**：`couple-fitness-weapp/pages/checkin/index.js`

修改 `takePhoto()` 和 `chooseFromAlbum()` 方法：
- 选择图片后立即显示本地预览（`tempFilePath`）
- 然后异步上传到服务器
- 上传成功后更新为服务器返回的 URL

```javascript
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
    }
  });
}
```

#### 2. 图片上传改进
**文件**：`couple-fitness-weapp/pages/checkin/index.js`

改进 `uploadPhoto()` 方法：
- 添加 token 检查
- 改进错误处理和日志
- 正确处理响应数据

```javascript
uploadPhoto(tempFilePath) {
  const token = wx.getStorageSync('token');
  
  if (!token) {
    wx.showToast({
      title: '未登录，请重新登录',
      icon: 'error'
    });
    return;
  }
  
  wx.uploadFile({
    url: 'http://localhost:8080/api/upload/checkin-photo',
    filePath: compressedPath,
    name: 'file',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: (uploadRes) => {
      const data = JSON.parse(uploadRes.data);
      if (data.code === 200 && data.data) {
        this.setData({
          'checkInForm.photoUrl': data.data
        });
      }
    }
  });
}
```

#### 3. 打卡提交改进
**文件**：`couple-fitness-weapp/pages/checkin/index.js`

改进 `submitCheckIn()` 方法：
- 添加详细的日志记录
- 检测 JWT 错误并提示重新登录
- 改进错误提示

```javascript
submitCheckIn() {
  // ... 验证逻辑 ...
  
  request({
    url: '/api/checkin/add',
    method: 'POST',
    data: checkInData
  }).then(res => {
    // 成功处理
  }).catch(err => {
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
    }
  });
}
```

### 后端修复（需要进行）

#### 1. 检查 JWT 密钥配置
**文件**：`RuoYi-Vue/ruoyi-admin/src/main/resources/application.yml`

确保 JWT 密钥配置正确：
```yaml
jwt:
  secret: your-secret-key-here  # 确保与生成 token 时使用的密钥一致
  expiration: 86400  # token 过期时间（秒）
```

#### 2. 检查 TokenService
**文件**：`RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/framework/security/service/TokenService.java`

确保 `getLoginUser()` 方法正确处理 JWT 验证失败：
```java
public LoginUser getLoginUser(HttpServletRequest request) {
  try {
    String token = getToken(request);
    if (StringUtils.isNotEmpty(token)) {
      Claims claims = parseToken(token);
      // ... 处理 claims ...
    }
  } catch (Exception e) {
    logger.error("获取用户信息异常", e);
    // 返回 null 或抛出异常，让拦截器处理
  }
}
```

#### 3. 检查文件上传接口
**文件**：`RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/FileUploadController.java`

确保上传接口正确处理认证：
```java
@PostMapping("/checkin-photo")
@RequiresPermissions("checkin:upload")  // 或使用 @PreAuthorize
public AjaxResult uploadCheckInPhoto(@RequestParam("file") MultipartFile file) {
  // 验证文件
  // 保存文件
  // 返回文件 URL
}
```

## 测试步骤

1. **重启后端服务**
   ```bash
   cd RuoYi-Vue/ruoyi-admin
   mvn spring-boot:run
   ```

2. **清除小程序缓存**
   - 在微信开发者工具中清除缓存
   - 或在小程序中清除本地存储

3. **重新登录**
   - 使用微信登录
   - 确保获取新的 token

4. **测试打卡流程**
   - 进入打卡页面
   - 选择运动类型
   - 输入运动时长
   - 选择图片（应该立即显示预览）
   - 提交打卡

5. **检查日志**
   - 前端：查看微信开发者工具的控制台
   - 后端：查看 Spring Boot 日志

## 相关文件

- 前端：`couple-fitness-weapp/pages/checkin/index.js`
- 前端：`couple-fitness-weapp/pages/checkin/index.wxml`
- 后端：`RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/FileUploadController.java`
- 后端：`RuoYi-Vue/ruoyi-admin/src/main/resources/application.yml`

## 后续优化

1. 实现 token 自动刷新机制
2. 添加离线图片缓存
3. 实现图片压缩和优化
4. 添加上传进度显示
5. 实现断点续传
