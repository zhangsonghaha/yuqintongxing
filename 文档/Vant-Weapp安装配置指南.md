# Vant Weapp 安装配置指南

## 步骤1：安装依赖

在小程序项目根目录下执行：

```bash
cd couple-fitness-weapp
npm install @vant/weapp -S --production
```

或者使用 yarn：

```bash
cd couple-fitness-weapp
yarn add @vant/weapp --production
```

## 步骤2：构建 npm

### 方法1：使用微信开发者工具（推荐）

1. 打开微信开发者工具
2. 点击菜单栏：工具 → 构建 npm
3. 等待构建完成，会生成 `miniprogram_npm` 目录

### 方法2：使用命令行

```bash
# 在微信开发者工具中打开项目后
# 点击 "工具" → "构建 npm"
```

## 步骤3：修改 app.json 配置

在 `app.json` 中添加 Vant 组件的样式引入（可选）：

```json
{
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

## 步骤4：在页面中使用 Vant 组件

### 方法1：在页面 JSON 中引入

例如在 `pages/index/index.json` 中：

```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-toast": "@vant/weapp/toast/index",
    "van-dialog": "@vant/weapp/dialog/index"
  }
}
```

### 方法2：在 app.json 中全局引入（不推荐）

```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-toast": "@vant/weapp/toast/index"
  }
}
```

## 步骤5：在页面中使用

### WXML 中使用组件

```xml
<van-button type="primary" bind:click="onClick">按钮</van-button>
<van-toast id="van-toast" />
```

### JS 中使用 API

```javascript
import Toast from '@vant/weapp/toast/toast';

Page({
  onClick() {
    Toast.success('成功提示');
  }
});
```

## 常见问题

### 问题1：构建 npm 后找不到组件

**解决方案**：
1. 确保已经执行 `npm install`
2. 在微信开发者工具中点击"工具" → "构建 npm"
3. 检查是否生成了 `miniprogram_npm` 目录
4. 重启微信开发者工具

### 问题2：组件样式不生效

**解决方案**：
1. 检查 `project.config.json` 中的 `packNpmManually` 是否为 `false`
2. 检查 `minifyWXSS` 是否为 `true`
3. 清除缓存后重新构建

### 问题3：npm 构建失败

**解决方案**：
1. 删除 `node_modules` 和 `miniprogram_npm` 目录
2. 重新执行 `npm install`
3. 在微信开发者工具中重新构建 npm

### 问题4：组件路径错误

**解决方案**：
确保使用正确的路径格式：
- ✅ 正确：`"@vant/weapp/button/index"`
- ❌ 错误：`"/miniprogram_npm/@vant/weapp/button/index"`

## 验证安装

创建一个测试页面验证 Vant Weapp 是否正常工作：

### test.json
```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-cell": "@vant/weapp/cell/index"
  }
}
```

### test.wxml
```xml
<view class="container">
  <van-cell title="单元格" value="内容" />
  <van-button type="primary">主要按钮</van-button>
  <van-button type="info">信息按钮</van-button>
  <van-button type="warning">警告按钮</van-button>
  <van-button type="danger">危险按钮</van-button>
</view>
```

如果能正常显示，说明安装成功！

## 推荐的组件使用

### 1. Toast 提示

```javascript
import Toast from '@vant/weapp/toast/toast';

// 成功提示
Toast.success('操作成功');

// 失败提示
Toast.fail('操作失败');

// 加载提示
Toast.loading('加载中...');

// 自定义提示
Toast({
  type: 'success',
  message: '自定义提示',
  duration: 2000
});
```

### 2. Dialog 对话框

```javascript
import Dialog from '@vant/weapp/dialog/dialog';

// 提示对话框
Dialog.alert({
  title: '标题',
  message: '内容'
}).then(() => {
  // 点击确认后的回调
});

// 确认对话框
Dialog.confirm({
  title: '标题',
  message: '确定要删除吗？'
}).then(() => {
  // 点击确认
}).catch(() => {
  // 点击取消
});
```

### 3. Button 按钮

```xml
<van-button type="primary">主要按钮</van-button>
<van-button type="info">信息按钮</van-button>
<van-button type="warning">警告按钮</van-button>
<van-button type="danger">危险按钮</van-button>
<van-button plain>朴素按钮</van-button>
<van-button round>圆角按钮</van-button>
<van-button square>方形按钮</van-button>
<van-button loading>加载中</van-button>
<van-button disabled>禁用状态</van-button>
```

### 4. Field 输入框

```xml
<van-cell-group>
  <van-field
    value="{{ username }}"
    label="用户名"
    placeholder="请输入用户名"
    bind:change="onUsernameChange"
  />
  <van-field
    value="{{ password }}"
    type="password"
    label="密码"
    placeholder="请输入密码"
    bind:change="onPasswordChange"
  />
</van-cell-group>
```

### 5. Uploader 文件上传

```xml
<van-uploader
  file-list="{{ fileList }}"
  bind:after-read="afterRead"
  bind:delete="deleteFile"
  max-count="3"
/>
```

## 项目配置文件说明

### package.json
```json
{
  "name": "couple-fitness-weapp",
  "version": "1.0.0",
  "description": "情侣健身打卡小程序",
  "dependencies": {
    "@vant/weapp": "^1.11.6"
  }
}
```

### project.config.json
```json
{
  "setting": {
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true
  }
}
```

## 下一步

安装完成后，可以开始使用 Vant Weapp 优化现有页面：

1. ✅ 替换 wx.showToast 为 van-toast
2. ✅ 替换 wx.showModal 为 van-dialog
3. ✅ 优化表单输入框为 van-field
4. ✅ 优化按钮为 van-button
5. ✅ 添加更多交互组件

## 参考资源

- [Vant Weapp 官方文档](https://vant-contrib.gitee.io/vant-weapp/)
- [Vant Weapp GitHub](https://github.com/youzan/vant-weapp)
- [微信小程序 npm 支持](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)
