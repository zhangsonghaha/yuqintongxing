# 2.2 情侣配对系统 - 开发检查清单

## 📋 后端开发检查清单

### 数据模型 (2.2.1)
- [ ] 创建 Partnership.java 实体类
  - [ ] 添加 @Entity 和 @Table 注解
  - [ ] 定义所有字段（partnershipId, userId1, userId2, status, inviteCode, createdAt, dissolvedAt, deletedAt）
  - [ ] 添加 Lombok @Data 注解
  - [ ] 添加 @Transient 注解用于 partner 字段
  - [ ] 添加 JSR-303 验证注解

### 数据访问层 (2.2.2)
- [ ] 创建 PartnershipMapper.java 接口
  - [ ] selectPartnershipById
  - [ ] selectPartnershipByInviteCode
  - [ ] selectPartnershipByUserId
  - [ ] selectPendingPartnershipsByUserId
  - [ ] selectPartnershipByUserIds
  - [ ] insertPartnership
  - [ ] updatePartnership
  - [ ] deletePartnershipById
  - [ ] countByInviteCode

- [ ] 创建 PartnershipMapper.xml 映射文件
  - [ ] 定义 resultMap
  - [ ] 实现所有 SQL 查询
  - [ ] 使用软删除（deleted_at IS NULL）
  - [ ] 添加适当的索引

### 业务逻辑层 (2.2.3)
- [ ] 创建 IPartnershipService.java 接口
  - [ ] generateInviteCode
  - [ ] getInviteCodeInfo
  - [ ] sendPartnershipRequest
  - [ ] acceptPartnershipRequest
  - [ ] rejectPartnershipRequest
  - [ ] getPendingRequests
  - [ ] getPartner
  - [ ] dissolvePartnership
  - [ ] selectPartnershipById

- [ ] 创建 PartnershipServiceImpl.java 实现类
  - [ ] 实现所有接口方法
  - [ ] 添加业务逻辑验证
  - [ ] 添加事务管理 (@Transactional)
  - [ ] 添加日志记录
  - [ ] 处理异常情况

### DTO 类 (2.2.4)
- [ ] 创建 PartnershipRequestDto.java
  - [ ] inviteCode 字段
  - [ ] 添加 @NotBlank 验证

- [ ] 创建 PartnershipResponseDto.java
  - [ ] partnershipId 字段
  - [ ] partnerId 字段
  - [ ] partnerNickname 字段
  - [ ] partnerAvatar 字段
  - [ ] inviteCode 字段
  - [ ] qrCodeUrl 字段
  - [ ] status 字段

### 控制器 (2.2.5-2.2.8)
- [ ] 创建 PartnershipController.java
  - [ ] generateInviteCode 端点 (POST /api/partnership/generate-code)
  - [ ] getInviteCodeInfo 端点 (GET /api/partnership/invite-code-info)
  - [ ] sendPartnershipRequest 端点 (POST /api/partnership/request)
  - [ ] acceptPartnershipRequest 端点 (POST /api/partnership/accept)
  - [ ] rejectPartnershipRequest 端点 (POST /api/partnership/reject)
  - [ ] getPendingRequests 端点 (GET /api/partnership/pending-requests)
  - [ ] getPartner 端点 (GET /api/partnership/partner)
  - [ ] dissolvePartnership 端点 (POST /api/partnership/dissolve)
  - [ ] 添加 JWT 认证检查
  - [ ] 添加错误处理

### 数据库 (2.2.1)
- [ ] 创建 partnership.sql 脚本
  - [ ] 创建 partnership 表
  - [ ] 定义所有字段和约束
  - [ ] 创建外键关系
  - [ ] 创建索引
  - [ ] 添加注释

- [ ] 执行 SQL 脚本
  - [ ] 验证表创建成功
  - [ ] 验证索引创建成功
  - [ ] 验证外键关系正确

### 单元测试 (2.2.9)
- [ ] 创建 PartnershipServiceTest.java
  - [ ] testGenerateInviteCode
  - [ ] testGenerateInviteCodeWhenAlreadyPaired
  - [ ] testSendPartnershipRequest
  - [ ] testAcceptPartnershipRequest
  - [ ] testRejectPartnershipRequest
  - [ ] testGetPartner
  - [ ] testDissolvePartnership
  - [ ] testGetPendingRequests
  - [ ] 所有测试通过
  - [ ] 代码覆盖率 ≥ 80%

### 集成测试
- [ ] 测试完整的配对流程
- [ ] 测试错误处理
- [ ] 测试并发场景
- [ ] 测试数据一致性

---

## 📱 前端开发检查清单

### 页面结构 (2.2.10)
- [ ] 创建 pages/partnership/index.wxml
  - [ ] 标签页结构（生成邀请码、输入邀请码、待接受请求）
  - [ ] 邀请码显示区域
  - [ ] 二维码显示区域
  - [ ] 邀请码输入表单
  - [ ] 待接受请求列表
  - [ ] 空状态提示
  - [ ] 按钮和交互元素

### 页面样式 (2.2.11)
- [ ] 创建 pages/partnership/index.wxss
  - [ ] 标签页样式
  - [ ] 邀请码显示样式
  - [ ] 二维码样式
  - [ ] 表单样式
  - [ ] 列表项样式
  - [ ] 按钮样式
  - [ ] 空状态样式
  - [ ] 响应式布局
  - [ ] 动画效果

### 页面配置 (2.2.10)
- [ ] 创建 pages/partnership/index.json
  - [ ] navigationBarTitleText
  - [ ] navigationBarBackgroundColor
  - [ ] navigationBarTextStyle

### 页面逻辑 (2.2.12-2.2.15)
- [ ] 创建 pages/partnership/index.js
  - [ ] 初始化数据
  - [ ] switchTab 方法
  - [ ] generateInviteCode 方法
  - [ ] copyInviteCode 方法
  - [ ] saveQRCode 方法
  - [ ] onInviteCodeInput 方法
  - [ ] sendPartnershipRequest 方法
  - [ ] loadPendingRequests 方法
  - [ ] acceptRequest 方法
  - [ ] rejectRequest 方法
  - [ ] 错误处理
  - [ ] 加载状态管理

### 邀请码生成 (2.2.11)
- [ ] 调用后端 API 生成邀请码
- [ ] 显示邀请码
- [ ] 显示二维码
- [ ] 处理生成失败

### 二维码生成 (2.2.12)
- [ ] 使用第三方 API 生成二维码
- [ ] 显示二维码图片
- [ ] 实现保存二维码功能
- [ ] 处理保存失败

### 邀请码输入 (2.2.13)
- [ ] 输入框验证
- [ ] 邀请码格式验证
- [ ] 实时输入反馈

### 配对请求发送 (2.2.14)
- [ ] 调用后端 API 发送请求
- [ ] 显示发送成功提示
- [ ] 处理发送失败
- [ ] 清空输入框
- [ ] 切换到待接受请求标签页

### 配对状态管理 (2.2.15)
- [ ] 加载待接受请求列表
- [ ] 显示请求者信息
- [ ] 实现接受功能
- [ ] 实现拒绝功能
- [ ] 实时更新列表
- [ ] 处理空状态

### API 端点定义 (2.2.5-2.2.8)
- [ ] 更新 utils/api.js
  - [ ] partnership.generateCode
  - [ ] partnership.getInviteCodeInfo
  - [ ] partnership.request
  - [ ] partnership.accept
  - [ ] partnership.reject
  - [ ] partnership.pendingRequests
  - [ ] partnership.partner
  - [ ] partnership.dissolve

### 页面注册
- [ ] 在 app.json 中添加页面路由
  - [ ] "pages/partnership/index"

---

## 🧪 功能测试检查清单

### 邀请码生成测试
- [ ] 用户可以生成邀请码
- [ ] 邀请码格式正确（6位数字）
- [ ] 邀请码唯一
- [ ] 邀请码显示正确
- [ ] 二维码生成正确
- [ ] 已配对用户无法生成新邀请码

### 邀请码复制测试
- [ ] 点击复制按钮
- [ ] 邀请码复制到剪贴板
- [ ] 显示复制成功提示

### 二维码保存测试
- [ ] 点击保存按钮
- [ ] 二维码下载成功
- [ ] 二维码保存到相册
- [ ] 显示保存成功提示

### 配对请求发送测试
- [ ] 输入有效邀请码
- [ ] 点击发送按钮
- [ ] 请求发送成功
- [ ] 显示成功提示
- [ ] 输入框清空
- [ ] 切换到待接受请求标签页

### 配对请求接受测试
- [ ] 显示待接受请求列表
- [ ] 显示请求者信息
- [ ] 点击接受按钮
- [ ] 显示确认对话框
- [ ] 配对成功
- [ ] 显示伴侣信息
- [ ] 跳转到主页

### 配对请求拒绝测试
- [ ] 点击拒绝按钮
- [ ] 显示确认对话框
- [ ] 请求被拒绝
- [ ] 列表更新
- [ ] 显示成功提示

### 标签页切换测试
- [ ] 点击"生成邀请码"标签页
- [ ] 点击"输入邀请码"标签页
- [ ] 点击"待接受请求"标签页
- [ ] 标签页内容正确显示
- [ ] 标签页状态正确保存

### 错误处理测试
- [ ] 邀请码不存在
- [ ] 邀请码已过期
- [ ] 邀请码已被使用
- [ ] 用户已配对
- [ ] 自己的邀请码
- [ ] 网络错误
- [ ] 服务器错误

---

## 🔄 集成测试检查清单

### 完整配对流程测试
- [ ] 用户 A 生成邀请码
- [ ] 用户 A 获取邀请码信息
- [ ] 用户 B 输入邀请码
- [ ] 用户 B 发送配对请求
- [ ] 用户 A 收到配对请求
- [ ] 用户 A 接受配对请求
- [ ] 配对成功
- [ ] 两个用户都能看到对方信息

### 拒绝配对流程测试
- [ ] 用户 A 生成邀请码
- [ ] 用户 B 输入邀请码
- [ ] 用户 B 发送配对请求
- [ ] 用户 A 收到配对请求
- [ ] 用户 A 拒绝配对请求
- [ ] 配对关系被删除
- [ ] 用户 B 无法再接受请求

### 解除配对流程测试
- [ ] 用户 A 和 B 已配对
- [ ] 用户 A 解除配对
- [ ] 配对关系状态变为 dissolved
- [ ] 两个用户都无法看到对方信息
- [ ] 用户可以重新配对

### 并发测试
- [ ] 多个用户同时生成邀请码
- [ ] 多个用户同时发送配对请求
- [ ] 多个用户同时接受配对请求
- [ ] 数据一致性验证

---

## 📊 性能测试检查清单

- [ ] 邀请码生成时间 < 500ms
- [ ] 配对请求发送时间 < 1s
- [ ] 配对请求接受时间 < 1s
- [ ] 待接受请求列表加载时间 < 2s
- [ ] 获取伴侣信息时间 < 500ms
- [ ] 数据库查询性能 < 100ms
- [ ] 并发 100 用户无错误

---

## 🔒 安全测试检查清单

- [ ] SQL 注入测试
- [ ] XSS 攻击测试
- [ ] CSRF 攻击测试
- [ ] 未授权访问测试
- [ ] 邀请码暴力破解测试
- [ ] 敏感数据泄露测试

---

## 📝 代码质量检查清单

- [ ] 代码风格一致
- [ ] 命名规范正确
- [ ] 注释完整
- [ ] 没有硬编码
- [ ] 没有重复代码
- [ ] 异常处理完善
- [ ] 日志记录充分
- [ ] 代码覆盖率 ≥ 80%

---

## 🚀 部署检查清单

- [ ] 数据库脚本已执行
- [ ] 后端代码已编译
- [ ] 前端代码已测试
- [ ] 配置文件已更新
- [ ] 环境变量已设置
- [ ] 日志配置正确
- [ ] 监控告警已配置
- [ ] 备份方案已准备

---

## ✅ 最终验收检查清单

- [ ] 所有功能已实现
- [ ] 所有测试已通过
- [ ] 代码已审查
- [ ] 文档已完成
- [ ] 性能指标已达成
- [ ] 安全审计已通过
- [ ] 用户体验已验证
- [ ] 准备上线

