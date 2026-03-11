# 打卡提交错误诊断报告

## 问题现象

打卡提交时显示"网络请求失败，请检查网络连接"错误。

## 可能的原因

### 1. 后端服务未启动或无法连接
- 检查后端服务是否正常运行
- 检查前端配置的 BASE_URL 是否正确

### 2. JWT 令牌问题
- 令牌过期或无效
- 令牌格式不正确

### 3. 请求被 Spring Security 拒绝
- OPTIONS 预检请求被拒绝（已修复）
- 认证失败

### 4. 数据库连接问题
- 数据库未启动
- 数据库配置错误

## 快速诊断步骤

### 步骤 1: 验证后端服务

```bash
# 检查后端是否启动
curl -X GET http://localhost:8080/api/checkin/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

如果返回 401，说明令牌无效或过期。

### 步骤 2: 检查前端配置

**文件**: `couple-fitness-weapp/utils/request.js`

```javascript
const BASE_URL = 'http://localhost:8080';  // 确保这是正确的地址
```

### 步骤 3: 查看后端日志

启动后端时，查看控制台输出：
```
【打卡提交】数据: ...
【打卡提交】成功: ...
```

如果没有这些日志，说明请求没有到达后端。

### 步骤 4: 检查微信开发者工具的网络标签

1. 打开微信开发者工具
2. 点击"Network"标签
3. 执行打卡操作
4. 查看请求和响应

**关键检查项**:
- 请求 URL 是否正确
- 请求头中是否包含 Authorization
- 响应状态码是什么（200, 401, 403, 500 等）

## 常见错误及解决方案

### 错误 1: 401 Unauthorized

**原因**: 令牌无效或过期

**解决方案**:
1. 重新登录
2. 检查令牌是否正确保存
3. 检查令牌是否过期

### 错误 2: 403 Forbidden

**原因**: 请求被拒绝

**解决方案**:
1. 检查 OPTIONS 请求是否被允许
2. 检查 `/api/checkin/**` 是否在允许列表中

### 错误 3: 500 Internal Server Error

**原因**: 后端服务出错

**解决方案**:
1. 查看后端日志
2. 检查数据库连接
3. 检查必填字段是否为空

### 错误 4: 网络连接失败

**原因**: 无法连接到后端

**解决方案**:
1. 检查后端服务是否启动
2. 检查 BASE_URL 是否正确
3. 检查防火墙设置
4. 检查网络连接

## 完整的测试流程

### 1. 启动后端

```bash
cd RuoYi-Vue
mvn clean package
cd ruoyi-admin
mvn spring-boot:run
```

等待看到:
```
Started RuoYiApplication in X.XXX seconds
```

### 2. 打开微信开发者工具

- 导入项目: `couple-fitness-weapp`
- 确保编译无错误

### 3. 登录

- 点击"登录"按钮
- 使用微信授权登录
- 确保看到"登录成功"提示

### 4. 打卡

- 点击底部导航栏的"打卡"
- 选择运动类型
- 输入运动时长
- 点击"提交"按钮

### 5. 验证

- 查看微信开发者工具的 Console 日志
- 查看后端日志
- 查看数据库中的打卡记录

## 调试技巧

### 添加更详细的日志

**前端**: 在 `couple-fitness-weapp/pages/checkin/index.js` 中添加日志

```javascript
console.log('【打卡提交】请求 URL:', '/api/checkin/add');
console.log('【打卡提交】请求数据:', checkInData);
console.log('【打卡提交】请求头:', headers);
```

**后端**: 在 `CheckInController.java` 中添加日志

```java
@PostMapping("/add")
public AjaxResult addCheckIn(@RequestBody CheckInRecord checkInRecord) {
    System.out.println("【打卡提交】收到请求");
    System.out.println("【打卡提交】用户ID: " + SecurityUtils.getUserId());
    System.out.println("【打卡提交】数据: " + checkInRecord);
    
    // ... 其他代码
}
```

### 使用 Postman 测试

1. 打开 Postman
2. 创建 POST 请求到 `http://localhost:8080/api/checkin/add`
3. 添加请求头: `Authorization: Bearer YOUR_TOKEN`
4. 添加请求体:
```json
{
  "exerciseType": "跑步",
  "duration": 30,
  "photoUrl": null,
  "notes": "测试打卡",
  "checkInDate": "2026-03-11"
}
```
5. 发送请求并查看响应

## 相关文件

- `couple-fitness-weapp/pages/checkin/index.js` - 打卡页面
- `couple-fitness-weapp/utils/request.js` - HTTP 请求包装器
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/CheckInController.java` - 打卡控制器
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/impl/CheckInServiceImpl.java` - 打卡服务
- `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java` - Spring Security 配置
