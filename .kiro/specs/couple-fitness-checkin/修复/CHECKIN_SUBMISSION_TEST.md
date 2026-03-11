# 打卡提交功能测试指南

## 修复总结

已修复打卡提交失败问题，主要修复包括：

1. **后端 CORS 配置** - 允许 OPTIONS 预检请求
2. **上传接口** - 创建 `UploadController` 处理图片上传
3. **前端上传逻辑** - 改进错误处理和状态码检查

## 环境准备

### 后端配置

**文件**: `RuoYi-Vue/ruoyi-admin/src/main/resources/application.yml`

```yaml
# 文件上传配置
ruoyi:
  profile: D:/ruoyi/uploadPath  # Windows 路径示例
  # 或 Linux/Mac: /home/ruoyi/uploadPath

file:
  upload:
    url: http://localhost:8080/profile
```

### 前端配置

**文件**: `couple-fitness-weapp/utils/request.js`

```javascript
const BASE_URL = 'http://localhost:8080';  // 确保指向正确的后端地址
```

## 启动步骤

### 1. 启动后端服务

```bash
# 进入后端目录
cd RuoYi-Vue

# 编译项目
mvn clean package

# 启动服务
cd ruoyi-admin
mvn spring-boot:run
```

服务启动后，应该看到：
```
Started RuoYiApplication in X.XXX seconds
```

### 2. 打开微信开发者工具

- 打开微信开发者工具
- 导入项目: `couple-fitness-weapp`
- 确保编译无错误

## 测试场景

### 场景 1: 基础打卡（不上传图片）

**步骤**:
1. 点击底部导航栏的"打卡"
2. 选择运动类型（例如：跑步）
3. 输入运动时长（例如：30）
4. 点击"提交"按钮

**预期结果**:
- 显示"打卡成功"提示
- 自动返回首页
- 打卡记录保存到数据库

**验证方法**:
```bash
# 查询数据库
mysql -u root -p
use couple_fitness;
SELECT * FROM check_in_record ORDER BY create_time DESC LIMIT 1;
```

### 场景 2: 打卡并上传图片

**步骤**:
1. 点击底部导航栏的"打卡"
2. 选择运动类型
3. 输入运动时长
4. 点击"拍照"或"从相册选择"
5. 选择或拍摄图片
6. 等待图片上传完成（显示"图片上传成功"）
7. 点击"提交"按钮

**预期结果**:
- 图片成功上传
- 显示"打卡成功"提示
- 自动返回首页
- 打卡记录包含图片 URL

**验证方法**:
```bash
# 查询数据库中的图片 URL
mysql -u root -p
use couple_fitness;
SELECT record_id, exercise_type, duration, photo_url FROM check_in_record 
WHERE photo_url IS NOT NULL 
ORDER BY create_time DESC LIMIT 1;
```

### 场景 3: 错误处理

#### 3.1 未选择运动类型
**步骤**:
1. 不选择运动类型
2. 输入运动时长
3. 点击"提交"

**预期结果**:
- 显示"请选择运动类型"提示
- 不提交请求

#### 3.2 未输入运动时长
**步骤**:
1. 选择运动类型
2. 不输入运动时长
3. 点击"提交"

**预期结果**:
- 显示"请输入有效的运动时长"提示
- 不提交请求

#### 3.3 网络错误
**步骤**:
1. 断开网络连接
2. 填写打卡信息
3. 点击"提交"

**预期结果**:
- 显示"网络请求失败，请检查网络连接"提示
- 不返回首页

#### 3.4 登录过期
**步骤**:
1. 清除本地存储的 token
2. 填写打卡信息
3. 点击"提交"

**预期结果**:
- 显示"登录已过期，请重新登录"提示
- 自动跳转到登录页面

## 调试技巧

### 查看控制台日志

在微信开发者工具中：
1. 打开"Console"标签
2. 查看"【打卡提交】"开头的日志
3. 查看"【图片上传】"开头的日志

### 查看网络请求

在微信开发者工具中：
1. 打开"Network"标签
2. 执行打卡操作
3. 查看请求和响应

**关键请求**:
- `POST /api/checkin/add` - 打卡提交
- `POST /api/upload/checkin-photo` - 图片上传

### 查看后端日志

后端启动时会输出日志，查看以下内容：
- `【打卡提交】` - 打卡相关日志
- `【图片上传】` - 图片上传相关日志
- `【文件上传】` - 文件保存相关日志

## 常见问题

### Q1: 提交时显示 CORS 错误

**原因**: OPTIONS 请求被拒绝

**解决方案**:
1. 确认已修改 `SecurityConfig.java`
2. 重新编译后端: `mvn clean package`
3. 重启后端服务

### Q2: 图片上传失败

**原因**: 可能是以下几种情况
- 上传目录不存在或无权限
- 文件大小超过限制（5MB）
- 文件格式不支持

**解决方案**:
1. 检查上传目录是否存在: `D:/ruoyi/uploadPath`
2. 检查文件大小是否超过 5MB
3. 确保文件格式是 jpg/jpeg/png/gif

### Q3: 打卡成功但数据库中没有记录

**原因**: 可能是数据库连接问题

**解决方案**:
1. 检查数据库是否正常运行
2. 检查 `application.yml` 中的数据库配置
3. 查看后端日志中的错误信息

### Q4: 显示"今日已打卡"但想重新打卡

**原因**: 系统防止重复打卡

**解决方案**:
1. 删除数据库中的打卡记录
2. 或者等到第二天再打卡

```bash
# 删除今天的打卡记录
mysql -u root -p
use couple_fitness;
DELETE FROM check_in_record 
WHERE user_id = 1 AND DATE(check_in_date) = CURDATE();
```

## 性能指标

### 预期响应时间

| 操作 | 预期时间 |
|------|---------|
| 打卡提交 | < 500ms |
| 图片上传 | < 2s（取决于网络和图片大小） |
| 页面返回 | < 1s |

### 文件大小限制

| 项目 | 限制 |
|------|------|
| 图片文件 | 最大 5MB |
| 图片格式 | jpg/jpeg/png/gif |

## 验证清单

- [ ] 后端服务正常启动
- [ ] 微信开发者工具无编译错误
- [ ] 基础打卡功能正常
- [ ] 图片上传功能正常
- [ ] 错误提示正确显示
- [ ] 数据库记录正确保存
- [ ] 网络错误处理正确
- [ ] 登录过期处理正确

## 相关文件

- `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java` - Spring Security 配置
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/UploadController.java` - 上传控制器
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/impl/CheckInServiceImpl.java` - 打卡服务
- `couple-fitness-weapp/pages/checkin/index.js` - 打卡页面
- `couple-fitness-weapp/utils/request.js` - HTTP 请求包装器
