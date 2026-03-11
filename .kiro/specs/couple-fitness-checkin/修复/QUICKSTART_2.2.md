# 2.2 情侣配对系统 - 快速开发指南

## 📋 任务清单

### 后端开发 (预计 2 天)

#### Day 1: 数据模型和数据访问层
- [ ] 创建 Partnership 实体类
- [ ] 创建 PartnershipMapper 接口
- [ ] 创建 PartnershipMapper.xml 映射文件
- [ ] 导入 partnership.sql 数据库脚本

#### Day 2: 业务逻辑和控制器
- [ ] 创建 IPartnershipService 接口
- [ ] 创建 PartnershipServiceImpl 实现类
- [ ] 创建 PartnershipRequestDto 和 PartnershipResponseDto
- [ ] 创建 PartnershipController 控制器
- [ ] 编写单元测试

### 前端开发 (预计 1.5 天)

#### Day 1: 页面和样式
- [ ] 创建 pages/partnership/index.wxml
- [ ] 创建 pages/partnership/index.wxss
- [ ] 创建 pages/partnership/index.json
- [ ] 在 app.json 中注册页面

#### Day 2: 页面逻辑
- [ ] 创建 pages/partnership/index.js
- [ ] 实现邀请码生成逻辑
- [ ] 实现配对请求发送逻辑
- [ ] 实现配对请求接受/拒绝逻辑
- [ ] 更新 utils/api.js

---

## 🚀 快速开发步骤

### 步骤 1: 后端数据库设置 (15 分钟)

```bash
# 1. 在 MySQL 中执行 partnership.sql
mysql -u root -p < RuoYi-Vue/sql/partnership.sql

# 2. 验证表创建成功
mysql -u root -p -e "SHOW TABLES LIKE 'partnership';"
```

### 步骤 2: 后端实体类 (30 分钟)

创建文件：`RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/domain/Partnership.java`

关键点：
- 使用 @Entity 和 @Table 注解
- 使用 Lombok 简化代码
- 添加 @Transient 注解用于非数据库字段

### 步骤 3: 后端 Mapper (45 分钟)

创建两个文件：
- `PartnershipMapper.java` - 接口定义
- `PartnershipMapper.xml` - SQL 映射

关键方法：
- selectPartnershipByInviteCode - 按邀请码查询
- selectPartnershipByUserId - 按用户ID查询
- insertPartnership - 创建配对
- updatePartnership - 更新配对状态

### 步骤 4: 后端服务层 (1 小时)

创建两个文件：
- `IPartnershipService.java` - 接口定义
- `PartnershipServiceImpl.java` - 实现类

关键方法：
- generateInviteCode - 生成邀请码
- sendPartnershipRequest - 发送配对请求
- acceptPartnershipRequest - 接受配对请求
- dissolvePartnership - 解除配对

### 步骤 5: 后端控制器 (45 分钟)

创建文件：`PartnershipController.java`

关键端点：
- POST /api/partnership/generate-code
- POST /api/partnership/request
- POST /api/partnership/accept
- POST /api/partnership/reject
- GET /api/partnership/pending-requests
- GET /api/partnership/partner

### 步骤 6: 后端单元测试 (1 小时)

创建文件：`PartnershipServiceTest.java`

测试用例：
- testGenerateInviteCode
- testSendPartnershipRequest
- testAcceptPartnershipRequest
- testGetPartner
- testDissolvePartnership

### 步骤 7: 前端页面结构 (45 分钟)

创建文件：`pages/partnership/index.wxml`

页面结构：
- 标签页（生成邀请码、输入邀请码、待接受请求）
- 邀请码显示和复制
- 二维码显示和保存
- 邀请码输入表单
- 待接受请求列表

### 步骤 8: 前端样式 (45 分钟)

创建文件：`pages/partnership/index.wxss`

样式要点：
- 响应式布局
- 标签页切换效果
- 按钮样式
- 列表项样式
- 空状态样式

### 步骤 9: 前端逻辑 (1.5 小时)

创建文件：`pages/partnership/index.js`

关键函数：
- generateInviteCode - 生成邀请码
- copyInviteCode - 复制邀请码
- saveQRCode - 保存二维码
- sendPartnershipRequest - 发送配对请求
- acceptRequest - 接受配对请求
- rejectRequest - 拒绝配对请求
- loadPendingRequests - 加载待接受请求

### 步骤 10: 集成测试 (1 小时)

测试场景：
1. 用户 A 生成邀请码
2. 用户 B 输入邀请码发送配对请求
3. 用户 A 接受配对请求
4. 验证两个用户都能看到对方信息
5. 测试拒绝配对请求
6. 测试解除配对

---

## 💡 开发技巧

### 后端开发技巧

1. **邀请码生成**
   ```java
   String inviteCode = String.format("%06d", new Random().nextInt(1000000));
   ```

2. **检查唯一性**
   ```java
   while (partnershipMapper.countByInviteCode(inviteCode) > 0) {
       inviteCode = String.format("%06d", new Random().nextInt(1000000));
   }
   ```

3. **事务管理**
   ```java
   @Transactional
   public void acceptPartnershipRequest(Long userId, Long partnershipId) {
       // 业务逻辑
   }
   ```

### 前端开发技巧

1. **二维码生成**
   ```javascript
   qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${inviteCode}`
   ```

2. **复制到剪贴板**
   ```javascript
   wx.setClipboardData({
     data: this.data.inviteCode,
     success: () => {
       wx.showToast({ title: '已复制' });
     }
   });
   ```

3. **保存图片到相册**
   ```javascript
   wx.downloadFile({
     url: this.data.qrCodeUrl,
     success: (res) => {
       wx.saveImageToPhotosAlbum({
         filePath: res.tempFilePath
       });
     }
   });
   ```

---

## 🧪 测试清单

### 后端测试

- [ ] 邀请码生成成功
- [ ] 邀请码唯一性验证
- [ ] 防止已配对用户生成新邀请码
- [ ] 配对请求发送成功
- [ ] 防止自己邀请自己
- [ ] 配对请求接受成功
- [ ] 配对请求拒绝成功
- [ ] 获取待接受请求列表
- [ ] 获取配对伴侣信息
- [ ] 解除配对成功

### 前端测试

- [ ] 邀请码生成和显示
- [ ] 邀请码复制功能
- [ ] 二维码生成和显示
- [ ] 二维码保存到相册
- [ ] 邀请码输入验证
- [ ] 配对请求发送
- [ ] 待接受请求列表加载
- [ ] 配对请求接受
- [ ] 配对请求拒绝
- [ ] 标签页切换

---

## 📱 用户流程

### 配对流程 1: 邀请码方式

```
用户 A                          用户 B
  |                              |
  +-- 点击"生成邀请码" --------->  |
  |                              |
  +-- 获得邀请码 "123456"         |
  |                              |
  +-- 分享邀请码给用户 B -------->  |
  |                              |
  |                          点击"输入邀请码"
  |                              |
  |                          输入 "123456"
  |                              |
  |                          点击"发送配对请求"
  |                              |
  +-- 收到配对请求 <-----------  |
  |                              |
  +-- 点击"接受" -------->  配对成功
  |                              |
  +-- 显示伴侣信息 <-----------  |
```

### 配对流程 2: 二维码方式

```
用户 A                          用户 B
  |                              |
  +-- 生成邀请码和二维码          |
  |                              |
  +-- 显示二维码                  |
  |                              |
  +-- 分享二维码给用户 B -------->  |
  |                              |
  |                          扫描二维码
  |                              |
  |                          自动填充邀请码
  |                              |
  |                          点击"发送配对请求"
  |                              |
  +-- 收到配对请求 <-----------  |
  |                              |
  +-- 点击"接受" -------->  配对成功
```

---

## 🔍 常见问题

### Q1: 邀请码过期时间如何设置？
A: 可以在 Partnership 表中添加 `expires_at` 字段，在查询时检查是否过期。

### Q2: 如何防止邀请码被滥用？
A: 可以限制邀请码的使用次数，或者在一定时间内只能使用一次。

### Q3: 如何处理配对请求超时？
A: 可以添加一个定时任务，定期清理超过 7 天未处理的待接受请求。

### Q4: 如何支持多个待接受请求？
A: 当前设计支持多个待接受请求，用户可以选择接受或拒绝任何一个。

---

## 📊 性能优化

1. **数据库索引**
   - 在 `invite_code` 上建立唯一索引
   - 在 `user_id_1` 和 `user_id_2` 上建立索引
   - 在 `status` 上建立索引

2. **缓存策略**
   - 缓存用户的配对伴侣信息
   - 缓存待接受请求列表

3. **查询优化**
   - 使用分页查询待接受请求
   - 避免 N+1 查询问题

---

## 🎯 下一步

完成 2.2 情侣配对系统后，可以继续开发：

1. **2.3 快速打卡功能** - 用户配对后可以开始打卡
2. **2.4 情侣主页** - 显示配对伴侣的信息和数据
3. **3.1 打卡互动功能** - 用户可以点赞和评论伴侣的打卡

