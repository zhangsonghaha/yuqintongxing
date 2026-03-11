# 设计文档 - 情侣健身打卡小程序 MVP

## 1. 系统架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                  WeChat Mini Program (Frontend)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Index, Calendar, Profile, Chat, Login       │   │
│  │  Components: CheckInCard, PartnerStatus, etc.       │   │
│  │  Utils: API, Request, Storage, Date, Validate       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot Backend (REST API)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers: CheckIn, User, Partnership, etc.      │   │
│  │  Services: Business Logic Layer                     │   │
│  │  Mappers: MyBatis Data Access                       │   │
│  │  Security: JWT Authentication & Authorization      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                            │
│  Tables: users, partnerships, check_in_records, etc.        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 前端架构

```
couple-fitness-weapp/
├── pages/
│   ├── index/              # 主页（情侣主页）
│   ├── calendar/           # 日历视图
│   ├── profile/            # 个人中心
│   ├── chat/               # 消息页面
│   └── login/              # 登录页面
├── components/
│   ├── vant/               # Vant UI 组件库
│   └── custom/
│       ├── check-in-card/  # 打卡卡片
│       ├── partner-status/ # 伴侣状态
│       ├── achievement-card/ # 成就卡片
│       └── quick-reply/    # 快速回复
├── utils/
│   ├── api.js              # API 端点定义
│   ├── request.js          # HTTP 请求包装
│   ├── storage.js          # 本地存储
│   ├── date.js             # 日期工具
│   ├── validate.js         # 验证工具
│   └── constants.js        # 常量定义
├── styles/                 # 全局样式
├── assets/                 # 静态资源
├── app.js                  # 应用入口
├── app.json                # 应用配置
└── project.config.json     # 微信配置
```

### 1.3 后端架构

```
RuoYi-Vue/
├── ruoyi-admin/
│   ├── controller/
│   │   ├── CheckInController.java
│   │   ├── UserController.java
│   │   ├── PartnershipController.java
│   │   ├── AchievementController.java
│   │   └── GoalController.java
│   ├── service/
│   │   ├── CheckInService.java
│   │   ├── UserService.java
│   │   ├── PartnershipService.java
│   │   ├── AchievementService.java
│   │   └── GoalService.java
│   ├── mapper/
│   │   ├── CheckInMapper.java
│   │   ├── UserMapper.java
│   │   ├── PartnershipMapper.java
│   │   ├── AchievementMapper.java
│   │   └── GoalMapper.java
│   └── entity/
│       ├── CheckInRecord.java
│       ├── User.java
│       ├── Partnership.java
│       ├── Achievement.java
│       └── Goal.java
├── ruoyi-framework/
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── WebConfig.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   └── exception/
│       └── GlobalExceptionHandler.java
└── ruoyi-common/
    ├── utils/
    │   ├── CalorieCalculator.java
    │   └── DateUtils.java
    └── constant/
        └── Constants.java
```

---

## 2. 数据库设计

### 2.1 表结构

#### couple_user（情侣用户表）
```sql
CREATE TABLE couple_user (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wechat_id VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(500),
  gender TINYINT,  -- 0: 保密, 1: 男, 2: 女
  height INT,      -- 身高 (cm)
  weight DECIMAL(5,2),  -- 体重 (kg)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_wechat_id (wechat_id)
);
```

#### partnership（情侣关系表）
```sql
CREATE TABLE partnership (
  partnership_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id_1 BIGINT NOT NULL,
  user_id_2 BIGINT NOT NULL,
  status VARCHAR(20),  -- pending, active, dissolved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dissolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id_1) REFERENCES couple_user(user_id),
  FOREIGN KEY (user_id_2) REFERENCES couple_user(user_id),
  UNIQUE KEY unique_partnership (user_id_1, user_id_2)
);
```

#### check_in_record（打卡记录表）
```sql
CREATE TABLE check_in_record (
  record_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  check_in_date DATE NOT NULL,
  exercise_type VARCHAR(50),  -- 运动类型
  duration INT,  -- 运动时长 (分钟)
  calories DECIMAL(8,2),  -- 卡路里消耗
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES couple_user(user_id),
  INDEX idx_user_date (user_id, check_in_date)
);
```

#### achievement（成就表）
```sql
CREATE TABLE achievement (
  achievement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  badge_type VARCHAR(50),  -- 徽章类型
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES couple_user(user_id),
  UNIQUE KEY unique_achievement (user_id, badge_type)
);
```

#### goal（目标表）
```sql
CREATE TABLE goal (
  goal_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  goal_type VARCHAR(20),  -- weekly, monthly
  target_value INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES couple_user(user_id)
);
```

#### interaction（互动表）
```sql
CREATE TABLE interaction (
  interaction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  record_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  type VARCHAR(20),  -- like, comment
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES check_in_record(record_id),
  FOREIGN KEY (user_id) REFERENCES couple_user(user_id)
);
```

---

## 3. API 设计

### 3.1 认证相关 API

#### 微信登录
```
POST /api/auth/wechat-login
Request:
{
  "code": "string"  // 微信授权码
}

Response:
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "jwt_token",
    "user": {
      "user_id": 1,
      "nickname": "张三",
      "avatar": "url"
    }
  }
}
```

### 3.2 打卡相关 API

#### 创建打卡记录
```
POST /api/checkin/add
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
{
  "exercise_type": "fitness",
  "duration": 30,
  "photo": File
}

Response:
{
  "code": 200,
  "msg": "打卡成功",
  "data": {
    "record_id": 1,
    "check_in_date": "2026-03-10",
    "calories": 150.5
  }
}
```

#### 获取打卡记录列表
```
GET /api/checkin/list?user_id=1&start_date=2026-03-01&end_date=2026-03-31&page=1&size=20
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 25,
    "records": [
      {
        "record_id": 1,
        "exercise_type": "fitness",
        "duration": 30,
        "calories": 150.5,
        "photo_url": "url",
        "created_at": "2026-03-10 10:30:00"
      }
    ]
  }
}
```

### 3.3 配对相关 API

#### 生成邀请码
```
POST /api/partnership/generate-code
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "invite_code": "123456",
    "qr_code_url": "url"
  }
}
```

#### 发送配对请求
```
POST /api/partnership/request
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "invite_code": "123456"
}

Response:
{
  "code": 200,
  "msg": "请求已发送"
}
```

#### 接受配对请求
```
POST /api/partnership/accept
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "partnership_id": 1
}

Response:
{
  "code": 200,
  "msg": "配对成功",
  "data": {
    "partnership_id": 1,
    "partner": {
      "user_id": 2,
      "nickname": "李四",
      "avatar": "url"
    }
  }
}
```

### 3.4 数据统计 API

#### 获取统计数据
```
GET /api/stats/summary?user_id=1&period=month
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total_checkins": 25,
    "consecutive_days": 7,
    "total_duration": 750,
    "total_calories": 3750,
    "exercise_types": {
      "fitness": 15,
      "running": 10
    }
  }
}
```

---

## 4. 前端页面设计

### 4.1 主页（Index）

**功能**：
- 显示今日打卡状态
- 显示伴侣今日打卡状态
- 显示本周数据对比
- 快速打卡按钮
- 最近打卡记录

**布局**：
```
┌─────────────────────────┐
│  我的状态 | 伴侣的状态   │
├─────────────────────────┤
│  本周对比（图表）        │
├─────────────────────────┤
│  [快速打卡] 按钮        │
├─────────────────────────┤
│  最近打卡记录           │
│  - 记录 1               │
│  - 记录 2               │
│  - 记录 3               │
└─────────────────────────┘
```

### 4.2 打卡页面（CheckIn）

**功能**：
- 拍照/相册选择
- 运动类型选择
- 运动时长输入
- 卡路里显示
- 提交按钮

**流程**：
```
1. 选择照片
   ↓
2. 选择运动类型（下拉菜单）
   ↓
3. 输入运动时长（数字输入）
   ↓
4. 显示预计卡路里
   ↓
5. 点击提交
   ↓
6. 显示成功提示
```

### 4.3 日历页面（Calendar）

**功能**：
- 日历视图
- 标记打卡日期
- 点击日期查看详情
- 筛选功能

**布局**：
```
┌─────────────────────────┐
│  2026年3月              │
├─────────────────────────┤
│  日 一 二 三 四 五 六   │
│  1  2  3  4  5  6  7   │
│  8  9  10 11 12 13 14  │
│  ...                    │
├─────────────────────────┤
│  筛选：[全部] [跑步]... │
├─────────────────────────┤
│  该日期的打卡记录       │
└─────────────────────────┘
```

### 4.4 个人中心（Profile）

**功能**：
- 个人信息展示
- 成就徽章展示
- 统计数据展示
- 设置选项

**布局**：
```
┌─────────────────────────┐
│  [头像] 昵称            │
│  性别 | 身高 | 体重     │
├─────────────────────────┤
│  统计数据                │
│  总打卡: 25 | 连续: 7天 │
├─────────────────────────┤
│  我的成就                │
│  [徽章1] [徽章2] ...    │
├─────────────────────────┤
│  [编辑信息] [设置]      │
└─────────────────────────┘
```

---

## 5. 关键算法设计

### 5.1 卡路里计算算法

```
基础公式：
Calories = (MET × Weight × Duration) / 60

其中：
- MET: 运动代谢当量（根据运动类型）
- Weight: 用户体重 (kg)
- Duration: 运动时长 (分钟)

运动类型 MET 值：
- 居家轻运动: 3.0
- 瑜伽: 3.5
- 跑步 (8km/h): 8.0
- 健身房力量训练: 6.0
- 户外运动: 5.0

示例：
用户体重 60kg，跑步 30 分钟
Calories = (8.0 × 60 × 30) / 60 = 240 卡路里
```

### 5.2 连续打卡天数计算

```
算法：
1. 获取用户所有打卡记录（按日期倒序）
2. 从最近日期开始遍历
3. 如果当前日期与前一天相差 1 天，计数 +1
4. 如果相差 > 1 天，停止计数
5. 返回连续天数

示例：
打卡日期: 2026-03-10, 2026-03-09, 2026-03-08, 2026-03-06
连续天数: 3 天 (从 2026-03-10 开始)
```

### 5.3 成就解锁判断

```
成就类型及条件：
1. 首次打卡: 用户第一次打卡
2. 坚持者 (7天): 连续打卡 ≥ 7 天
3. 健身达人 (30天): 连续打卡 ≥ 30 天
4. 百次挑战: 总打卡次数 ≥ 100
5. 情侣同心: 情侣对共同打卡 ≥ 50 次

检查时机：
- 每次打卡后检查
- 每日凌晨检查连续打卡
```

---

## 6. 安全设计

### 6.1 认证与授权

- 使用 JWT 令牌进行身份认证
- 令牌有效期：7 天
- 刷新令牌有效期：30 天
- 所有 API 请求需要有效令牌

### 6.2 数据加密

- 传输层：HTTPS
- 存储层：敏感数据加密（密码、身份证等）
- 图片存储：使用对象存储服务（OSS）

### 6.3 访问控制

- 用户只能访问自己的数据
- 用户只能访问配对伴侣的数据
- 管理员可以访问所有数据

### 6.4 敏感词过滤

- 评论内容敏感词过滤
- 昵称敏感词过滤
- 使用第三方敏感词库

---

## 7. 性能优化

### 7.1 前端优化

- 图片压缩：上传前压缩至 2MB 以内
- 本地缓存：缓存最近 30 天数据
- 懒加载：列表滚动时加载更多
- 减少重排：使用虚拟列表

### 7.2 后端优化

- 数据库索引：在 user_id, check_in_date 上建立索引
- 查询优化：使用分页查询
- 缓存策略：使用 Redis 缓存热数据
- 异步处理：使用消息队列处理通知

### 7.3 网络优化

- CDN 加速：静态资源使用 CDN
- 请求合并：减少 HTTP 请求数
- 压缩传输：启用 gzip 压缩

---

## 8. 测试策略

### 8.1 单元测试

- 覆盖率目标：≥ 80%
- 测试框架：JUnit + Mockito (后端)
- 测试框架：Jest (前端)

### 8.2 集成测试

- API 集成测试
- 数据库集成测试
- 第三方服务集成测试

### 8.3 性能测试

- 并发用户测试：1000+ 并发
- 响应时间测试：≤ 3 秒
- 数据库查询性能测试

### 8.4 安全测试

- SQL 注入测试
- XSS 攻击测试
- CSRF 攻击测试
- 敏感数据泄露测试

---

## 9. 部署架构

### 9.1 开发环境

```
本地开发机
├── WeChat Developer Tools (前端)
├── IntelliJ IDEA (后端)
├── MySQL 8.0 (本地数据库)
└── Redis (可选)
```

### 9.2 测试环境

```
测试服务器
├── Nginx (反向代理)
├── Spring Boot (后端)
├── MySQL 8.0 (测试数据库)
└── Redis (缓存)
```

### 9.3 生产环境

```
生产服务器
├── Nginx (负载均衡)
├── Spring Boot (多实例)
├── MySQL 8.0 (主从复制)
├── Redis (集群)
└── CDN (静态资源)
```

---

## 10. 监控与日志

### 10.1 日志记录

- 应用日志：使用 Logback
- 访问日志：记录所有 API 请求
- 错误日志：记录所有异常
- 审计日志：记录敏感操作

### 10.2 监控指标

- 系统可用性
- API 响应时间
- 数据库查询性能
- 错误率
- 用户活跃度

### 10.3 告警规则

- 系统可用性 < 99%
- API 响应时间 > 5 秒
- 错误率 > 1%
- 数据库连接数 > 80%

