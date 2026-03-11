# JWT 密钥不匹配问题修复

## 问题分析

### 错误信息
```
JWT signature does not match locally computed signature. 
JWT validity cannot be asserted and should not be trusted.
```

### 根本原因
配置文件中存在**两个不同的密钥配置**：

1. **token.secret**: `abcdefghijklmnopqrstuvwxyz` (弱密钥)
2. **jwt.secret**: `your-secret-key-change-this-in-production-environment-for-security` (占位符)

而 `TokenService` 使用的是 `token.secret` 来生成和验证 JWT token，导致：
- 生成 token 时使用一个密钥
- 验证 token 时使用另一个密钥
- 签名验证失败

## 解决方案

### 修复步骤

#### 1. 统一密钥配置
**文件**: `RuoYi-Vue/ruoyi-admin/src/main/resources/application.yml`

将两个密钥配置统一为同一个强密钥：

```yaml
# token配置
token:
  # 令牌自定义标识
  header: Authorization
  # 令牌密钥（与 JWT 密钥保持一致）
  secret: couple-fitness-app-secret-key-2026-production-secure-key
  # 令牌有效期（默认30分钟）
  expireTime: 30

# JWT配置
jwt:
  # JWT 密钥（与 token.secret 保持一致）
  secret: couple-fitness-app-secret-key-2026-production-secure-key
  # JWT 过期时间（毫秒，默认7天）
  expiration: 604800000
  # JWT 刷新令牌过期时间（毫秒，默认30天）
  refresh-expiration: 2592000000
```

#### 2. 重启后端服务
```bash
# 停止现有服务
# 清除旧的 token 缓存
# 重新启动服务
cd RuoYi-Vue/ruoyi-admin
mvn spring-boot:run
```

#### 3. 清除前端缓存
在微信开发者工具中：
- 清除所有缓存
- 或在小程序中清除本地存储

```javascript
// 或在前端代码中执行
wx.clearStorageSync();
```

#### 4. 重新登录
- 使用微信登录
- 获取新的 token
- 新 token 将使用正确的密钥生成

## 验证修复

### 后端日志检查
修复后，登录时应该看到：
```
[INFO] 用户登录成功
[INFO] Token 生成成功
```

而不是：
```
[ERROR] 获取用户信息异常'JWT signature does not match...'
```

### 前端测试
1. 登录成功
2. 进入首页
3. 打卡页面请求成功
4. 图片上传成功
5. 打卡提交成功

## 密钥安全建议

### 生产环境
1. **使用强密钥**
   - 长度至少 32 字符
   - 包含大小写字母、数字、特殊字符
   - 不要使用默认或弱密钥

2. **密钥管理**
   - 不要在代码中硬编码密钥
   - 使用环境变量或密钥管理服务
   - 定期轮换密钥

3. **示例强密钥**
   ```
   couple-fitness-app-secret-key-2026-production-secure-key-v1
   ```

### 开发环境
可以使用相对简单的密钥，但仍然要保持一致性。

## 相关文件

- 配置文件：`RuoYi-Vue/ruoyi-admin/src/main/resources/application.yml`
- TokenService：`RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/web/service/TokenService.java`
- 前端登录：`couple-fitness-weapp/pages/login/index.js`
- 前端请求：`couple-fitness-weapp/utils/request.js`

## 常见问题

### Q: 修复后仍然出现 JWT 错误？
A: 
1. 确认配置文件已保存
2. 确认服务已重启
3. 清除浏览器/小程序缓存
4. 检查是否有多个服务实例运行

### Q: 如何验证密钥是否正确？
A:
1. 查看后端日志，确认没有 JWT 错误
2. 在前端控制台检查 token 是否正确存储
3. 使用 JWT 解码工具验证 token 结构

### Q: 生产环境如何安全地管理密钥？
A:
1. 使用环境变量
2. 使用密钥管理服务（如 AWS Secrets Manager）
3. 使用配置中心（如 Spring Cloud Config）
4. 定期轮换密钥

## 后续优化

1. 实现 token 自动刷新机制
2. 添加 token 黑名单功能
3. 实现多密钥支持（用于密钥轮换）
4. 添加 token 过期提醒
5. 实现 token 加密存储
