# 打卡请求 URL 错误修复

## 问题描述

打卡提交时，前端发送的请求无法到达后端，显示"网络请求失败，请检查网络连接"错误。

## 根本原因

**文件**: `couple-fitness-weapp/utils/request.js`

前端的 `request` 函数有两种调用方式：
1. `request('/api/path', { method: 'POST', data: {...} })` - 两个参数
2. `request({ url: '/api/path', method: 'POST', data: {...} })` - 一个对象参数

但原始实现只支持第一种方式。打卡页面使用的是第二种方式，导致 `url` 参数被当作一个对象，而不是字符串，最终生成了无效的 URL。

## 修复方案

**文件**: `couple-fitness-weapp/utils/request.js`

修改 `request` 函数，支持两种调用方式：

```javascript
function request(url, options) {
  // 支持两种调用方式：
  // 1. request('/api/path', { method: 'POST', data: {...} })
  // 2. request({ url: '/api/path', method: 'POST', data: {...} })
  
  if (typeof url === 'object') {
    options = url;
    url = options.url;
  }
  
  options = options || {};
  
  // ... 其他代码
}
```

## 修复内容

1. **检查第一个参数的类型**
   - 如果是对象，则从对象中提取 `url` 和其他选项
   - 如果是字符串，则按原来的方式处理

2. **支持灵活的调用方式**
   - 两种调用方式都能正常工作
   - 向后兼容现有代码

## 测试步骤

1. **重新编译前端**
   - 在微信开发者工具中重新编译项目

2. **测试打卡功能**
   - 打开打卡页面
   - 选择运动类型
   - 输入运动时长
   - 点击提交按钮

3. **验证结果**
   - 查看微信开发者工具的 Console 日志
   - 应该看到"【网络请求】发起请求"日志
   - 应该看到"【网络请求】请求成功"日志
   - 后端应该收到请求并处理

## 相关文件

- `couple-fitness-weapp/utils/request.js` - HTTP 请求包装器（已修复）
- `couple-fitness-weapp/pages/checkin/index.js` - 打卡页面
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/CheckInController.java` - 打卡控制器

## 验证清单

- [x] 修复了 request 函数的参数处理
- [x] 支持两种调用方式
- [x] 代码无语法错误
- [x] 向后兼容现有代码
