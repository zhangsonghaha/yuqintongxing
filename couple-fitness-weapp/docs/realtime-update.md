# 实时更新功能说明

## 概述

实时更新功能确保当伴侣发布新的打卡记录、点赞或评论时，前端能够自动更新显示，提供流畅的用户体验。

## 功能特性

### 1. 自动轮询更新
- **轮询间隔**: 30秒
- **智能暂停**: 页面隐藏时自动暂停轮询，节省资源
- **智能恢复**: 页面显示时自动恢复轮询

### 2. 即时更新
- **点赞/取消点赞**: 操作后立即更新UI和触发数据刷新
- **发表评论**: 评论成功后立即更新UI和触发数据刷新
- **删除评论**: 删除成功后立即更新UI和触发数据刷新
- **新打卡**: 打卡成功后触发全局更新

### 3. 静默刷新
- 后台刷新数据，不显示加载状态
- 不影响用户当前操作
- 检测到新数据时自动更新显示

## 技术实现

### 核心工具类: `utils/realtime.js`

```javascript
// 单例模式的实时更新管理器
class RealtimeUpdater {
  // 开始轮询
  startPolling(callback, delay)
  
  // 停止轮询
  stopPolling()
  
  // 手动触发更新
  triggerUpdate()
  
  // 添加/移除回调函数
  addCallback(callback)
  removeCallback(callback)
}
```

### 主页实现: `pages/index/index.js`

#### 生命周期管理

```javascript
onLoad() {
  this.loadData();
  this.setupRealtimeUpdate();  // 设置实时更新
}

onShow() {
  this.setData({ isPageVisible: true });
  this.loadData();
  this.resumeRealtimeUpdate();  // 恢复轮询
}

onHide() {
  this.setData({ isPageVisible: false });
  this.pauseRealtimeUpdate();  // 暂停轮询
}

onUnload() {
  this.stopRealtimeUpdate();  // 停止轮询并清理
}
```

#### 静默刷新

```javascript
async silentRefresh() {
  // 1. 获取最新数据（不显示loading）
  // 2. 检测是否有新数据
  // 3. 更新UI显示
  // 4. 记录更新时间
}
```

#### 新数据检测

```javascript
checkForNewData(newCheckIns, newTodayStatus) {
  // 检查打卡状态变化
  // 检查打卡记录数量变化
  // 检查最新记录是否变化
  return hasNewData;
}
```

### 组件实现

#### interaction-bar 组件

点赞/取消点赞后触发更新事件：

```javascript
onLike() {
  // 执行点赞操作
  api.interactionAPI.like(recordId, userId).then(res => {
    // 更新本地状态
    this.setData({ isLiked: true, likes: this.data.likes + 1 });
    
    // 触发父组件事件
    this.triggerEvent('likechange', { ... });
    
    // 触发实时更新事件
    this.triggerEvent('interactionupdate', { 
      type: 'like',
      recordId: recordId 
    });
  });
}
```

#### comment-input 组件

发表评论后触发更新事件：

```javascript
onSend() {
  api.interactionAPI.comment(recordId, userId, content).then(res => {
    // 清空输入框
    this.setData({ commentText: '' });
    
    // 触发评论成功事件
    this.triggerEvent('commentsuccess', { ... });
    
    // 触发实时更新事件
    this.triggerEvent('interactionupdate', { 
      type: 'comment',
      recordId: recordId 
    });
  });
}
```

#### comment-list 组件

删除评论后触发更新事件：

```javascript
onDeleteComment() {
  api.interactionAPI.deleteComment(interactionId, userId).then(res => {
    // 重新加载评论列表
    this.loadComments();
    
    // 触发删除成功事件
    this.triggerEvent('deletesuccess', { ... });
    
    // 触发实时更新事件
    this.triggerEvent('interactionupdate', { 
      type: 'deleteComment',
      recordId: this.properties.recordId 
    });
  });
}
```

### 事件传递链

```
interaction-bar/comment-input/comment-list
    ↓ (interactionupdate)
check-in-card
    ↓ (interactionupdate)
index page
    ↓
silentRefresh() → 更新UI
```

## 使用场景

### 场景1: 用户点赞伴侣的打卡记录

1. 用户点击点赞按钮
2. `interaction-bar` 组件发送点赞请求
3. 请求成功后，立即更新点赞状态（UI即时响应）
4. 触发 `interactionupdate` 事件
5. 事件传递到主页，触发 `silentRefresh()`
6. 后台刷新数据，更新点赞数量

### 场景2: 伴侣发布新的打卡记录

1. 伴侣在另一台设备上完成打卡
2. 30秒后，轮询触发 `silentRefresh()`
3. 检测到新的打卡记录
4. 自动更新主页显示
5. 新记录出现在"最近打卡"列表顶部

### 场景3: 用户发表评论

1. 用户在评论输入框输入内容并发送
2. `comment-input` 组件发送评论请求
3. 请求成功后，清空输入框
4. 触发 `interactionupdate` 事件
5. 主页立即刷新数据
6. 评论数量和列表实时更新

### 场景4: 页面切换优化

1. 用户切换到其他页面（触发 `onHide`）
2. 自动暂停轮询，节省资源
3. 用户返回主页（触发 `onShow`）
4. 立即刷新数据并恢复轮询
5. 确保显示最新内容

## 性能优化

### 1. 智能轮询
- 仅在页面可见时轮询
- 页面隐藏时自动暂停
- 避免不必要的网络请求

### 2. 静默刷新
- 不显示加载状态
- 不打断用户操作
- 平滑更新UI

### 3. 即时响应
- 用户操作立即更新UI
- 不等待服务器响应
- 提供流畅体验

### 4. 事件去重
- 避免重复触发更新
- 合并短时间内的多次更新
- 减少不必要的刷新

## 配置参数

### 轮询间隔

默认30秒，可在 `pages/index/index.js` 中修改：

```javascript
setupRealtimeUpdate() {
  realtimeUpdater.startPolling(() => {
    if (this.data.isPageVisible) {
      this.silentRefresh();
    }
  }, 30000);  // 修改此值调整轮询间隔（毫秒）
}
```

### 建议配置

- **开发环境**: 10-15秒（快速测试）
- **生产环境**: 30-60秒（平衡体验和性能）
- **低频场景**: 60-120秒（节省资源）

## 注意事项

### 1. 网络异常处理
- 静默刷新失败不显示错误提示
- 仅在控制台记录错误日志
- 不影响用户当前操作

### 2. 数据一致性
- 以服务器数据为准
- 本地更新仅用于即时反馈
- 定期同步确保一致性

### 3. 资源管理
- 页面卸载时必须停止轮询
- 清理所有回调函数
- 避免内存泄漏

### 4. 用户体验
- 避免频繁刷新打断用户
- 新数据检测后平滑更新
- 保持UI稳定性

## 扩展功能

### 未来可能的增强

1. **WebSocket实时推送**
   - 替代轮询机制
   - 真正的实时更新
   - 更低的延迟

2. **增量更新**
   - 仅获取变化的数据
   - 减少网络传输
   - 提高更新效率

3. **智能刷新策略**
   - 根据用户活跃度调整频率
   - 检测到新数据时加快轮询
   - 长时间无变化时降低频率

4. **离线支持**
   - 缓存最新数据
   - 离线时显示缓存
   - 网络恢复后同步

## 测试建议

### 功能测试

1. **轮询测试**
   - 验证30秒后自动刷新
   - 检查页面隐藏时暂停
   - 检查页面显示时恢复

2. **即时更新测试**
   - 点赞后立即更新
   - 评论后立即更新
   - 删除评论后立即更新

3. **多设备测试**
   - 设备A打卡，设备B自动更新
   - 设备A点赞，设备B显示点赞数变化
   - 设备A评论，设备B显示新评论

### 性能测试

1. **资源占用**
   - 监控内存使用
   - 检查是否有内存泄漏
   - 验证轮询停止后资源释放

2. **网络请求**
   - 统计请求频率
   - 检查请求是否合理
   - 验证页面隐藏时停止请求

## 故障排查

### 问题1: 数据不更新

**可能原因**:
- 轮询未启动
- 页面标记为隐藏状态
- 网络请求失败

**解决方法**:
1. 检查控制台日志
2. 验证 `isPageVisible` 状态
3. 检查网络请求响应

### 问题2: 更新过于频繁

**可能原因**:
- 轮询间隔设置过短
- 多个回调函数重复注册
- 事件重复触发

**解决方法**:
1. 增加轮询间隔
2. 检查回调函数注册
3. 添加事件去重逻辑

### 问题3: 内存泄漏

**可能原因**:
- 页面卸载时未停止轮询
- 回调函数未清理
- 定时器未清除

**解决方法**:
1. 确保 `onUnload` 中调用 `stopRealtimeUpdate()`
2. 清理所有回调函数
3. 清除所有定时器

## 总结

实时更新功能通过轮询和事件驱动相结合的方式，实现了打卡记录、点赞、评论的实时同步。该实现具有以下特点：

- ✅ 自动轮询，无需手动刷新
- ✅ 智能暂停/恢复，节省资源
- ✅ 即时响应，流畅体验
- ✅ 静默刷新，不打断用户
- ✅ 事件驱动，及时更新
- ✅ 易于扩展和维护

该功能满足了需求文档中的以下要求：
- 需求4: "WHEN 对方发布新的打卡记录，THE 小程序系统 SHALL 在情侣主页实时更新数据"
- 需求5: "WHEN 用户点赞或评论，THE 小程序系统 SHALL 立即更新显示"
