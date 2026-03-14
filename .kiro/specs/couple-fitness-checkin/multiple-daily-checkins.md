# 支持一天多次打卡功能实现

## 问题描述

原系统限制用户一天只能打卡一次,但实际使用场景中,用户可能一天内进行多次运动,需要支持多次打卡。

## 修改内容

### 1. 前端修改

#### 1.1 首页打卡按钮逻辑 (`couple-fitness-weapp/pages/index/index.js`)

**修改前:**
```javascript
handleCheckIn() {
  // 检查是否已打卡
  if (this.data.todayStatus.userCheckedIn) {
    Toast.success('今天已打卡');
    return;
  }
  
  // 导航到打卡页面
  wx.navigateTo({
    url: '/pages/checkin/index',
    fail: (err) => {
      Toast.fail('打卡页面加载失败');
    }
  });
}
```

**修改后:**
```javascript
handleCheckIn() {
  // 允许一天多次打卡，直接导航到打卡页面
  wx.navigateTo({
    url: '/pages/checkin/index',
    fail: (err) => {
      Toast.fail('打卡页面加载失败');
    }
  });
}
```

#### 1.2 首页显示逻辑 (`couple-fitness-weapp/pages/index/index.wxml`)

**个人状态显示:**
- 修改前: 显示"✓ 已打卡"或"⏰ 未打卡"
- 修改后: 显示"今日打卡 X次"

```xml
<!-- 修改前 -->
<text class="status-label">今天状态</text>
<text class="status-value">{{ todayStatus.userCheckedIn ? '✓ 已打卡' : '⏰ 未打卡' }}</text>

<!-- 修改后 -->
<text class="status-label">今日打卡</text>
<text class="status-value">{{ userStats.todayCheckInCount || 0 }}次</text>
```

**伴侣状态显示:**
```xml
<!-- 修改前 -->
<text class="status-badge">{{ todayStatus.partnerCheckedIn ? '✓ 已打卡' : '⏰ 未打卡' }}</text>

<!-- 修改后 -->
<text class="status-badge">今日{{ partnerStats.todayCheckInCount || 0 }}次</text>
```

### 2. 后端修改

#### 2.1 统计数据实体类 (`CheckInStatistics.java`)

添加 `todayCheckInCount` 字段:

```java
// 今日状态
private Boolean todayCheckedIn;         // 今日是否已打卡
private Integer todayCheckInCount;      // 今日打卡次数 (新增)
private Date todayCheckInTime;          // 今日最近一次打卡时间
private String todayExerciseType;       // 今日运动类型
private Integer todayDuration;          // 今日运动时长
private BigDecimal todayCalories;       // 今日消耗卡路里

// Getter和Setter
public Integer getTodayCheckInCount() {
    return todayCheckInCount;
}

public void setTodayCheckInCount(Integer todayCheckInCount) {
    this.todayCheckInCount = todayCheckInCount;
}
```

#### 2.2 数据访问层 (`CheckInMapper.java`)

添加查询今日打卡次数的方法:

```java
/**
 * 查询今日打卡次数
 * 
 * @param userId 用户ID
 * @return 今日打卡次数
 */
Integer selectTodayCheckInCount(@Param("userId") Long userId);
```

#### 2.3 SQL映射 (`CheckInMapper.xml`)

添加SQL查询:

```xml
<!-- 查询今日打卡次数 -->
<select id="selectTodayCheckInCount" resultType="java.lang.Integer">
    SELECT COUNT(*) FROM check_in_record 
    WHERE user_id = #{userId}
    AND DATE(check_in_date) = CURDATE()
    AND deleted_at IS NULL
</select>
```

#### 2.4 业务逻辑层 (`CheckInServiceImpl.java`)

在 `getUserStatistics()` 方法中添加今日打卡次数统计:

```java
// 获取今日打卡状态
CheckInRecord todayCheckIn = getTodayCheckIn(userId);
if (todayCheckIn != null) {
    statistics.setTodayCheckedIn(true);
    statistics.setTodayCheckInTime(todayCheckIn.getCreatedAt());
    statistics.setTodayExerciseType(todayCheckIn.getExerciseType());
    statistics.setTodayDuration(todayCheckIn.getDuration());
    statistics.setTodayCalories(todayCheckIn.getCalories());
} else {
    statistics.setTodayCheckedIn(false);
}

// 获取今日打卡次数 (新增)
Integer todayCheckInCount = checkInMapper.selectTodayCheckInCount(userId);
statistics.setTodayCheckInCount(todayCheckInCount != null ? todayCheckInCount : 0);
```

## 功能说明

### 字段含义变化

1. **todayCheckedIn**: 保持不变,表示"今天是否有打卡记录"(至少1次)
2. **todayCheckInCount**: 新增,表示"今天打卡的总次数"
3. **todayCheckInTime**: 含义调整为"今天最近一次打卡的时间"

### 用户体验改进

1. **打卡按钮**: 始终可点击,不再限制一天只能打卡一次
2. **状态显示**: 从"已打卡/未打卡"改为显示具体次数,更直观
3. **伴侣状态**: 同样显示伴侣今日打卡次数

### 数据统计

- 今日打卡次数会实时更新
- 连续打卡天数的计算不受影响(只要当天有至少1次打卡即算连续)
- 成就系统的"首次打卡"、"连续7天"等成就判断逻辑不受影响

## 测试建议

1. **基础功能测试**:
   - 一天内多次打卡,验证次数统计正确
   - 查看首页显示的今日打卡次数是否正确
   - 查看伴侣的今日打卡次数是否正确

2. **边界测试**:
   - 跨天打卡,验证次数重置为0
   - 删除打卡记录后,次数是否正确减少

3. **成就系统测试**:
   - 验证连续打卡天数计算正确
   - 验证"首次打卡"成就只解锁一次
   - 验证"累计100次"成就计数正确

## 部署说明

1. **后端部署**:
   - 编译后端代码: `mvn clean compile -DskipTests`
   - 重启Spring Boot应用

2. **前端部署**:
   - 在微信开发者工具中刷新项目
   - 测试打卡功能

3. **数据库**:
   - 无需修改数据库结构
   - 现有数据完全兼容

## 注意事项

1. 后端已编译成功,需要重启应用才能生效
2. 前端修改后需要在微信开发者工具中重新编译
3. `todayCheckedIn` 字段保留是为了向后兼容,建议前端逐步迁移到使用 `todayCheckInCount`
4. 伴侣统计数据通过 `getPartnerStatistics()` 获取,会自动包含 `todayCheckInCount` 字段

## 相关文件

### 前端文件
- `couple-fitness-weapp/pages/index/index.js` - 首页逻辑
- `couple-fitness-weapp/pages/index/index.wxml` - 首页模板

### 后端文件
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/domain/CheckInStatistics.java` - 统计实体
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/mapper/CheckInMapper.java` - 数据访问接口
- `RuoYi-Vue/ruoyi-admin/src/main/resources/mapper/web/CheckInMapper.xml` - SQL映射
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/impl/CheckInServiceImpl.java` - 业务逻辑

## 完成时间

2026-03-12
