# 快速开始指南 - 阶段 2.3 打卡功能

## 🚀 快速集成

### 后端集成步骤

#### 1. 数据库表创建

```sql
CREATE TABLE check_in_record (
  record_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  check_in_date DATE NOT NULL,
  exercise_type VARCHAR(50),
  duration INT,
  calories DECIMAL(10, 2),
  photo_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_user_date (user_id, check_in_date),
  INDEX idx_user_date (user_id, check_in_date),
  INDEX idx_created_at (created_at)
);
```

#### 2. 权限配置

在 RuoYi 管理系统中添加以下权限:
- `checkin:add` - 创建打卡
- `checkin:query` - 查询打卡
- `checkin:list` - 打卡列表
- `checkin:edit` - 编辑打卡
- `checkin:remove` - 删除打卡
- `checkin:upload` - 上传图片

#### 3. 文件上传配置

在 `application.yml` 中配置:

```yaml
file:
  upload:
    path: /data/upload
    url: http://localhost:8080/upload
```

#### 4. 启动应用

```bash
cd RuoYi-Vue/ruoyi-admin
mvn spring-boot:run
```

### 前端集成步骤

#### 1. 配置 API 基础 URL

在 `app.js` 中:

```javascript
globalData: {
  apiBaseUrl: 'http://localhost:8080'
}
```

#### 2. 在微信开发者工具中打开项目

```bash
# 打开 couple-fitness-weapp 目录
```

#### 3. 编译和预览

- 点击"编译"按钮
- 在模拟器中预览

---

## 📱 使用流程

### 用户打卡流程

1. **进入打卡页面**
   - 点击首页的"打卡"按钮
   - 或从底部导航栏进入

2. **选择运动类型**
   - 点击"运动类型"下拉框
   - 选择对应的运动类型

3. **输入运动时长**
   - 在"运动时长"输入框中输入分钟数
   - 系统自动计算卡路里

4. **上传打卡照片(可选)**
   - 点击"拍照"或"相册"按钮
   - 选择或拍摄照片
   - 系统自动压缩并上传

5. **添加备注(可选)**
   - 在"备注"框中输入运动感受

6. **提交打卡**
   - 点击"确认打卡"按钮
   - 系统验证并保存数据

---

## 🔧 API 测试

### 使用 Postman 测试

#### 1. 创建打卡记录

```
POST http://localhost:8080/api/checkin/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "exerciseType": "跑步",
  "duration": 30,
  "photoUrl": "http://example.com/photo.jpg",
  "notes": "今天跑步很舒服",
  "checkInDate": "2026-03-11"
}
```

**响应:**
```json
{
  "code": 200,
  "msg": "打卡成功",
  "data": {
    "recordId": 1,
    "userId": 1,
    "exerciseType": "跑步",
    "duration": 30,
    "calories": 300.00,
    "checkInDate": "2026-03-11",
    "createdAt": "2026-03-11 10:30:00"
  }
}
```

#### 2. 获取今日打卡

```
GET http://localhost:8080/api/checkin/today
Authorization: Bearer {token}
```

#### 3. 获取最近打卡

```
GET http://localhost:8080/api/checkin/recent?limit=10
Authorization: Bearer {token}
```

#### 4. 上传打卡图片

```
POST http://localhost:8080/api/upload/checkin-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [选择文件]
```

---

## 🐛 常见问题

### Q1: 上传图片失败

**原因**: 文件大小超过 5MB 或格式不支持

**解决**:
- 确保图片大小 < 5MB
- 支持的格式: jpg, jpeg, png, gif

### Q2: 打卡提交失败

**原因**: 可能是网络问题或服务器错误

**解决**:
- 检查网络连接
- 查看浏览器控制台错误信息
- 检查后端日志

### Q3: 卡路里计算不准确

**原因**: 简单估算公式可能不适合所有人

**解决**:
- 这是基于平均值的估算
- 实际消耗取决于个人体质、速度等因素
- 可在后续版本中优化算法

### Q4: 重复打卡提示

**原因**: 同一天已经打过卡了

**解决**:
- 这是系统设计,防止重复打卡
- 如需修改,可编辑之前的打卡记录

---

## 📊 数据示例

### 打卡记录示例

```json
{
  "recordId": 1,
  "userId": 1,
  "checkInDate": "2026-03-11",
  "exerciseType": "跑步",
  "duration": 30,
  "calories": 300.00,
  "photoUrl": "http://localhost:8080/upload/checkin/abc123.jpg",
  "notes": "今天天气很好,跑步很舒服",
  "createdAt": "2026-03-11 10:30:00",
  "updatedAt": "2026-03-11 10:30:00"
}
```

### 卡路里计算示例

| 运动类型 | 时长(分钟) | 消耗卡路里 |
|---------|----------|----------|
| 跑步 | 30 | 300 |
| 游泳 | 30 | 330 |
| 骑行 | 30 | 240 |
| 瑜伽 | 30 | 90 |
| 健身 | 30 | 210 |

---

## 🔍 调试技巧

### 后端调试

1. **查看日志**
   ```bash
   tail -f logs/ruoyi.log
   ```

2. **数据库查询**
   ```sql
   SELECT * FROM check_in_record WHERE user_id = 1;
   ```

3. **API 测试**
   - 使用 Postman 或 curl
   - 检查请求头和响应

### 前端调试

1. **打开开发者工具**
   - 在微信开发者工具中按 F12

2. **查看控制台**
   - 检查 JavaScript 错误
   - 查看网络请求

3. **本地存储**
   - 检查 token 是否正确保存
   - 查看缓存数据

---

## 📈 性能优化建议

### 后端优化
- 添加数据库索引
- 使用缓存(Redis)
- 分页查询大数据集

### 前端优化
- 图片懒加载
- 列表虚拟滚动
- 离线缓存

---

## 🔐 安全检查清单

- [x] JWT 认证已启用
- [x] 权限验证已配置
- [x] 文件上传已验证
- [x] SQL 注入已防护
- [x] XSS 已防护

---

## 📞 获取帮助

- 查看实现总结: `IMPLEMENTATION_2.3.md`
- 查看完成报告: `PHASE_2.3_COMPLETE.md`
- 查看设计文档: `design.md`
- 查看产品需求: `prd.md`

---

**最后更新**: 2026-03-11  
**版本**: 1.0
