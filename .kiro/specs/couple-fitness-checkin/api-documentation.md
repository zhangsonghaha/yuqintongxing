# API 文档 - 情侣健身打卡小程序

## 概述

本文档描述了情侣健身打卡小程序的所有 REST API 接口。

**基础信息**
- 基础 URL: `https://api.example.com`
- 协议: HTTPS
- 数据格式: JSON
- 字符编码: UTF-8
- 认证方式: JWT Bearer Token

**通用响应格式**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

**HTTP 状态码**
- 200: 成功
- 400: 请求参数错误
- 401: 未授权（需要登录）
- 403: 禁止访问（权限不足）
- 404: 资源不存在
- 500: 服务器内部错误

---

## 1. 认证模块 (Authentication)

### 1.1 微信登录

**接口**: `POST /api/auth/wechat-login`

**描述**: 使用微信授权码登录系统

**请求头**: 无需认证

**请求参数**:
```json
{
  "code": "string"  // 微信授权码
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "wechatId": "oABC123",
      "nickname": "张三",
      "avatar": "https://example.com/avatar.jpg",
      "gender": 1,
      "height": 175,
      "weight": 70.5
    }
  }
}
```


### 1.2 刷新令牌

**接口**: `POST /api/auth/refresh`

**描述**: 使用刷新令牌获取新的访问令牌

**请求头**: 
```
Authorization: Bearer {refresh_token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. 用户模块 (User)

### 2.1 获取用户信息

**接口**: `GET /api/user/info`

**描述**: 获取当前登录用户的详细信息

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "userId": 1,
    "wechatId": "oABC123",
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1,
    "height": 175,
    "weight": 70.5,
    "createdAt": "2026-01-01 10:00:00",
    "updatedAt": "2026-03-10 15:30:00"
  }
}
```

### 2.2 更新用户信息

**接口**: `PUT /api/user/update`

**描述**: 更新当前用户的个人信息

**请求头**: 
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "nickname": "李四",
  "gender": 1,
  "height": 180,
  "weight": 75.0
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": null
}
```


### 2.3 上传头像

**接口**: `POST /api/user/upload-avatar`

**描述**: 上传用户头像

**请求头**: 
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
- `file`: 图片文件 (支持 jpg, png, 最大 5MB)

**响应示例**:
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "avatarUrl": "https://example.com/avatars/user_1_20260310.jpg"
  }
}
```

### 2.4 注销账号

**接口**: `DELETE /api/user/delete`

**描述**: 注销当前用户账号（不可恢复）

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "账号已注销",
  "data": null
}
```

---

## 3. 配对模块 (Partnership)

### 3.1 生成邀请码

**接口**: `POST /api/partnership/generate-code`

**描述**: 为当前用户生成配对邀请码

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "inviteCode": "123456",
    "qrCodeUrl": "https://example.com/qr/123456.png",
    "expiresAt": "2026-03-17 10:00:00"
  }
}
```


### 3.2 发送配对请求

**接口**: `POST /api/partnership/request`

**描述**: 使用邀请码发送配对请求

**请求头**: 
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "inviteCode": "123456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "配对请求已发送",
  "data": {
    "partnershipId": 1,
    "status": "pending"
  }
}
```

### 3.3 接受配对请求

**接口**: `POST /api/partnership/accept`

**描述**: 接受配对请求

**请求头**: 
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "partnershipId": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "配对成功",
  "data": {
    "partnershipId": 1,
    "status": "active",
    "partner": {
      "userId": 2,
      "nickname": "李四",
      "avatar": "https://example.com/avatar2.jpg"
    }
  }
}
```

### 3.4 获取配对状态

**接口**: `GET /api/partnership/status`

**描述**: 获取当前用户的配对状态

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "hasPair": true,
    "partnershipId": 1,
    "status": "active",
    "partner": {
      "userId": 2,
      "nickname": "李四",
      "avatar": "https://example.com/avatar2.jpg"
    },
    "createdAt": "2026-02-01 10:00:00"
  }
}
```


### 3.5 解除配对

**接口**: `DELETE /api/partnership/dissolve`

**描述**: 解除当前配对关系

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "配对已解除",
  "data": null
}
```

---

## 4. 打卡模块 (Check-in)

### 4.1 创建打卡记录

**接口**: `POST /api/checkin/add`

**描述**: 创建新的健身打卡记录

**请求头**: 
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
- `exerciseType`: string (运动类型: home, gym, outdoor, running, yoga, strength)
- `duration`: integer (运动时长，分钟，1-300)
- `checkInDate`: string (打卡日期，格式: YYYY-MM-DD)
- `photo`: File (可选，照片文件)
- `latitude`: double (可选，纬度)
- `longitude`: double (可选，经度)
- `locationName`: string (可选，地点名称)

**响应示例**:
```json
{
  "code": 200,
  "msg": "打卡成功",
  "data": {
    "recordId": 1,
    "userId": 1,
    "exerciseType": "running",
    "duration": 30,
    "calories": 240.5,
    "checkInDate": "2026-03-10",
    "photoUrl": "https://example.com/checkins/record_1.jpg",
    "locationName": "人民公园",
    "createdAt": "2026-03-10 10:30:00"
  }
}
```


### 4.2 获取打卡记录列表

**接口**: `GET /api/checkin/list`

**描述**: 获取打卡记录列表（支持分页和筛选）

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `userId`: long (可选，用户ID，默认当前用户)
- `startDate`: string (可选，开始日期，格式: YYYY-MM-DD)
- `endDate`: string (可选，结束日期，格式: YYYY-MM-DD)
- `exerciseType`: string (可选，运动类型筛选)
- `pageNum`: integer (页码，默认 1)
- `pageSize`: integer (每页数量，默认 20)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 45,
    "pageNum": 1,
    "pageSize": 20,
    "records": [
      {
        "recordId": 1,
        "userId": 1,
        "exerciseType": "running",
        "duration": 30,
        "calories": 240.5,
        "checkInDate": "2026-03-10",
        "photoUrl": "https://example.com/checkins/record_1.jpg",
        "locationName": "人民公园",
        "likeCount": 1,
        "commentCount": 2,
        "createdAt": "2026-03-10 10:30:00"
      }
    ]
  }
}
```

### 4.3 获取打卡记录详情

**接口**: `GET /api/checkin/{recordId}`

**描述**: 获取指定打卡记录的详细信息

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `recordId`: long (打卡记录ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "recordId": 1,
    "userId": 1,
    "user": {
      "userId": 1,
      "nickname": "张三",
      "avatar": "https://example.com/avatar.jpg"
    },
    "exerciseType": "running",
    "duration": 30,
    "calories": 240.5,
    "checkInDate": "2026-03-10",
    "photoUrl": "https://example.com/checkins/record_1.jpg",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "locationName": "人民公园",
    "likeCount": 1,
    "commentCount": 2,
    "isLiked": true,
    "createdAt": "2026-03-10 10:30:00"
  }
}
```


### 4.4 删除打卡记录

**接口**: `DELETE /api/checkin/{recordId}`

**描述**: 删除指定的打卡记录

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `recordId`: long (打卡记录ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null
}
```

### 4.5 获取伴侣打卡记录

**接口**: `GET /api/checkin/partner/list`

**描述**: 获取配对伴侣的打卡记录列表

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `startDate`: string (可选，开始日期)
- `endDate`: string (可选，结束日期)
- `pageNum`: integer (页码，默认 1)
- `pageSize`: integer (每页数量，默认 20)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 38,
    "records": [
      {
        "recordId": 2,
        "userId": 2,
        "user": {
          "userId": 2,
          "nickname": "李四",
          "avatar": "https://example.com/avatar2.jpg"
        },
        "exerciseType": "yoga",
        "duration": 45,
        "calories": 180.0,
        "checkInDate": "2026-03-10",
        "photoUrl": "https://example.com/checkins/record_2.jpg",
        "likeCount": 1,
        "commentCount": 1,
        "createdAt": "2026-03-10 09:00:00"
      }
    ]
  }
}
```

---

## 5. 互动模块 (Interaction)

### 5.1 点赞打卡记录

**接口**: `POST /api/interaction/like`

**描述**: 为打卡记录点赞

**请求头**: 
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "recordId": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "点赞成功",
  "data": {
    "interactionId": 1,
    "likeCount": 2
  }
}
```


### 5.2 取消点赞

**接口**: `DELETE /api/interaction/like/{recordId}`

**描述**: 取消对打卡记录的点赞

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `recordId`: long (打卡记录ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "取消点赞成功",
  "data": null
}
```

### 5.3 添加评论

**接口**: `POST /api/interaction/comment`

**描述**: 为打卡记录添加评论

**请求头**: 
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "recordId": 1,
  "content": "加油！坚持就是胜利！"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "评论成功",
  "data": {
    "interactionId": 2,
    "recordId": 1,
    "userId": 2,
    "type": "comment",
    "content": "加油！坚持就是胜利！",
    "createdAt": "2026-03-10 11:00:00"
  }
}
```

### 5.4 获取评论列表

**接口**: `GET /api/interaction/comments/{recordId}`

**描述**: 获取指定打卡记录的评论列表

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `recordId`: long (打卡记录ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "interactionId": 2,
      "recordId": 1,
      "userId": 2,
      "user": {
        "userId": 2,
        "nickname": "李四",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "type": "comment",
      "content": "加油！坚持就是胜利！",
      "createdAt": "2026-03-10 11:00:00"
    }
  ]
}
```


### 5.5 删除评论

**接口**: `DELETE /api/interaction/comment/{interactionId}`

**描述**: 删除指定的评论

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `interactionId`: long (互动记录ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null
}
```

---

## 6. 统计模块 (Statistics)

### 6.1 获取用户统计数据

**接口**: `GET /api/stats/summary`

**描述**: 获取用户的健身统计数据

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `userId`: long (可选，用户ID，默认当前用户)
- `period`: string (统计周期: week, month, year)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "totalCheckIns": 45,
    "consecutiveDays": 7,
    "maxConsecutiveDays": 15,
    "totalDuration": 1350,
    "totalCalories": 6750.5,
    "exerciseTypeDistribution": {
      "running": 20,
      "gym": 15,
      "yoga": 10
    },
    "weeklyData": {
      "checkIns": 5,
      "duration": 150,
      "calories": 750.0
    },
    "monthlyData": {
      "checkIns": 22,
      "duration": 660,
      "calories": 3300.0
    }
  }
}
```


### 6.2 获取伴侣统计数据

**接口**: `GET /api/stats/partner/summary`

**描述**: 获取配对伴侣的统计数据

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `period`: string (统计周期: week, month, year)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "totalCheckIns": 38,
    "consecutiveDays": 5,
    "maxConsecutiveDays": 12,
    "totalDuration": 1140,
    "totalCalories": 5700.0,
    "weeklyData": {
      "checkIns": 4,
      "duration": 120,
      "calories": 600.0
    }
  }
}
```

### 6.3 获取趋势数据

**接口**: `GET /api/stats/trend`

**描述**: 获取最近30天的运动趋势数据

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `userId`: long (可选，用户ID，默认当前用户)
- `days`: integer (天数，默认 30)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "dates": ["2026-02-09", "2026-02-10", "...", "2026-03-10"],
    "durations": [30, 45, 0, 60, 30, "..."],
    "calories": [240, 360, 0, 480, 240, "..."],
    "checkIns": [1, 1, 0, 1, 1, "..."]
  }
}
```

### 6.4 获取运动类型分布

**接口**: `GET /api/stats/exercise-distribution`

**描述**: 获取用户的运动类型分布统计

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `userId`: long (可选，用户ID，默认当前用户)
- `startDate`: string (可选，开始日期)
- `endDate`: string (可选，结束日期)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "running": {
      "count": 20,
      "percentage": 44.4,
      "totalDuration": 600,
      "totalCalories": 4800.0
    },
    "gym": {
      "count": 15,
      "percentage": 33.3,
      "totalDuration": 450,
      "totalCalories": 2700.0
    },
    "yoga": {
      "count": 10,
      "percentage": 22.2,
      "totalDuration": 300,
      "totalCalories": 1200.0
    }
  }
}
```


---

## 7. 目标模块 (Goal)

### 7.1 创建目标

**接口**: `POST /api/goal/create`

**描述**: 创建新的健身目标

**请求头**: 
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "goalType": "weekly",
  "targetValue": 5,
  "description": "每周打卡5次"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "目标创建成功",
  "data": {
    "goalId": 1,
    "userId": 1,
    "goalType": "weekly",
    "targetValue": 5,
    "currentValue": 0,
    "description": "每周打卡5次",
    "status": "active",
    "createdAt": "2026-03-10 10:00:00"
  }
}
```

### 7.2 获取目标列表

**接口**: `GET /api/goal/list`

**描述**: 获取用户的目标列表

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `status`: string (可选，目标状态: active, completed, expired)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "goalId": 1,
      "userId": 1,
      "goalType": "weekly",
      "targetValue": 5,
      "currentValue": 3,
      "description": "每周打卡5次",
      "status": "active",
      "progress": 60.0,
      "createdAt": "2026-03-10 10:00:00"
    }
  ]
}
```

### 7.3 更新目标

**接口**: `PUT /api/goal/{goalId}`

**描述**: 更新指定目标

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `goalId`: long (目标ID)

**请求参数**:
```json
{
  "targetValue": 7,
  "description": "每周打卡7次"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": null
}
```


### 7.4 删除目标

**接口**: `DELETE /api/goal/{goalId}`

**描述**: 删除指定目标

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `goalId`: long (目标ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null
}
```

---

## 8. 成就模块 (Achievement)

### 8.1 获取成就列表

**接口**: `GET /api/achievement/list`

**描述**: 获取用户的成就列表

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `userId`: long (可选，用户ID，默认当前用户)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "achievementId": 1,
      "userId": 1,
      "badgeType": "first_checkin",
      "badgeName": "初次打卡",
      "badgeDescription": "完成第一次健身打卡",
      "badgeIcon": "https://example.com/badges/first_checkin.png",
      "unlocked": true,
      "unlockedAt": "2026-02-01 10:00:00"
    },
    {
      "achievementId": 2,
      "userId": 1,
      "badgeType": "consecutive_7",
      "badgeName": "坚持者",
      "badgeDescription": "连续打卡7天",
      "badgeIcon": "https://example.com/badges/consecutive_7.png",
      "unlocked": true,
      "unlockedAt": "2026-02-08 10:00:00"
    },
    {
      "achievementId": 3,
      "userId": 1,
      "badgeType": "consecutive_30",
      "badgeName": "健身达人",
      "badgeDescription": "连续打卡30天",
      "badgeIcon": "https://example.com/badges/consecutive_30.png",
      "unlocked": false,
      "progress": 23.3,
      "currentValue": 7,
      "targetValue": 30
    }
  ]
}
```

### 8.2 获取成就详情

**接口**: `GET /api/achievement/{achievementId}`

**描述**: 获取指定成就的详细信息

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `achievementId`: long (成就ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "achievementId": 1,
    "userId": 1,
    "badgeType": "first_checkin",
    "badgeName": "初次打卡",
    "badgeDescription": "完成第一次健身打卡",
    "badgeIcon": "https://example.com/badges/first_checkin.png",
    "unlocked": true,
    "unlockedAt": "2026-02-01 10:00:00"
  }
}
```


---

## 9. 通知模块 (Notification)

### 9.1 获取通知列表

**接口**: `GET /api/notification/list`

**描述**: 获取用户的通知列表

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `type`: string (可选，通知类型: checkin, like, comment, goal, achievement)
- `read`: boolean (可选，是否已读)
- `pageNum`: integer (页码，默认 1)
- `pageSize`: integer (每页数量，默认 20)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 15,
    "unreadCount": 3,
    "records": [
      {
        "notificationId": 1,
        "userId": 1,
        "type": "checkin",
        "title": "伴侣打卡提醒",
        "content": "李四完成了今日打卡：跑步 30分钟",
        "relatedId": 2,
        "read": false,
        "createdAt": "2026-03-10 10:30:00"
      }
    ]
  }
}
```

### 9.2 标记通知为已读

**接口**: `PUT /api/notification/{notificationId}/read`

**描述**: 标记指定通知为已读

**请求头**: 
```
Authorization: Bearer {token}
```

**路径参数**:
- `notificationId`: long (通知ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "标记成功",
  "data": null
}
```

### 9.3 标记所有通知为已读

**接口**: `PUT /api/notification/read-all`

**描述**: 标记所有通知为已读

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "标记成功",
  "data": null
}
```

### 9.4 获取通知设置

**接口**: `GET /api/notification/settings`

**描述**: 获取用户的通知设置

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "checkinNotification": true,
    "likeNotification": true,
    "commentNotification": true,
    "goalNotification": true,
    "achievementNotification": true,
    "reminderEnabled": true,
    "reminderTimes": ["08:00", "18:00"]
  }
}
```


### 9.5 更新通知设置

**接口**: `PUT /api/notification/settings`

**描述**: 更新用户的通知设置

**请求头**: 
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "checkinNotification": true,
  "likeNotification": true,
  "commentNotification": false,
  "goalNotification": true,
  "achievementNotification": true,
  "reminderEnabled": true,
  "reminderTimes": ["08:00", "18:00", "20:00"]
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": null
}
```

---

## 10. 文件上传模块 (File Upload)

### 10.1 上传图片

**接口**: `POST /api/upload/image`

**描述**: 上传图片文件

**请求头**: 
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
- `file`: File (图片文件，支持 jpg, png, gif，最大 5MB)
- `type`: string (图片类型: avatar, checkin, other)

**响应示例**:
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "url": "https://example.com/uploads/20260310/abc123.jpg",
    "fileName": "abc123.jpg",
    "fileSize": 1024000,
    "uploadTime": "2026-03-10 10:30:00"
  }
}
```

---

## 11. 错误码说明

### 通用错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权 | 需要登录或令牌已过期 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 检查请求的资源ID是否正确 |
| 500 | 服务器内部错误 | 联系技术支持 |

### 业务错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 1001 | 用户不存在 | 检查用户ID |
| 1002 | 用户已存在 | 使用其他账号 |
| 1003 | 密码错误 | 检查密码 |
| 2001 | 配对关系不存在 | 先完成配对 |
| 2002 | 已有配对关系 | 先解除现有配对 |
| 2003 | 邀请码无效 | 检查邀请码 |
| 2004 | 邀请码已过期 | 重新生成邀请码 |
| 3001 | 打卡记录不存在 | 检查记录ID |
| 3002 | 打卡日期重复 | 每天只能打卡一次 |
| 3003 | 运动时长超出范围 | 时长应在1-300分钟之间 |
| 4001 | 已点赞 | 不能重复点赞 |
| 4002 | 评论内容包含敏感词 | 修改评论内容 |
| 4003 | 评论长度超限 | 评论不超过200字 |
| 5001 | 文件格式不支持 | 仅支持jpg, png, gif |
| 5002 | 文件大小超限 | 文件不超过5MB |


---

## 12. 数据模型

### 12.1 用户 (User)

```json
{
  "userId": "long, 用户ID",
  "wechatId": "string, 微信ID",
  "nickname": "string, 昵称",
  "avatar": "string, 头像URL",
  "gender": "integer, 性别 (0:保密, 1:男, 2:女)",
  "height": "integer, 身高(cm)",
  "weight": "double, 体重(kg)",
  "createdAt": "string, 创建时间",
  "updatedAt": "string, 更新时间"
}
```

### 12.2 配对关系 (Partnership)

```json
{
  "partnershipId": "long, 配对ID",
  "userId1": "long, 用户1 ID",
  "userId2": "long, 用户2 ID",
  "status": "string, 状态 (pending, active, dissolved)",
  "createdAt": "string, 创建时间",
  "dissolvedAt": "string, 解除时间"
}
```

### 12.3 打卡记录 (CheckInRecord)

```json
{
  "recordId": "long, 记录ID",
  "userId": "long, 用户ID",
  "exerciseType": "string, 运动类型",
  "duration": "integer, 运动时长(分钟)",
  "calories": "double, 卡路里消耗",
  "checkInDate": "string, 打卡日期",
  "photoUrl": "string, 照片URL",
  "latitude": "double, 纬度",
  "longitude": "double, 经度",
  "locationName": "string, 地点名称",
  "likeCount": "integer, 点赞数",
  "commentCount": "integer, 评论数",
  "createdAt": "string, 创建时间"
}
```

### 12.4 互动记录 (Interaction)

```json
{
  "interactionId": "long, 互动ID",
  "recordId": "long, 打卡记录ID",
  "userId": "long, 用户ID",
  "type": "string, 类型 (like, comment)",
  "content": "string, 评论内容",
  "createdAt": "string, 创建时间"
}
```

### 12.5 目标 (Goal)

```json
{
  "goalId": "long, 目标ID",
  "userId": "long, 用户ID",
  "goalType": "string, 目标类型 (weekly, monthly)",
  "targetValue": "integer, 目标值",
  "currentValue": "integer, 当前值",
  "description": "string, 描述",
  "status": "string, 状态 (active, completed, expired)",
  "progress": "double, 完成进度(%)",
  "createdAt": "string, 创建时间",
  "completedAt": "string, 完成时间"
}
```

### 12.6 成就 (Achievement)

```json
{
  "achievementId": "long, 成就ID",
  "userId": "long, 用户ID",
  "badgeType": "string, 徽章类型",
  "badgeName": "string, 徽章名称",
  "badgeDescription": "string, 徽章描述",
  "badgeIcon": "string, 徽章图标URL",
  "unlocked": "boolean, 是否解锁",
  "unlockedAt": "string, 解锁时间",
  "progress": "double, 进度(%)",
  "currentValue": "integer, 当前值",
  "targetValue": "integer, 目标值"
}
```


---

## 13. 认证与授权

### 13.1 JWT 令牌

所有需要认证的接口都需要在请求头中携带 JWT 令牌：

```
Authorization: Bearer {token}
```

### 13.2 令牌获取

通过微信登录接口获取令牌：

```
POST /api/auth/wechat-login
```

### 13.3 令牌有效期

- 访问令牌 (Access Token): 7天
- 刷新令牌 (Refresh Token): 30天

### 13.4 令牌刷新

当访问令牌过期时，使用刷新令牌获取新的访问令牌：

```
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

### 13.5 权限控制

- 用户只能访问自己的数据
- 用户可以访问配对伴侣的公开数据
- 管理员可以访问所有数据

---

## 14. 请求示例

### 14.1 使用 cURL

```bash
# 微信登录
curl -X POST https://api.example.com/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{"code":"wx_auth_code"}'

# 创建打卡记录
curl -X POST https://api.example.com/api/checkin/add \
  -H "Authorization: Bearer {token}" \
  -F "exerciseType=running" \
  -F "duration=30" \
  -F "checkInDate=2026-03-10" \
  -F "photo=@/path/to/photo.jpg"

# 获取打卡记录列表
curl -X GET "https://api.example.com/api/checkin/list?pageNum=1&pageSize=20" \
  -H "Authorization: Bearer {token}"
```

### 14.2 使用 JavaScript (微信小程序)

```javascript
// 微信登录
wx.request({
  url: 'https://api.example.com/api/auth/wechat-login',
  method: 'POST',
  data: {
    code: 'wx_auth_code'
  },
  success: (res) => {
    console.log(res.data);
    wx.setStorageSync('token', res.data.data.token);
  }
});

// 创建打卡记录
wx.uploadFile({
  url: 'https://api.example.com/api/checkin/add',
  filePath: tempFilePath,
  name: 'photo',
  header: {
    'Authorization': 'Bearer ' + wx.getStorageSync('token')
  },
  formData: {
    exerciseType: 'running',
    duration: 30,
    checkInDate: '2026-03-10'
  },
  success: (res) => {
    console.log(res.data);
  }
});

// 获取打卡记录列表
wx.request({
  url: 'https://api.example.com/api/checkin/list',
  method: 'GET',
  header: {
    'Authorization': 'Bearer ' + wx.getStorageSync('token')
  },
  data: {
    pageNum: 1,
    pageSize: 20
  },
  success: (res) => {
    console.log(res.data);
  }
});
```


---

## 15. 最佳实践

### 15.1 错误处理

始终检查响应的 `code` 字段：

```javascript
wx.request({
  url: 'https://api.example.com/api/checkin/add',
  method: 'POST',
  data: { /* ... */ },
  success: (res) => {
    if (res.data.code === 200) {
      // 成功处理
      console.log('操作成功', res.data.data);
    } else {
      // 错误处理
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      });
    }
  },
  fail: (err) => {
    // 网络错误处理
    wx.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  }
});
```

### 15.2 令牌管理

自动处理令牌过期：

```javascript
function request(options) {
  const token = wx.getStorageSync('token');
  
  return wx.request({
    ...options,
    header: {
      ...options.header,
      'Authorization': 'Bearer ' + token
    },
    fail: (err) => {
      if (err.statusCode === 401) {
        // 令牌过期，跳转到登录页
        wx.redirectTo({
          url: '/pages/login/index'
        });
      }
    }
  });
}
```

### 15.3 图片上传优化

上传前压缩图片：

```javascript
wx.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success: (res) => {
    const tempFilePath = res.tempFilePaths[0];
    
    // 上传图片
    wx.uploadFile({
      url: 'https://api.example.com/api/upload/image',
      filePath: tempFilePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      formData: {
        type: 'checkin'
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        console.log('上传成功', data.data.url);
      }
    });
  }
});
```

### 15.4 分页加载

实现下拉刷新和上拉加载：

```javascript
Page({
  data: {
    records: [],
    pageNum: 1,
    pageSize: 20,
    hasMore: true
  },
  
  onLoad() {
    this.loadRecords();
  },
  
  onPullDownRefresh() {
    this.setData({
      records: [],
      pageNum: 1,
      hasMore: true
    });
    this.loadRecords();
  },
  
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.loadRecords();
    }
  },
  
  loadRecords() {
    wx.request({
      url: 'https://api.example.com/api/checkin/list',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        if (res.data.code === 200) {
          const newRecords = res.data.data.records;
          this.setData({
            records: [...this.data.records, ...newRecords],
            hasMore: newRecords.length === this.data.pageSize
          });
        }
        wx.stopPullDownRefresh();
      }
    });
  }
});
```


---

## 16. 性能优化建议

### 16.1 请求优化

- 使用分页查询，避免一次性加载大量数据
- 合理设置缓存策略，减少重复请求
- 使用 CDN 加速静态资源访问

### 16.2 图片优化

- 上传前压缩图片至 2MB 以内
- 使用缩略图展示列表，点击查看原图
- 使用图片懒加载技术

### 16.3 数据缓存

- 缓存用户信息、配对信息等不常变化的数据
- 缓存最近30天的打卡记录
- 定期清理过期缓存

---

## 17. 安全建议

### 17.1 数据传输

- 所有接口必须使用 HTTPS
- 敏感数据加密传输
- 防止中间人攻击

### 17.2 输入验证

- 前端和后端都要进行参数验证
- 防止 SQL 注入
- 防止 XSS 攻击

### 17.3 权限控制

- 严格验证用户身份
- 检查用户权限
- 防止越权访问

---

## 18. 版本历史

### v1.0.0 (2026-03-10)

- 初始版本发布
- 实现用户认证、配对、打卡、互动、统计、目标、成就、通知等核心功能

---

## 19. 联系方式

**技术支持**
- 邮箱: support@example.com
- 电话: 400-xxx-xxxx
- 工作时间: 周一至周五 9:00-18:00

**API 问题反馈**
- GitHub Issues: https://github.com/example/couple-fitness-api/issues
- 开发者社区: https://community.example.com

---

## 20. 附录

### 20.1 运动类型枚举

| 值 | 说明 | MET值 |
|----|------|-------|
| home | 居家运动 | 3.0 |
| gym | 健身房 | 6.0 |
| outdoor | 户外运动 | 5.0 |
| running | 跑步 | 8.0 |
| yoga | 瑜伽 | 3.5 |
| strength | 力量训练 | 6.0 |

### 20.2 成就徽章类型

| 类型 | 名称 | 条件 |
|------|------|------|
| first_checkin | 初次打卡 | 完成第一次打卡 |
| consecutive_3 | 三天坚持 | 连续打卡3天 |
| consecutive_7 | 坚持者 | 连续打卡7天 |
| consecutive_30 | 健身达人 | 连续打卡30天 |
| consecutive_100 | 百日挑战 | 连续打卡100天 |
| total_100 | 百次打卡 | 累计打卡100次 |
| couple_50 | 情侣同心 | 情侣共同打卡50次 |

### 20.3 通知类型

| 类型 | 说明 |
|------|------|
| checkin | 伴侣打卡通知 |
| like | 点赞通知 |
| comment | 评论通知 |
| goal | 目标完成通知 |
| achievement | 成就解锁通知 |
| reminder | 运动提醒 |

---

**文档版本**: v1.0.0  
**最后更新**: 2026-03-10  
**维护者**: 开发团队
