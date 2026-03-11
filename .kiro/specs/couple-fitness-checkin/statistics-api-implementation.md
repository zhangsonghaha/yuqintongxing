# 数据统计与报告 API 实现文档

## 概述

本文档记录了任务 3.3.1-3.3.7 实现的数据统计与报告 API 功能。

## 实现的 API 端点

### 1. 获取总打卡次数
- **端点**: `GET /api/checkin/statistics/total`
- **描述**: 获取用户的总打卡次数
- **认证**: 需要 JWT Token
- **响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 25
}
```

### 2. 获取连续打卡天数
- **端点**: `GET /api/checkin/statistics/consecutive`
- **描述**: 获取用户当前的连续打卡天数（从今天往前计算）
- **认证**: 需要 JWT Token
- **响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 7
}
```

### 3. 获取历史最长连续天数
- **端点**: `GET /api/checkin/statistics/longest`
- **描述**: 获取用户历史上最长的连续打卡天数
- **认证**: 需要 JWT Token
- **响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 30
}
```

### 4. 获取周报告
- **端点**: `GET /api/checkin/statistics/weekly`
- **描述**: 获取本周的打卡统计数据（打卡次数、总时长、总卡路里）
- **认证**: 需要 JWT Token
- **响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "checkIns": 5,
    "duration": 150,
    "calories": 750.00
  }
}
```

### 5. 获取月报告
- **端点**: `GET /api/checkin/statistics/monthly`
- **描述**: 获取本月的打卡统计数据（打卡次数、总时长、总卡路里）
- **认证**: 需要 JWT Token
- **响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "checkIns": 20,
    "duration": 600,
    "calories": 3000.00
  }
}
```

### 6. 获取运动类型分布
- **端点**: `GET /api/checkin/statistics/distribution`
- **描述**: 获取用户各运动类型的打卡次数分布
- **认证**: 需要 JWT Token
- **响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "exerciseType": "跑步",
      "count": 15
    },
    {
      "exerciseType": "健身",
      "count": 10
    },
    {
      "exerciseType": "瑜伽",
      "count": 5
    }
  ]
}
```

## 技术实现细节

### 后端架构

#### 1. Controller 层 (CheckInController.java)
新增了 6 个 REST API 端点，所有端点都：
- 使用 `@GetMapping` 注解
- 通过 `SecurityUtils.getUserId()` 获取当前登录用户 ID
- 调用 Service 层方法获取数据
- 返回 `AjaxResult` 统一响应格式

#### 2. Service 层 (ICheckInService.java & CheckInServiceImpl.java)
新增了 6 个业务方法：
- `getTotalCheckIns(Long userId)` - 获取总打卡次数
- `getConsecutiveDays(Long userId)` - 获取连续打卡天数
- `getLongestConsecutiveDays(Long userId)` - 获取历史最长连续天数
- `getWeeklyReport(Long userId)` - 获取周报告
- `getMonthlyReport(Long userId)` - 获取月报告
- `getExerciseTypeDistribution(Long userId)` - 获取运动类型分布

所有方法都包含：
- 参数验证（userId 不能为空）
- 调用 Mapper 层查询数据
- 异常处理

#### 3. Mapper 层 (CheckInMapper.java & CheckInMapper.xml)
新增了 1 个查询方法：
- `selectExerciseTypeDistribution(Long userId)` - 查询运动类型分布

其他统计查询方法已在之前的任务中实现。

### 数据库查询

#### 运动类型分布查询 (新增)
```sql
SELECT 
    exercise_type AS exerciseType,
    COUNT(*) AS count
FROM check_in_record 
WHERE user_id = #{userId}
AND deleted_at IS NULL
AND exercise_type IS NOT NULL
AND exercise_type != ''
GROUP BY exercise_type
ORDER BY count DESC
```

#### 其他统计查询
- 总打卡次数：`COUNT(*)` 查询
- 连续打卡天数：使用递归 CTE 计算从今天开始的连续天数
- 历史最长连续天数：使用窗口函数和分组计算所有连续序列的最大值
- 周报告：查询本周一到今天的数据（使用 `WEEKDAY(CURDATE())`）
- 月报告：查询本月的数据（使用 `YEAR()` 和 `MONTH()` 函数）

## 单元测试

### 测试覆盖
在 `CheckInServiceTest.java` 中新增了 18 个单元测试：

#### 总打卡次数测试 (3个)
- ✅ 正常获取总打卡次数
- ✅ 无记录时返回 0
- ✅ userId 为空时抛出异常

#### 连续打卡天数测试 (3个)
- ✅ 正常获取连续打卡天数
- ✅ 今日未打卡时返回 0
- ✅ userId 为空时抛出异常

#### 历史最长连续天数测试 (3个)
- ✅ 正常获取历史最长连续天数
- ✅ 无记录时返回 0
- ✅ userId 为空时抛出异常

#### 周报告测试 (3个)
- ✅ 正常获取周报告
- ✅ 本周无打卡时返回 0 值
- ✅ userId 为空时抛出异常

#### 月报告测试 (3个)
- ✅ 正常获取月报告
- ✅ 本月无打卡时返回 0 值
- ✅ userId 为空时抛出异常

#### 运动类型分布测试 (3个)
- ✅ 正常获取运动类型分布（多种类型）
- ✅ 无记录时返回空列表
- ✅ userId 为空时抛出异常
- ✅ 单一运动类型的分布

### 测试结果
```
Tests run: 34, Failures: 0, Errors: 0, Skipped: 0
```

所有测试通过，包括：
- 16 个历史记录查询测试（之前实现）
- 18 个数据统计测试（本次实现）

## 使用示例

### 前端调用示例 (WeChat Mini Program)

```javascript
// 在 utils/api.js 中定义 API
const API = {
  // 数据统计 API
  getTotalCheckIns: () => request.get('/api/checkin/statistics/total'),
  getConsecutiveDays: () => request.get('/api/checkin/statistics/consecutive'),
  getLongestConsecutiveDays: () => request.get('/api/checkin/statistics/longest'),
  getWeeklyReport: () => request.get('/api/checkin/statistics/weekly'),
  getMonthlyReport: () => request.get('/api/checkin/statistics/monthly'),
  getExerciseTypeDistribution: () => request.get('/api/checkin/statistics/distribution')
};

// 在页面中使用
Page({
  data: {
    totalCheckIns: 0,
    consecutiveDays: 0,
    longestDays: 0,
    weeklyReport: {},
    monthlyReport: {},
    distribution: []
  },
  
  onLoad() {
    this.loadStatistics();
  },
  
  async loadStatistics() {
    try {
      // 获取总打卡次数
      const totalRes = await API.getTotalCheckIns();
      this.setData({ totalCheckIns: totalRes.data });
      
      // 获取连续打卡天数
      const consecutiveRes = await API.getConsecutiveDays();
      this.setData({ consecutiveDays: consecutiveRes.data });
      
      // 获取历史最长连续天数
      const longestRes = await API.getLongestConsecutiveDays();
      this.setData({ longestDays: longestRes.data });
      
      // 获取周报告
      const weeklyRes = await API.getWeeklyReport();
      this.setData({ weeklyReport: weeklyRes.data });
      
      // 获取月报告
      const monthlyRes = await API.getMonthlyReport();
      this.setData({ monthlyReport: monthlyRes.data });
      
      // 获取运动类型分布
      const distributionRes = await API.getExerciseTypeDistribution();
      this.setData({ distribution: distributionRes.data });
      
    } catch (error) {
      wx.showToast({
        title: '加载统计数据失败',
        icon: 'none'
      });
    }
  }
});
```

## 性能考虑

### 查询优化
1. **索引使用**: 所有查询都使用了 `user_id` 和 `check_in_date` 的复合索引
2. **软删除过滤**: 所有查询都包含 `deleted_at IS NULL` 条件
3. **聚合函数**: 使用 `COUNT()`, `SUM()`, `COALESCE()` 等数据库聚合函数，避免在应用层计算

### 缓存建议
对于频繁访问的统计数据，建议：
1. 使用 Redis 缓存周报告和月报告（有效期 1 小时）
2. 在用户打卡后清除相关缓存
3. 运动类型分布可以缓存更长时间（有效期 24 小时）

## 后续优化建议

1. **批量查询优化**: 考虑提供一个综合统计 API，一次性返回所有统计数据，减少前端请求次数
2. **趋势分析**: 增加最近 30 天的打卡趋势数据，用于前端绘制折线图
3. **对比功能**: 增加与伴侣的数据对比 API
4. **排行榜**: 增加全局排行榜功能（需要考虑隐私设置）
5. **缓存策略**: 实现 Redis 缓存，提升高频查询的性能

## 相关文件

### 后端文件
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/CheckInController.java`
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/ICheckInService.java`
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/impl/CheckInServiceImpl.java`
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/mapper/CheckInMapper.java`
- `RuoYi-Vue/ruoyi-admin/src/main/resources/mapper/web/CheckInMapper.xml`

### 测试文件
- `RuoYi-Vue/ruoyi-admin/src/test/java/com/ruoyi/web/service/CheckInServiceTest.java`

## 完成状态

✅ 3.3.1 实现获取总打卡次数 API
✅ 3.3.2 实现获取连续打卡天数 API
✅ 3.3.3 实现获取历史最长连续天数 API
✅ 3.3.4 实现生成周报告 API
✅ 3.3.5 实现生成月报告 API
✅ 3.3.6 实现获取运动类型分布 API
✅ 3.3.7 单元测试：数据统计

所有任务已完成，测试全部通过。
