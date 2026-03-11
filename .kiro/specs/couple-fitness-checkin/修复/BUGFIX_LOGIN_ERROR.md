# 登录页面错误修复 - 小程序模拟器启动失败

## 问题描述

小程序模拟器启动失败，错误信息：
```
Error: pages/login/index.json: ["usingComponents"]["van-toast"]: 
"/components/vant/toast/index", component not found
```

## 根本原因

1. **Vant Toast 组件路径不存在** - 登录页面引用了不存在的 Vant Toast 组件
2. **小程序请求需要配置本地路径** - API 请求应该指向本地开发服务器
3. **若依框架需要放行小程序请求** - 后端需要配置安全规则允许小程序 API 访问

## 解决方案

### 1. 修复登录页面配置（已完成）

**文件**: `couple-fitness-weapp/pages/login/index.json`

**修改内容**:
- ❌ 移除了 `usingComponents` 中的 `van-toast` 引用
- ✅ 保留了基础的页面配置

```json
{
  "navigationBarTitleText": "登录",
  "navigationBarBackgroundColor": "#667eea",
  "navigationBarTextStyle": "white"
}
```

### 2. 修复登录页面模板（已完成）

**文件**: `couple-fitness-weapp/pages/login/index.wxml`

**修改内容**:
- ❌ 移除了 `<van-toast id="van-toast" />` 标签
- ✅ 使用原生 `wx.showToast()` API 替代

### 3. 配置小程序 API 基础 URL

**文件**: `couple-fitness-weapp/utils/api.js`

**配置**:
```javascript
// API 基础 URL - 使用本地路径
const BASE_URL = 'http://localhost:8080/api';
```

### 4. 在若依框架中放行小程序请求（已完成）

**文件**: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/config/SecurityConfig.java`

**配置内容**:
```java
// 放行小程序认证相关 API
.antMatchers(HttpMethod.POST, "/api/auth/wechat-login").permitAll()
.antMatchers(HttpMethod.POST, "/api/auth/refresh-token").permitAll()
```

## 部署步骤

### 后端部署

1. **更新 Spring Security 配置**
   - 将 `SecurityConfig.java` 复制到项目中
   - 确保 `JwtAuthenticationFilter` 已正确配置

2. **重启后端服务**
   ```bash
   cd RuoYi-Vue/ruoyi-admin
   mvn spring-boot:run
   ```

3. **验证 API 可访问**
   ```bash
   curl -X POST http://localhost:8080/api/auth/wechat-login \
     -H "Content-Type: application/json" \
     -d '{"code":"test_code","nickname":"test","avatar":"","gender":0}'
   ```

### 前端部署

1. **在微信开发者工具中打开项目**
   - 打开 `couple-fitness-weapp` 目录

2. **配置本地开发服务器**
   - 在微信开发者工具中设置 API 基础 URL
   - 或在 `utils/api.js` 中配置

3. **启用本地调试**
   - 在微信开发者工具中启用"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
   - 这样可以在开发环境中访问 `http://localhost:8080`

## 测试验证

### 后端测试

```bash
# 测试微信登录 API
curl -X POST http://localhost:8080/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code_123",
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1
  }'

# 预期响应
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
      "userId": 1,
      "nickname": "张三",
      "avatar": "https://example.com/avatar.jpg",
      "gender": 1
    }
  }
}
```

### 前端测试

1. **在微信开发者工具中打开小程序**
2. **点击"微信授权登录"按钮**
3. **验证以下流程**:
   - ✅ 弹出微信授权对话框
   - ✅ 授权成功后，显示"登录中..."
   - ✅ 收到后端响应后，显示"登录成功"
   - ✅ 自动跳转到主页

## 常见问题

### Q1: 仍然看到 Vant Toast 错误

**解决方案**:
1. 清除微信开发者工具缓存
2. 重新编译小程序
3. 检查 `pages/login/index.json` 是否已更新

### Q2: API 请求返回 401 Unauthorized

**解决方案**:
1. 检查 `SecurityConfig.java` 中是否正确放行了 `/api/auth/wechat-login`
2. 确保后端已重启
3. 检查请求头中是否包含了正确的 `Authorization` 令牌

### Q3: 无法连接到本地后端服务

**解决方案**:
1. 确保后端服务已启动（`http://localhost:8080`）
2. 在微信开发者工具中启用"不校验合法域名"选项
3. 检查防火墙是否阻止了 8080 端口

### Q4: 登录后仍然无法访问其他 API

**解决方案**:
1. 检查 JWT 令牌是否正确保存
2. 确保请求头中包含了 `Authorization: Bearer {token}`
3. 检查令牌是否已过期

## 后续改进

1. **生产环境配置**
   - 使用环境变量配置 API 基础 URL
   - 根据环境（开发/测试/生产）动态切换

2. **错误处理**
   - 添加更详细的错误提示
   - 实现错误日志记录

3. **安全加固**
   - 实现 CORS 跨域配置
   - 添加请求签名验证
   - 实现速率限制

## 文件清单

### 已修改文件
- ✅ `couple-fitness-weapp/pages/login/index.json` - 移除 Vant Toast 引用
- ✅ `couple-fitness-weapp/pages/login/index.wxml` - 移除 van-toast 标签

### 新增文件
- ✅ `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/config/SecurityConfig.java` - Spring Security 配置

## 总结

通过以上修复，小程序登录页面应该能够正常启动，并且能够成功连接到后端 API 进行认证。

**关键点**:
1. ✅ 移除了不存在的 Vant 组件引用
2. ✅ 配置了小程序 API 基础 URL
3. ✅ 在若依框架中放行了小程序认证 API
4. ✅ 使用原生 `wx.showToast()` 替代 Vant Toast

**下一步**:
- 测试登录流程
- 验证 JWT 令牌生成和验证
- 继续实现其他 P0 功能模块
