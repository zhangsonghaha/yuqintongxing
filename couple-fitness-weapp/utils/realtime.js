/**
 * 实时更新工具
 * 用于实现打卡记录、点赞、评论的实时更新
 */

class RealtimeUpdater {
  constructor() {
    this.pollingInterval = null;
    this.pollingDelay = 30000; // 默认30秒轮询一次
    this.isPolling = false;
    this.callbacks = [];
    this.lastUpdateTime = null;
  }

  /**
   * 开始轮询
   * @param {Function} callback - 更新回调函数
   * @param {Number} delay - 轮询间隔（毫秒）
   */
  startPolling(callback, delay) {
    if (this.isPolling) {
      console.log('轮询已在运行中');
      return;
    }

    this.pollingDelay = delay || this.pollingDelay;
    this.callbacks.push(callback);
    this.isPolling = true;

    console.log(`开始轮询，间隔: ${this.pollingDelay}ms`);

    // 立即执行一次
    this._executeCallbacks();

    // 设置定时器
    this.pollingInterval = setInterval(() => {
      this._executeCallbacks();
    }, this.pollingDelay);
  }

  /**
   * 停止轮询
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
      console.log('停止轮询');
    }
  }

  /**
   * 添加回调函数
   * @param {Function} callback
   */
  addCallback(callback) {
    if (typeof callback === 'function' && !this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
  }

  /**
   * 移除回调函数
   * @param {Function} callback
   */
  removeCallback(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 清空所有回调
   */
  clearCallbacks() {
    this.callbacks = [];
  }

  /**
   * 执行所有回调函数
   */
  _executeCallbacks() {
    this.lastUpdateTime = Date.now();
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('执行回调函数失败:', error);
      }
    });
  }

  /**
   * 手动触发更新
   */
  triggerUpdate() {
    this._executeCallbacks();
  }

  /**
   * 重置轮询（停止后重新开始）
   */
  resetPolling() {
    this.stopPolling();
    if (this.callbacks.length > 0) {
      const firstCallback = this.callbacks[0];
      this.callbacks = [];
      this.startPolling(firstCallback, this.pollingDelay);
    }
  }
}

// 创建单例
const realtimeUpdater = new RealtimeUpdater();

module.exports = realtimeUpdater;
