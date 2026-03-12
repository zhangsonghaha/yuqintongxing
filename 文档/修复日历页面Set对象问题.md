# 修复日历页面 Set 对象问题

## 问题描述

点击查看日历时报错：
```
TypeError: this.data.checkInDates.has is not a function
```

## 问题原因

在日历页面中，`checkInDates` 被初始化为 `new Set()`，但微信小程序的 `setData` 方法不支持 Set 对象。

### 技术细节

1. **Set 对象在小程序中的问题**：
   - JavaScript 的 Set 对象有 `.has()`, `.add()`, `.delete()` 等方法
   - 微信小程序的 `setData` 会将 Set 对象序列化
   - 序列化后的对象失去了 Set 的原型方法
   - 导致 `.has()` 方法不可用

2. **错误代码**：
```javascript
data: {
    checkInDates: new Set(),  // ❌ 小程序不支持
}

loadCheckInDates() {
    const dates = new Set();
    dates.add('2026-03-11');
    this.setData({
        checkInDates: dates  // ❌ Set 对象被序列化，失去方法
    });
}

generateCalendar() {
    hasCheckIn: this.data.checkInDates.has(dateStr)  // ❌ 报错：has is not a function
}
```

## 解决方案

将 Set 对象改为普通对象（作为哈希表使用）。

### 修改内容

#### 1. 修改数据初始化

**修改前**：
```javascript
data: {
    checkInDates: new Set(),  // ❌
}
```

**修改后**：
```javascript
data: {
    checkInDates: {},  // ✅ 使用普通对象
}
```

#### 2. 修改数据填充逻辑

**修改前**：
```javascript
loadCheckInDates() {
    const dates = new Set();
    res.data.records.forEach(record => {
        dates.add(record.checkInDate);  // ❌
    });
    
    this.setData({
        checkInDates: dates
    });
}
```

**修改后**：
```javascript
loadCheckInDates() {
    const dates = {};  // ✅ 使用普通对象
    res.data.records.forEach(record => {
        dates[record.checkInDate] = true;  // ✅ 使用对象属性
    });
    
    this.setData({
        checkInDates: dates
    });
}
```

#### 3. 修改检查逻辑

**修改前**：
```javascript
generateCalendar() {
    hasCheckIn: this.data.checkInDates.has(dateStr)  // ❌
}
```

**修改后**：
```javascript
generateCalendar() {
    hasCheckIn: !!this.data.checkInDates[dateStr]  // ✅ 使用对象属性检查
}
```

## 技术对比

### Set 对象 vs 普通对象

| 特性 | Set 对象 | 普通对象 |
|------|----------|----------|
| 添加元素 | `set.add(value)` | `obj[key] = true` |
| 检查存在 | `set.has(value)` | `!!obj[key]` 或 `key in obj` |
| 删除元素 | `set.delete(value)` | `delete obj[key]` |
| 获取大小 | `set.size` | `Object.keys(obj).length` |
| 小程序支持 | ❌ 不支持 | ✅ 支持 |
| 性能 | 更快 | 稍慢但足够 |

### 为什么使用对象而不是数组？

**数组方案**：
```javascript
checkInDates: ['2026-03-11', '2026-03-12']
hasCheckIn: this.data.checkInDates.includes(dateStr)  // O(n) 时间复杂度
```

**对象方案**：
```javascript
checkInDates: { '2026-03-11': true, '2026-03-12': true }
hasCheckIn: !!this.data.checkInDates[dateStr]  // O(1) 时间复杂度
```

**结论**：对象方案性能更好，特别是当打卡日期很多时。

## 测试验证

### 测试1：查看日历

1. 登录小程序
2. 点击"查看日历"按钮
3. **预期结果**：日历正常显示，不报错

### 测试2：打卡日期标记

1. 查看日历
2. 有打卡记录的日期应该有标记（例如：圆点、高亮等）
3. **预期结果**：打卡日期正确标记

### 测试3：切换月份

1. 点击上一月/下一月按钮
2. **预期结果**：日历正常切换，打卡标记正确显示

### 测试4：点击日期

1. 点击某个日期
2. **预期结果**：显示该日期的打卡记录

## 相关文件

- `couple-fitness-weapp/pages/calendar/calendar.js` - 日历页面逻辑

## 小程序开发注意事项

### 不支持的 JavaScript 特性

微信小程序的 `setData` 不支持以下类型：

1. **Set 对象** ❌
   ```javascript
   this.setData({ mySet: new Set([1, 2, 3]) })  // 不支持
   ```

2. **Map 对象** ❌
   ```javascript
   this.setData({ myMap: new Map([['a', 1]]) })  // 不支持
   ```

3. **函数** ❌
   ```javascript
   this.setData({ myFunc: () => {} })  // 不支持
   ```

4. **Symbol** ❌
   ```javascript
   this.setData({ mySym: Symbol('test') })  // 不支持
   ```

5. **循环引用对象** ❌
   ```javascript
   const obj = { a: 1 };
   obj.self = obj;
   this.setData({ myObj: obj })  // 不支持
   ```

### 支持的数据类型

✅ 基本类型：String, Number, Boolean, null, undefined
✅ 对象：普通对象 `{}`
✅ 数组：`[]`
✅ Date 对象（会被转换为字符串）

### 最佳实践

1. **使用普通对象代替 Set/Map**
   ```javascript
   // 代替 Set
   const set = {};
   set['key'] = true;
   
   // 代替 Map
   const map = {};
   map['key'] = 'value';
   ```

2. **使用数组方法**
   ```javascript
   // 查找
   array.find(item => item.id === id)
   
   // 过滤
   array.filter(item => item.active)
   
   // 映射
   array.map(item => item.name)
   ```

3. **避免复杂数据结构**
   - 保持数据结构简单
   - 使用扁平化数据
   - 避免深层嵌套

## 总结

成功修复了日历页面的 Set 对象问题：

1. ✅ 将 `checkInDates` 从 Set 改为普通对象
2. ✅ 修改数据填充逻辑，使用对象属性代替 Set 方法
3. ✅ 修改检查逻辑，使用对象属性访问代替 `.has()` 方法

**关键点**：
- 微信小程序的 `setData` 不支持 Set/Map 对象
- 使用普通对象作为哈希表是最佳替代方案
- 对象属性访问的性能足够好（O(1)时间复杂度）

现在日历页面应该可以正常工作了！
