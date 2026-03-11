# 情侣健身打卡小程序

一款专为情侣设计的运动健身记录与互动平台。

## 项目特性

- ✨ 极简体验：3秒完成打卡
- 💑 情侣互动：强化情感连接
- 🎮 游戏化激励：虚拟养成、等级系统
- 💝 情感价值：创造长期回忆

## 技术栈

- **框架**：原生微信小程序
- **组件库**：Vant Weapp v1.10.4+
- **状态管理**：getApp() + 本地存储
- **网络请求**：wx.request()
- **开发工具**：微信开发者工具

## 项目结构

\\\
couple-fitness-weapp/
├── components/              # 组件目录
│   ├── vant/               # Vant Weapp 组件库
│   └── custom/             # 自定义组件
├── pages/                  # 页面目录
│   ├── index/              # 首页
│   ├── calendar/           # 日历
│   ├── pet/                # 宠物
│   ├── profile/            # 个人中心
│   ├── chat/               # 聊天
│   └── login/              # 登录
├── utils/                  # 工具函数
│   ├── request.js          # 网络请求
│   ├── api.js              # API 调用
│   ├── storage.js          # 本地存储
│   ├── date.js             # 日期处理
│   └── constants.js        # 常量定义
├── styles/                 # 全局样式
├── assets/                 # 资源文件
├── app.js                  # 应用入口
├── app.json                # 应用配置
├── app.wxss                # 应用样式
└── project.config.json     # 项目配置
\\\

## 快速开始

### 1. 安装 Vant Weapp

从 GitHub 下载最新版本：
https://github.com/youzan/vant-weapp/releases

将 \lib\ 文件夹复制到 \components/vant\ 目录

### 2. 配置小程序

在微信开发者工具中打开项目，修改 \project.config.json\ 中的 \ppid\

### 3. 开发

在微信开发者工具中编辑代码，实时预览

## 开发规范

### 命名规范

- 文件：小写 + 连字符（如 \check-in.wxml\）
- 变量：驼峰式（如 \userInfo\）
- 常量：大写 + 下划线（如 \MAX_RETRY_COUNT\）
- 事件：on + 大写首字母（如 \onCheckIn\）

### 代码风格

- 缩进：2 个空格
- 注释：JSDoc 格式
- 错误处理：所有异步操作都要处理错误

## 功能清单

### MVP 阶段

- [ ] 用户登录和配对
- [ ] 微打卡功能
- [ ] 情侣日历
- [ ] 基础聊天

### V1.0 阶段

- [ ] 虚拟宠物养成
- [ ] 赌约系统
- [ ] 等级系统
- [ ] 成就系统

### V2.0 阶段

- [ ] 照片拼图
- [ ] 能量银行
- [ ] 盲盒系统

## 常见问题

### Q: 如何自定义主题色？

A: 在 \pp.wxss\ 中修改 CSS 变量：

\\\wxss
page {
  --van-primary-color: #FF6B9D;
}
\\\

### Q: 如何添加新页面？

A: 
1. 在 \pages\ 目录下创建新文件夹
2. 创建 \.wxml\、\.js\、\.json\、\.wxss\ 文件
3. 在 \pp.json\ 的 \pages\ 数组中添加页面路径

### Q: 如何调用 API？

A: 使用 \utils/api.js\ 中的 API 函数：

\\\javascript
const { checkInAPI } = require('../../utils/api');

// 打卡
await checkInAPI.checkIn({
  exerciseType: 'gym',
  date: '2026-03-10',
  duration: 60
});
\\\

## 参考资源

- [Vant Weapp 官方文档](https://youzan.github.io/vant-weapp/)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信小程序 API 文档](https://developers.weixin.qq.com/miniprogram/dev/api/)

## 许可证

MIT

## 联系方式

如有问题，请联系：张松
