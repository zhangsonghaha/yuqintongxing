# 情侣健身打卡小程序 MVP - 完整规格文档

## 文档概览

本规格文档包含情侣健身打卡小程序 MVP 版本的完整产品和技术规范。

### 文档结构

| 文档 | 用途 | 受众 |
|------|------|------|
| **prd.md** | 产品需求文档 | 产品经理、设计师、项目经理 |
| **requirements.md** | 技术需求文档 (EARS 格式) | 开发工程师、QA |
| **design.md** | 技术设计文档 | 开发工程师、架构师 |
| **tasks.md** | 实现任务清单 | 项目经理、开发工程师 |

---

## 快速导航

### 产品相关
- [产品概述](prd.md#1-产品概述)
- [用户分析](prd.md#2-用户分析)
- [功能范围](prd.md#3-mvp-功能范围)
- [成功指标](prd.md#9-成功标准)

### 技术相关
- [系统架构](design.md#1-系统架构设计)
- [数据库设计](design.md#2-数据库设计)
- [API 设计](design.md#3-api-设计)
- [安全设计](design.md#6-安全设计)

### 实现相关
- [任务清单](tasks.md)
- [开发阶段](prd.md#8-项目计划)
- [团队配置](prd.md#8-项目计划)

---

## 核心信息速查

### 项目基本信息
- **项目名称**: 情侣健身打卡小程序
- **版本**: MVP (最小可行产品)
- **开发周期**: 8-12 周
- **目标用户**: 18-40 岁情侣
- **发布平台**: 微信小程序

### 技术栈
- **前端**: WeChat Mini Program + JavaScript ES6+ + Vant Weapp
- **后端**: Spring Boot 2.5.15 + Java 8+
- **数据库**: MySQL 8.0+
- **认证**: JWT + Spring Security

### MVP 核心功能
1. ✅ 微信登录与情侣配对
2. ✅ 3 秒快速打卡
3. ✅ 情侣主页数据对比
4. ✅ 打卡互动 (点赞、评论)
5. ✅ 历史记录查询
6. ✅ 数据统计与报告
7. ✅ 目标管理
8. ✅ 成就系统
9. ✅ 实时通知
10. ✅ 个人中心

### 性能目标
| 指标 | 目标 |
|------|------|
| 启动时间 | ≤ 3 秒 |
| 打卡完成时间 | ≤ 3 秒 |
| 系统可用性 | ≥ 99.5% |
| 并发用户数 | ≥ 1000 |
| 周留存率 | ≥ 60% |

### 成功指标
- DAU ≥ 500
- 周留存率 ≥ 60%
- 月留存率 ≥ 40%
- 用户满意度 ≥ 4.5/5.0

---

## 开发阶段概览

### Phase 1: 需求设计 (Week 1)
- 需求评审
- 原型设计
- 环境准备

### Phase 2: P0 功能 (Week 2-4)
- 用户认证系统
- 情侣配对系统
- 快速打卡功能
- 情侣主页

### Phase 3: P1 功能 (Week 5-7)
- 打卡互动功能
- 历史记录查询
- 数据统计与报告

### Phase 4: P2 功能 (Week 8-10)
- 目标管理系统
- 成就系统
- 通知系统

### Phase 5: 个人中心 (Week 10-11)
- 个人信息管理
- 隐私与安全

### Phase 6: 测试优化 (Week 11-12)
- 功能测试
- 性能测试
- 安全测试
- 优化

### Phase 7: 发布准备 (Week 12)
- 上线前检查
- 部署准备
- 灰度发布

---

## 关键决策

### 架构决策
1. **前端**: 使用原生微信小程序，不使用 Taro/uni-app
   - 原因: 简化开发流程，减少依赖
   
2. **状态管理**: 使用 getApp() 全局变量 + wx.setStorageSync()
   - 原因: MVP 阶段功能简单，无需复杂状态管理库
   
3. **后端**: 基于 RuoYi-Vue 框架
   - 原因: 快速开发，内置权限管理和代码生成工具

4. **数据库**: MySQL 8.0+
   - 原因: 成熟稳定，支持 JSON 类型，性能优异

### 功能决策
1. **不包含虚拟宠物**: MVP 阶段不实现
   - 原因: 复杂度高，可在 V1.0 阶段实现
   
2. **不包含社交分享**: MVP 阶段不实现
   - 原因: 优先核心功能，分享可在后续版本添加

3. **不包含排行榜**: MVP 阶段不实现
   - 原因: 用户基数小，可在用户增长后实现

---

## 数据模型概览

### 核心实体
- **CoupleUser**: 情侣用户账户信息（独立表，避免与 sys_user 冲突）
- **Partnership**: 情侣关系
- **CheckInRecord**: 打卡记录
- **Achievement**: 成就徽章
- **Goal**: 健身目标
- **Interaction**: 打卡互动 (点赞、评论)

### 关键关系
```
CoupleUser (1) ←→ (2) Partnership
CoupleUser (1) ←→ (N) CheckInRecord
CoupleUser (1) ←→ (N) Achievement
CoupleUser (1) ←→ (N) Goal
CheckInRecord (1) ←→ (N) Interaction
```

---

## API 概览

### 认证相关
- `POST /api/auth/wechat-login` - 微信登录

### 打卡相关
- `POST /api/checkin/add` - 创建打卡记录
- `GET /api/checkin/list` - 获取打卡记录列表
- `DELETE /api/checkin/{id}` - 删除打卡记录

### 配对相关
- `POST /api/partnership/generate-code` - 生成邀请码
- `POST /api/partnership/request` - 发送配对请求
- `POST /api/partnership/accept` - 接受配对请求
- `POST /api/partnership/dissolve` - 解除配对

### 统计相关
- `GET /api/stats/summary` - 获取统计数据
- `GET /api/stats/trend` - 获取趋势数据

### 互动相关
- `POST /api/interaction/like` - 点赞
- `POST /api/interaction/comment` - 评论
- `DELETE /api/interaction/{id}` - 删除互动

### 目标相关
- `POST /api/goal/create` - 创建目标
- `PUT /api/goal/{id}` - 更新目标
- `GET /api/goal/{id}` - 获取目标

### 成就相关
- `GET /api/achievement/list` - 获取成就列表

### 通知相关
- `GET /api/notification/list` - 获取通知列表
- `PUT /api/notification/settings` - 更新通知设置

---

## 前端页面结构

```
App
├── pages/
│   ├── login/
│   │   └── 微信授权登录
│   ├── index/
│   │   └── 情侣主页 (打卡状态、数据对比、快速打卡)
│   ├── calendar/
│   │   └── 日历视图 (打卡记录、筛选)
│   ├── profile/
│   │   └── 个人中心 (信息、成就、统计、设置)
│   └── chat/
│       └── 消息页面 (互动、通知)
└── components/
    ├── check-in-card/
    ├── partner-status/
    ├── achievement-card/
    └── quick-reply/
```

---

## 后端模块结构

```
ruoyi-admin/
├── controller/
│   ├── CheckInController
│   ├── UserController
│   ├── PartnershipController
│   ├── AchievementController
│   ├── GoalController
│   └── InteractionController
├── service/
│   ├── CheckInService
│   ├── UserService
│   ├── PartnershipService
│   ├── AchievementService
│   ├── GoalService
│   └── InteractionService
├── mapper/
│   ├── CheckInMapper
│   ├── UserMapper
│   ├── PartnershipMapper
│   ├── AchievementMapper
│   ├── GoalMapper
│   └── InteractionMapper
└── entity/
    ├── CheckInRecord
    ├── User
    ├── Partnership
    ├── Achievement
    ├── Goal
    └── Interaction
```

---

## 安全考虑

### 认证与授权
- JWT 令牌认证 (7 天有效期)
- 刷新令牌 (30 天有效期)
- 基于角色的访问控制 (RBAC)

### 数据保护
- HTTPS 传输加密
- 敏感数据存储加密
- 敏感词过滤

### 隐私保护
- 用户只能访问自己的数据
- 用户只能访问配对伴侣的数据
- 支持隐私设置
- 账号注销时完全删除数据

---

## 性能优化策略

### 前端优化
- 图片压缩 (≤ 2MB)
- 本地缓存 (30 天数据)
- 懒加载
- 虚拟列表

### 后端优化
- 数据库索引
- 查询分页
- Redis 缓存
- 异步处理

### 网络优化
- CDN 加速
- 请求合并
- gzip 压缩

---

## 测试策略

### 单元测试
- 覆盖率 ≥ 80%
- 后端: JUnit + Mockito
- 前端: Jest

### 集成测试
- API 集成测试
- 数据库集成测试

### 性能测试
- 并发用户测试 (1000+)
- 响应时间测试
- 数据库性能测试

### 安全测试
- SQL 注入测试
- XSS 攻击测试
- CSRF 攻击测试

---

## 部署架构

### 开发环境
- 本地开发机
- WeChat Developer Tools
- 本地 MySQL + Redis

### 测试环境
- 测试服务器
- Nginx 反向代理
- MySQL 8.0
- Redis

### 生产环境
- 生产服务器集群
- Nginx 负载均衡
- MySQL 主从复制
- Redis 集群
- CDN

---

## 监控与告警

### 关键指标
- 系统可用性
- API 响应时间
- 错误率
- 用户活跃度

### 告警规则
- 可用性 < 99%
- 响应时间 > 5 秒
- 错误率 > 1%

---

## 风险管理

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 微信 API 变更 | 低 | 中 | 定期检查官方文档 |
| 性能瓶颈 | 中 | 高 | 提前进行压力测试 |
| 用户获取困难 | 中 | 高 | 提前规划推广策略 |
| 数据安全问题 | 低 | 高 | 严格的安全审计 |

---

## 后续版本规划

### V1.0 (3-6 个月后)
- 虚拟宠物系统
- 赌注/打赌功能
- 能量银行系统
- 神秘盒子奖励

### V2.0 (6-12 个月后)
- 照片拼贴功能
- 第三方课程推荐
- 社交分享功能
- 排行榜系统

### V3.0 (12+ 个月后)
- 高级分析报告
- AI 健身建议
- 社区功能
- 商城系统

---

## 文档维护

### 版本历史
| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| 1.0 | 2026-03-10 | 产品团队 | 初始版本 |

### 更新流程
1. 提出变更请求
2. 产品评审
3. 技术评审
4. 更新文档
5. 团队同步

---

## 相关资源

### 官方文档
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/)
- [Vant Weapp 文档](https://youzan.github.io/vant-weapp/)
- [Spring Boot 文档](https://spring.io/projects/spring-boot)
- [MyBatis 文档](https://mybatis.org/)

### 工具
- WeChat Developer Tools
- IntelliJ IDEA
- MySQL Workbench
- Postman

### 参考资料
- JWT 标准: https://jwt.io/
- RESTful API 设计: https://restfulapi.net/
- 微信支付文档: https://pay.weixin.qq.com/

---

## 联系方式

### 项目团队
- 产品经理: [联系方式]
- 技术负责人: [联系方式]
- 项目经理: [联系方式]

### 反馈与建议
- 提交 Issue: [GitHub/GitLab]
- 发送邮件: [邮箱地址]

---

**最后更新**: 2026-03-10
**文档状态**: 已批准
**下一次审查**: 2026-03-24

