# 运动类型筛选功能使用说明
# Exercise Type Filter Usage Guide

## 功能概述

运动类型筛选功能允许用户根据特定的运动类型（如跑步、健身、瑜伽等）来筛选打卡记录。该功能已集成到现有的打卡记录列表 API 中，支持与其他筛选条件（如日期范围、用户ID）组合使用。

## 支持的运动类型

根据产品需求文档，系统支持以下运动类型：

- `running` - 跑步
- `fitness` - 健身
- `yoga` - 瑜伽
- `swimming` - 游泳
- `cycling` - 骑行
- `basketball` - 篮球
- `badminton` - 羽毛球
- `other` - 其他

## API 使用方法

### 端点
```
GET /api/checkin/list
```

### 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| exerciseType | String | 否 | 运动类型 | running |
| userId | Long | 否 | 用户ID（自动从token获取） | 1 |
| checkInDate | Date | 否 | 特定日期 | 2026-03-10 |
| params.beginTime | String | 否 | 开始日期 | 2026-03-01 |
| params.endTime | String | 否 | 结束日期 | 2026-03-31 |
| pageNum | Integer | 否 | 页码（默认1） | 1 |
| pageSize | Integer | 否 | 每页数量（默认10） | 20 |

### 请求示例

#### 1. 仅按运动类型筛选
```bash
GET /api/checkin/list?exerciseType=running
Authorization: Bearer {jwt_token}
```

#### 2. 运动类型 + 日期范围
```bash
GET /api/checkin/list?exerciseType=fitness&params.beginTime=2026-03-01&params.endTime=2026-03-31
Authorization: Bearer {jwt_token}
```

#### 3. 运动类型 + 分页
```bash
GET /api/checkin/list?exerciseType=yoga&pageNum=1&pageSize=20
Authorization: Bearer {jwt_token}
```

### 响应示例

```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "recordId": 1,
      "userId": 1,
      "checkInDate": "2026-03-10",
      "exerciseType": "running",
      "duration": 30,
      "calories": 240.00,
      "photoUrl": "https://example.com/photo.jpg",
      "createdAt": "2026-03-10 10:30:00"
    },
    {
      "recordId": 2,
      "userId": 1,
      "checkInDate": "2026-03-09",
      "exerciseType": "running",
      "duration": 45,
      "calories": 360.00,
      "photoUrl": "https://example.com/photo2.jpg",
      "createdAt": "2026-03-09 08:15:00"
    }
  ],
  "total": 2
}
```

## 技术实现

### 1. 数据库层 (MyBatis)

在 `CheckInMapper.xml` 中的 `selectCheckInList` 方法中实现：

```xml
<select id="selectCheckInList" parameterType="com.ruoyi.web.domain.CheckInRecord" resultMap="CheckInRecordResult">
    SELECT * FROM check_in_record
    <where>
        deleted_at IS NULL
        <if test="userId != null">
            AND user_id = #{userId}
        </if>
        <if test="checkInDate != null">
            AND check_in_date = #{checkInDate}
        </if>
        <if test="exerciseType != null and exerciseType != ''">
            AND exercise_type = #{exerciseType}
        </if>
        <if test="params.beginTime != null and params.beginTime != ''">
            AND DATE_FORMAT(check_in_date, '%Y-%m-%d') &gt;= DATE_FORMAT(#{params.beginTime}, '%Y-%m-%d')
        </if>
        <if test="params.endTime != null and params.endTime != ''">
            AND DATE_FORMAT(check_in_date, '%Y-%m-%d') &lt;= DATE_FORMAT(#{params.endTime}, '%Y-%m-%d')
        </if>
    </where>
    ORDER BY check_in_date DESC, created_at DESC
</select>
```

**关键点：**
- 使用 MyBatis 动态 SQL `<if>` 标签
- 检查 `exerciseType` 不为 null 且不为空字符串
- 使用参数化查询防止 SQL 注入
- 支持与其他筛选条件组合使用

### 2. 数据访问层 (Mapper)

```java
/**
 * 查询打卡记录列表(支持分页和筛选)
 * 
 * @param checkInRecord 查询条件
 * @return 打卡记录列表
 */
List<CheckInRecord> selectCheckInList(CheckInRecord checkInRecord);
```

### 3. 服务层 (Service)

服务层直接调用 Mapper 方法，无需额外处理：

```java
@Override
public List<CheckInRecord> getCheckInList(CheckInRecord checkInRecord) {
    return checkInMapper.selectCheckInList(checkInRecord);
}
```

### 4. 控制器层 (Controller)

```java
@GetMapping("/list")
public TableDataInfo listCheckIn(CheckInRecord checkInRecord) {
    // 设置当前用户ID
    Long userId = SecurityUtils.getUserId();
    checkInRecord.setUserId(userId);
    
    startPage();
    List<CheckInRecord> list = checkInService.getCheckInList(checkInRecord);
    return getDataTable(list);
}
```

**关键点：**
- Spring MVC 自动将请求参数绑定到 `CheckInRecord` 对象
- `exerciseType` 参数会自动映射到对象的 `exerciseType` 属性
- 支持分页功能（通过 `startPage()` 方法）

## 前端集成示例

### 微信小程序调用示例

```javascript
// utils/api.js
export function getCheckInList(params) {
  return request({
    url: '/api/checkin/list',
    method: 'get',
    params: params
  });
}

// 使用示例
import { getCheckInList } from '../../utils/api';

Page({
  data: {
    exerciseType: 'running', // 当前选择的运动类型
    checkInList: []
  },
  
  // 加载打卡记录
  loadCheckInList() {
    const params = {
      exerciseType: this.data.exerciseType,
      pageNum: 1,
      pageSize: 20
    };
    
    getCheckInList(params).then(res => {
      if (res.code === 200) {
        this.setData({
          checkInList: res.rows
        });
      }
    });
  },
  
  // 切换运动类型
  onExerciseTypeChange(e) {
    this.setData({
      exerciseType: e.detail.value
    });
    this.loadCheckInList();
  }
});
```

### 前端筛选组件示例

```xml
<!-- 运动类型选择器 -->
<picker 
  mode="selector" 
  range="{{exerciseTypes}}" 
  range-key="label"
  value="{{exerciseTypeIndex}}"
  bindchange="onExerciseTypeChange">
  <view class="picker">
    当前选择：{{exerciseTypes[exerciseTypeIndex].label}}
  </view>
</picker>

<!-- 打卡记录列表 -->
<view class="check-in-list">
  <block wx:for="{{checkInList}}" wx:key="recordId">
    <view class="check-in-item">
      <text>{{item.checkInDate}}</text>
      <text>{{item.exerciseType}}</text>
      <text>{{item.duration}}分钟</text>
    </view>
  </block>
</view>
```

```javascript
data: {
  exerciseTypes: [
    { value: '', label: '全部' },
    { value: 'running', label: '跑步' },
    { value: 'fitness', label: '健身' },
    { value: 'yoga', label: '瑜伽' },
    { value: 'swimming', label: '游泳' },
    { value: 'cycling', label: '骑行' },
    { value: 'basketball', label: '篮球' },
    { value: 'badminton', label: '羽毛球' },
    { value: 'other', label: '其他' }
  ],
  exerciseTypeIndex: 0
}
```

## 测试验证

### 1. 单元测试

可以使用提供的 SQL 测试文件 `test-exercise-type-filter.sql` 进行数据库层面的测试。

### 2. API 测试

使用 Postman 或 curl 进行 API 测试：

```bash
# 测试1: 筛选跑步记录
curl -X GET "http://localhost:8080/api/checkin/list?exerciseType=running" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 测试2: 筛选健身记录 + 日期范围
curl -X GET "http://localhost:8080/api/checkin/list?exerciseType=fitness&params.beginTime=2026-03-01&params.endTime=2026-03-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 测试3: 筛选瑜伽记录 + 分页
curl -X GET "http://localhost:8080/api/checkin/list?exerciseType=yoga&pageNum=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 集成测试

在实际应用中测试以下场景：

1. ✅ 不传 exerciseType 参数 - 返回所有记录
2. ✅ 传入有效的 exerciseType - 返回对应类型的记录
3. ✅ 传入空字符串 - 返回所有记录
4. ✅ 与日期范围筛选组合 - 正确筛选
5. ✅ 与分页功能组合 - 正确分页
6. ✅ 传入不存在的运动类型 - 返回空列表

## 性能考虑

1. **索引优化**：在 `exercise_type` 字段上建立索引可以提高查询性能
   ```sql
   CREATE INDEX idx_exercise_type ON check_in_record(exercise_type);
   ```

2. **组合索引**：如果经常组合查询，可以建立组合索引
   ```sql
   CREATE INDEX idx_user_date_type ON check_in_record(user_id, check_in_date, exercise_type);
   ```

3. **分页查询**：使用 PageHelper 进行分页，避免一次性加载大量数据

## 注意事项

1. **参数验证**：exerciseType 参数应该在前端进行验证，确保只传入支持的运动类型
2. **大小写敏感**：数据库查询是大小写敏感的，确保前后端使用一致的命名
3. **空值处理**：当 exerciseType 为 null 或空字符串时，不应用该筛选条件
4. **安全性**：使用参数化查询防止 SQL 注入攻击
5. **性能监控**：在生产环境中监控查询性能，必要时添加索引

## 扩展功能

未来可以考虑的扩展：

1. **多选筛选**：支持同时选择多个运动类型
2. **模糊搜索**：支持运动类型的模糊匹配
3. **统计分析**：按运动类型统计打卡次数、时长、卡路里等
4. **智能推荐**：根据用户历史记录推荐运动类型

## 相关文件

- **Mapper XML**: `RuoYi-Vue/ruoyi-admin/src/main/resources/mapper/web/CheckInMapper.xml`
- **Mapper Interface**: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/mapper/CheckInMapper.java`
- **Domain Class**: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/domain/CheckInRecord.java`
- **Service Interface**: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/ICheckInService.java`
- **Service Implementation**: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/impl/CheckInServiceImpl.java`
- **Controller**: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/CheckInController.java`
- **SQL Test**: `test-exercise-type-filter.sql`

## 总结

运动类型筛选功能已完整实现并集成到现有的打卡记录列表 API 中。该功能：

✅ 使用 MyBatis 动态 SQL 实现灵活的条件查询  
✅ 支持与日期范围、用户ID等其他筛选条件组合使用  
✅ 遵循 RuoYi 框架规范  
✅ 支持分页功能  
✅ 参数化查询确保安全性  
✅ 代码简洁易维护  

该功能可以直接在前端调用使用，无需额外的后端开发工作。
