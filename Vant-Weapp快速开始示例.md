# Vant Weapp 快速开始示例

## 示例1：优化点赞功能的提示

### 修改前（使用原生 API）

```javascript
// pages/partner-checkins/index.js
onLikeChange(e) {
  const { recordId, isLiked, likeCount } = e.detail;
  
  // 更新本地数据
  // ...
  
  // 原生提示
  wx.showToast({
    title: isLiked ? '点赞成功' : '取消点赞',
    icon: 'success'
  });
}
```

### 修改后（使用 Vant Toast）

**1. 在页面 JSON 中引入组件**

```json
// pages/partner-checkins/index.json
{
  "navigationBarTitleText": "打卡记录",
  "enablePullDownRefresh": true,
  "usingComponents": {
    "check-in-card": "/components/custom/check-in-card/index",
    "van-toast": "@vant/weapp/toast/index"
  }
}
```

**2. 在 WXML 中添加组件**

```xml
<!-- pages/partner-checkins/index.wxml -->
<view class="container">
  <!-- 其他内容 -->
  
  <!-- 添加 Toast 组件 -->
  <van-toast id="van-toast" />
</view>
```

**3. 在 JS 中使用**

```javascript
// pages/partner-checkins/index.js
import Toast from '@vant/weapp/toast/toast';

Page({
  onLikeChange(e) {
    const { recordId, isLiked, likeCount } = e.detail;
    
    // 更新本地数据
    const checkInList = this.data.checkInList.map(item => {
      if (item.recordId === recordId) {
        return {
          ...item,
          hasLiked: isLiked,
          likeCount: likeCount
        };
      }
      return item;
    });
    
    this.setData({ checkInList });
    
    // 使用 Vant Toast
    Toast.success(isLiked ? '点赞成功' : '取消点赞');
    
    // 标记数据已更新
    this.dataChanged = true;
  }
});
```

## 示例2：优化评论功能的对话框

### 修改前

```javascript
onComment(e) {
  const { recordId } = e.detail;
  
  wx.showModal({
    title: '评论功能',
    content: '评论功能正在开发中，敬请期待！',
    showCancel: false
  });
}
```

### 修改后

**1. 引入组件**

```json
{
  "usingComponents": {
    "van-dialog": "@vant/weapp/dialog/index"
  }
}
```

**2. 添加组件**

```xml
<van-dialog id="van-dialog" />
```

**3. 使用 Dialog**

```javascript
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  onComment(e) {
    const { recordId } = e.detail;
    
    Dialog.alert({
      title: '评论功能',
      message: '评论功能正在开发中，敬请期待！\n\n即将支持：\n• 发表评论\n• 查看评论列表\n• 删除自己的评论\n• 快捷回复',
      confirmButtonText: '知道了'
    }).then(() => {
      console.log('用户点击了确认');
    });
  }
});
```

## 示例3：优化打卡页面的表单

### 修改打卡页面

**1. 引入组件**

```json
// pages/checkin/index.json
{
  "navigationBarTitleText": "打卡",
  "usingComponents": {
    "van-field": "@vant/weapp/field/index",
    "van-cell-group": "@vant/weapp/cell-group/index",
    "van-button": "@vant/weapp/button/index",
    "van-picker": "@vant/weapp/picker/index",
    "van-popup": "@vant/weapp/popup/index",
    "van-uploader": "@vant/weapp/uploader/index",
    "van-toast": "@vant/weapp/toast/index"
  }
}
```

**2. 优化表单界面**

```xml
<!-- pages/checkin/index.wxml -->
<view class="container">
  <!-- 运动类型选择 -->
  <van-cell-group>
    <van-cell
      title="运动类型"
      value="{{ exerciseTypeName }}"
      is-link
      bind:click="showExerciseTypePicker"
    />
  </van-cell-group>
  
  <!-- 运动时长输入 -->
  <van-cell-group>
    <van-field
      value="{{ duration }}"
      type="number"
      label="运动时长"
      placeholder="请输入运动时长（分钟）"
      right-icon="clock-o"
      bind:change="onDurationChange"
    />
  </van-cell-group>
  
  <!-- 照片上传 -->
  <van-cell-group title="打卡照片（可选）">
    <van-uploader
      file-list="{{ fileList }}"
      bind:after-read="afterRead"
      bind:delete="deleteImage"
      max-count="1"
      accept="image"
    />
  </van-cell-group>
  
  <!-- 提交按钮 -->
  <view class="submit-section">
    <van-button
      type="primary"
      size="large"
      loading="{{ submitting }}"
      bind:click="handleSubmit"
      block
    >
      {{ submitting ? '提交中...' : '完成打卡' }}
    </van-button>
  </view>
  
  <!-- 运动类型选择器 -->
  <van-popup show="{{ showPicker }}" position="bottom" bind:close="onPickerClose">
    <van-picker
      columns="{{ exerciseTypes }}"
      bind:confirm="onExerciseTypeConfirm"
      bind:cancel="onPickerClose"
    />
  </van-popup>
  
  <!-- Toast 提示 -->
  <van-toast id="van-toast" />
</view>
```

**3. JS 逻辑**

```javascript
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    exerciseType: '',
    exerciseTypeName: '请选择',
    duration: '',
    fileList: [],
    submitting: false,
    showPicker: false,
    exerciseTypes: [
      { text: '居家运动', value: 'home' },
      { text: '健身房', value: 'gym' },
      { text: '户外运动', value: 'outdoor' },
      { text: '跑步', value: 'running' },
      { text: '瑜伽', value: 'yoga' },
      { text: '力量训练', value: 'strength' }
    ]
  },
  
  // 显示运动类型选择器
  showExerciseTypePicker() {
    this.setData({ showPicker: true });
  },
  
  // 关闭选择器
  onPickerClose() {
    this.setData({ showPicker: false });
  },
  
  // 确认选择运动类型
  onExerciseTypeConfirm(e) {
    const { value, index } = e.detail;
    this.setData({
      exerciseType: value,
      exerciseTypeName: this.data.exerciseTypes[index].text,
      showPicker: false
    });
  },
  
  // 时长变化
  onDurationChange(e) {
    this.setData({ duration: e.detail });
  },
  
  // 图片上传
  afterRead(e) {
    const { file } = e.detail;
    Toast.loading('上传中...');
    
    // 上传图片逻辑
    wx.uploadFile({
      url: 'your-upload-url',
      filePath: file.url,
      name: 'file',
      success: (res) => {
        Toast.success('上传成功');
        this.setData({
          fileList: [{ url: file.url }]
        });
      },
      fail: () => {
        Toast.fail('上传失败');
      }
    });
  },
  
  // 删除图片
  deleteImage() {
    this.setData({ fileList: [] });
  },
  
  // 提交打卡
  async handleSubmit() {
    // 验证
    if (!this.data.exerciseType) {
      Toast.fail('请选择运动类型');
      return;
    }
    
    if (!this.data.duration) {
      Toast.fail('请输入运动时长');
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      // 提交逻辑
      await this.submitCheckIn();
      Toast.success('打卡成功');
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      Toast.fail('打卡失败');
    } finally {
      this.setData({ submitting: false });
    }
  }
});
```

## 示例4：优化首页的加载状态

**1. 引入组件**

```json
{
  "usingComponents": {
    "van-loading": "@vant/weapp/loading/index",
    "van-empty": "@vant/weapp/empty/index"
  }
}
```

**2. 使用加载和空状态**

```xml
<!-- pages/index/index.wxml -->
<view class="container">
  <!-- 加载状态 -->
  <view wx:if="{{ loading }}" class="loading-container">
    <van-loading type="spinner" size="24px">加载中...</van-loading>
  </view>
  
  <!-- 空状态 -->
  <van-empty
    wx:elif="{{ !loading && recentCheckIns.length === 0 }}"
    description="还没有打卡记录"
    image="search"
  />
  
  <!-- 内容 -->
  <view wx:else>
    <!-- 打卡记录列表 -->
  </view>
</view>
```

## 示例5：添加下拉刷新提示

```javascript
import Toast from '@vant/weapp/toast/toast';

Page({
  onPullDownRefresh() {
    Toast.loading('刷新中...');
    
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
      Toast.success('刷新成功');
    }).catch(() => {
      wx.stopPullDownRefresh();
      Toast.fail('刷新失败');
    });
  }
});
```

## 完整的页面改造示例

### 改造对方打卡记录页面

**index.json**
```json
{
  "navigationBarTitleText": "打卡记录",
  "enablePullDownRefresh": true,
  "usingComponents": {
    "check-in-card": "/components/custom/check-in-card/index",
    "van-toast": "@vant/weapp/toast/index",
    "van-dialog": "@vant/weapp/dialog/index",
    "van-loading": "@vant/weapp/loading/index",
    "van-empty": "@vant/weapp/empty/index"
  }
}
```

**index.wxml**
```xml
<view class="container">
  <!-- 加载状态 -->
  <view wx:if="{{ loading && checkInList.length === 0 }}" class="loading-container">
    <van-loading type="spinner" size="24px">加载中...</van-loading>
  </view>
  
  <!-- 打卡记录列表 -->
  <view wx:elif="{{ checkInList.length > 0 }}" class="checkin-list">
    <check-in-card 
      wx:for="{{ checkInList }}" 
      wx:key="recordId"
      record="{{ item }}"
      bind:likechange="onLikeChange"
      bind:comment="onComment"
    />
    
    <!-- 加载更多 -->
    <view wx:if="{{ loading }}" class="load-more">
      <van-loading type="spinner" size="20px">加载中...</van-loading>
    </view>
    <view wx:elif="{{ !hasMore }}" class="load-more">
      <text>没有更多了</text>
    </view>
  </view>
  
  <!-- 空状态 -->
  <van-empty
    wx:else
    description="{{ partnerName }}还没有打卡记录"
    image="search"
  >
    <van-button round type="primary" bind:click="goBack">返回首页</van-button>
  </van-empty>
  
  <!-- Toast 和 Dialog -->
  <van-toast id="van-toast" />
  <van-dialog id="van-dialog" />
</view>
```

**index.js**
```javascript
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

const { checkInAPI } = require('../../utils/api');
const storage = require('../../utils/storage');

Page({
  // ... 其他代码
  
  onLikeChange(e) {
    const { recordId, isLiked, likeCount } = e.detail;
    
    // 更新本地数据
    const checkInList = this.data.checkInList.map(item => {
      if (item.recordId === recordId) {
        return { ...item, hasLiked: isLiked, likeCount: likeCount };
      }
      return item;
    });
    
    this.setData({ checkInList });
    Toast.success(isLiked ? '点赞成功' : '取消点赞');
    this.dataChanged = true;
  },
  
  onComment(e) {
    const { recordId } = e.detail;
    
    Dialog.alert({
      title: '评论功能',
      message: '评论功能正在开发中，敬请期待！',
      confirmButtonText: '知道了'
    });
  },
  
  onPullDownRefresh() {
    this.loadCheckInList().then(() => {
      wx.stopPullDownRefresh();
      Toast.success('刷新成功');
    }).catch(() => {
      wx.stopPullDownRefresh();
      Toast.fail('刷新失败');
    });
  },
  
  goBack() {
    wx.navigateBack();
  }
});
```

## 总结

使用 Vant Weapp 后的优势：

1. ✅ 更美观的 UI 组件
2. ✅ 更好的用户体验
3. ✅ 更少的代码量
4. ✅ 统一的视觉风格
5. ✅ 更强的功能性

建议按照以下顺序逐步改造：

1. Toast 和 Dialog（最简单，收益最大）
2. Loading 和 Empty（提升体验）
3. Button 和 Field（优化表单）
4. 其他业务组件（按需使用）
