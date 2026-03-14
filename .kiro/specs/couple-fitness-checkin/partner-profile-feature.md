# 伴侣主页功能说明

## 功能概述

新增了伴侣个人主页功能，用户可以通过点击伴侣头像或名称查看伴侣的完整信息，包括统计数据、成就徽章、打卡记录等。

## 功能入口

### 1. 首页伴侣信息卡片
- 位置：首页"对方的状态"区域
- 点击伴侣头像或名称区域 → 跳转到伴侣主页
- 点击"查看TA的打卡记录"按钮 → 跳转到伴侣打卡记录列表

### 2. 伴侣主页展示内容

#### 头部信息卡片
- 伴侣头像（带边框装饰）
- 伴侣昵称
- 三项核心数据：
  - 连续打卡天数
  - 累计打卡次数
  - 解锁成就数量

#### 运动数据卡片
- 总卡路里消耗
- 总运动时长（分钟）
- 历史最长连续打卡天数

#### 运动偏好卡片
- 运动类型分布（柱状图）
- 显示各运动类型的次数和占比

#### 标签页内容

**成就标签页**
- 显示所有成就徽章（已解锁/未解锁）
- 已解锁成就显示彩色图标
- 未解锁成就显示灰色图标和进度
- 点击成就可查看详细说明
- 底部"查看全部成就"按钮

**打卡记录标签页**
- 显示最近6条打卡记录
- 每条记录包含：
  - 打卡照片
  - 运动类型
  - 运动时长和卡路里
  - 打卡时间
  - 点赞数和评论数
- 点击记录可查看详情
- 底部"查看全部打卡"按钮

## 技术实现

### 前端文件

1. **页面文件**
   - `couple-fitness-weapp/pages/partner-profile/index.js` - 页面逻辑
   - `couple-fitness-weapp/pages/partner-profile/index.wxml` - 页面结构
   - `couple-fitness-weapp/pages/partner-profile/index.wxss` - 页面样式
   - `couple-fitness-weapp/pages/partner-profile/index.json` - 页面配置

2. **首页修改**
   - `couple-fitness-weapp/pages/index/index.wxml` - 添加伴侣信息卡片
   - `couple-fitness-weapp/pages/index/index.wxss` - 添加伴侣卡片样式
   - `couple-fitness-weapp/pages/index/index.js` - 添加跳转方法
   - `couple-fitness-weapp/pages/index/index.json` - 添加 van-icon 组件

3. **应用配置**
   - `couple-fitness-weapp/app.json` - 注册新页面

4. **API 工具**
   - `couple-fitness-weapp/utils/api.js` - 添加获取指定用户成就的方法

### 后端文件

1. **成就控制器**
   - `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/AchievementController.java`
   - 新增接口：`GET /api/achievement/user/{userId}` - 获取指定用户的成就列表

## API 接口

### 获取指定用户成就

**接口**: `GET /api/achievement/user/{userId}`

**描述**: 获取指定用户的成就列表（用于查看伴侣成就）

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `userId`: long (用户ID)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "achievementId": 1,
      "userId": 2,
      "badgeType": "first_checkin",
      "badgeName": "初次打卡",
      "badgeDescription": "完成第一次健身打卡",
      "badgeIcon": "https://example.com/badges/first_checkin.png",
      "unlocked": true,
      "unlockedAt": "2026-02-01 10:00:00"
    }
  ]
}
```

## 使用流程

1. 用户在首页看到伴侣信息卡片
2. 点击伴侣头像或名称区域
3. 进入伴侣主页，查看完整信息
4. 可以切换"成就"和"打卡记录"标签页
5. 点击成就徽章查看详细说明
6. 点击打卡记录查看详情
7. 点击"查看全部"按钮跳转到对应列表页

## 设计特点

### 视觉设计
- 渐变背景（粉色系）
- 卡片式布局，圆角设计
- 阴影效果增强层次感
- 主题色：#FF6B9D（粉红色）

### 交互设计
- 下拉刷新支持
- 标签页切换流畅
- 点击反馈明显
- 加载状态提示

### 数据展示
- 数据可视化（柱状图）
- 图标化展示（emoji）
- 状态徽章（已打卡/未打卡）
- 进度条显示

## 注意事项

1. **权限控制**
   - 目前只检查用户是否登录
   - 未来可以添加配对关系验证，确保只能查看配对伴侣的信息

2. **数据缓存**
   - 伴侣信息从本地存储读取
   - 统计数据实时从后端获取

3. **错误处理**
   - 参数错误自动返回上一页
   - 加载失败显示错误提示
   - 网络异常友好提示

4. **性能优化**
   - 分页加载打卡记录
   - 图片懒加载
   - 数据缓存策略

## 后续优化建议

1. **功能增强**
   - 添加伴侣对比图表（双方数据对比）
   - 添加运动趋势图（折线图）
   - 添加成就解锁动画
   - 添加分享功能

2. **性能优化**
   - 实现虚拟列表（打卡记录）
   - 图片CDN加速
   - 数据预加载

3. **用户体验**
   - 添加骨架屏
   - 优化加载动画
   - 添加空状态插图
   - 添加引导提示

## 测试要点

1. **功能测试**
   - 点击伴侣头像能否正常跳转
   - 数据是否正确显示
   - 标签页切换是否正常
   - 点击成就和打卡记录是否有响应

2. **边界测试**
   - 未配对时的处理
   - 数据为空时的显示
   - 网络异常时的处理
   - 参数错误时的处理

3. **兼容性测试**
   - 不同屏幕尺寸适配
   - iOS和Android兼容性
   - 不同微信版本兼容性

## 相关文档

- [API 文档](./api-documentation.md)
- [用户指南](./user-guide.md)
- [需求文档](./requirements.md)
- [设计文档](./design.md)
