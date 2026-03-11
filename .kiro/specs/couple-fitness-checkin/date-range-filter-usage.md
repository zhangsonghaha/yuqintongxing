# 日期范围筛选 API 使用说明

## 功能概述

打卡记录列表 API 支持按日期范围筛选功能，允许前端通过 `beginTime` 和 `endTime` 参数查询指定时间段内的打卡记录。

## API 端点

```
GET /api/checkin/list
```

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| beginTime | String | 否 | 开始日期 (YYYY-MM-DD) | 2026-03-01 |
| endTime | String | 否 | 结束日期 (YYYY-MM-DD) | 2026-03-31 |
| exerciseType | String | 否 | 运动类型 | running |
| pageNum | Integer | 否 | 页码 (默认1) | 1 |
| pageSize | Integer | 否 | 每页数量 (默认10) | 20 |

## 使用场景

### 1. 仅使用 beginTime (查询某日期之后的记录)

```
GET /api/checkin/list?beginTime=2026-03-10
```

返回 2026-03-10 及之后的所有打卡记录。

### 2. 仅使用 endTime (查询某日期之前的记录)

```
GET /api/checkin/list?endTime=2026-03-10
```

返回 2026-03-10 及之前的所有打卡记录。

### 3. 同时使用 beginTime 和 endTime (查询日期范围内的记录)

```
GET /api/checkin/list?beginTime=2026-03-01&endTime=2026-03-31
```

返回 2026-03-01 到 2026-03-31 之间的所有打卡记录。

### 4. 结合其他筛选条件

```
GET /api/checkin/list?beginTime=2026-03-01&endTime=2026-03-31&exerciseType=running&pageNum=1&pageSize=20
```

返回 2026-03-01 到 2026-03-31 之间，运动类型为 running 的打卡记录，分页显示。

## 响应示例

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
      "calories": 200.00,
      "photoUrl": "https://example.com/photo.jpg",
      "createdAt": "2026-03-10 10:30:00"
    }
  ],
  "total": 1
}
```

## 技术实现

### MyBatis 动态 SQL

在 `CheckInMapper.xml` 中使用动态 SQL 实现：

```xml
<if test="params.beginTime != null and params.beginTime != ''">
    AND DATE_FORMAT(check_in_date, '%Y-%m-%d') >= DATE_FORMAT(#{params.beginTime}, '%Y-%m-%d')
</if>
<if test="params.endTime != null and params.endTime != ''">
    AND DATE_FORMAT(check_in_date, '%Y-%m-%d') <= DATE_FORMAT(#{params.endTime}, '%Y-%m-%d')
</if>
```

### 参数传递

- 参数通过 RuoYi 框架的 `BaseEntity.params` Map 传递
- `CheckInRecord` 继承 `BaseEntity`，自动支持 params 参数
- 前端传递的 `beginTime` 和 `endTime` 会自动映射到 `params.beginTime` 和 `params.endTime`

## 前端调用示例

### 微信小程序

```javascript
// utils/api.js
export function getCheckInList(params) {
  return request({
    url: '/api/checkin/list',
    method: 'get',
    params: params
  });
}

// 页面调用
getCheckInList({
  beginTime: '2026-03-01',
  endTime: '2026-03-31',
  pageNum: 1,
  pageSize: 20
}).then(res => {
  console.log('打卡记录:', res.rows);
});
```

## 注意事项

1. **日期格式**: 必须使用 `YYYY-MM-DD` 格式
2. **时区**: 服务器使用系统时区，确保前后端时区一致
3. **边界包含**: beginTime 和 endTime 都是包含边界的（>=, <=）
4. **空值处理**: 如果不传递日期参数，则不进行日期筛选
5. **性能**: 已在 `check_in_date` 字段上建立索引，查询性能良好

## 测试

可以使用提供的 `test-date-range-filter.sql` 文件进行功能测试。
