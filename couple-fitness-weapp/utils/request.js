/**
 * 网络请求封装
 */

const { BASE_URL } = require('./config');
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * 统一显示错误提示
 * 优先使用后端返回的 msg，fallback 到默认文字
 */
function showError(msg, defaultMsg) {
  const text = (msg && msg !== 'undefined') ? msg : (defaultMsg || '操作失败');
  wx.showToast({
    title: text,
    icon: 'none',
    duration: 2500
  });
}

/**
 * 订阅令牌刷新
 */
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

/**
 * 通知所有订阅者令牌已刷新
 */
function onRefreshed(token) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

/**
 * 刷新令牌
 */
function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    const refreshToken = wx.getStorageSync('refreshToken');
    if (!refreshToken) {
      reject(new Error('No refresh token available'));
      return;
    }

    wx.request({
      url: BASE_URL + '/api/auth/refresh-token',
      method: 'POST',
      data: { refreshToken: refreshToken },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.data) {
          const { token, refreshToken: newRefreshToken } = res.data.data;
          wx.setStorageSync('token', token);
          wx.setStorageSync('refreshToken', newRefreshToken);
          resolve(token);
        } else {
          reject(new Error('Token refresh failed'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 网络请求
 * @param {string|object} url - 请求 URL 或完整的请求配置对象
 * @param {object} options - 请求选项（当第一个参数是字符串时使用）
 * @returns {Promise}
 */
function request(url, options) {
  // 支持两种调用方式：
  // 1. request('/api/path', { method: 'POST', data: {...} })
  // 2. request({ url: '/api/path', method: 'POST', data: {...} })
  
  if (typeof url === 'object') {
    options = url;
    url = options.url;
  }
  
  options = options || {};
  
  return new Promise(function(resolve, reject) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const fullUrl = BASE_URL + url;
    console.log('【网络请求】发起请求:', {
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {}
    });

    wx.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: Object.assign(headers, options.header || {}),
      success: function(res) {
        console.log('【网络请求】请求成功:', {
          url: fullUrl,
          statusCode: res.statusCode,
          dataType: typeof res.data,
          dataKeys: res.data ? Object.keys(res.data) : [],
          data: res.data
        });
        if (res.statusCode === 200) {
          // 检查响应数据格式
          if (res.data && res.data.code !== undefined) {
            // RuoYi 框架响应格式
            if (res.data.code === 200) {
              // 成功响应,直接返回整个响应对象
              // 前端可以访问 res.code, res.msg, res.data 或 res.rows
              console.log('【网络请求】返回成功响应:', {
                code: res.data.code,
                msg: res.data.msg,
                hasData: !!res.data.data,
                hasRows: !!res.data.rows,
                dataType: res.data.data ? typeof res.data.data : 'undefined',
                dataIsArray: Array.isArray(res.data.data)
              });
              resolve(res.data);
            } else {
              // 业务错误
              const errorMsg = res.data.msg || res.data.message || '操作失败';
              console.error('【网络请求】业务错误:', errorMsg);
              showError(errorMsg);
              reject(new Error(errorMsg));
            }
          } else {
            // 直接返回数据(没有包装格式)
            console.log('【网络请求】返回原始数据');
            resolve(res.data);
          }
        } else if (res.statusCode === 401) {
          // 令牌过期，尝试刷新
          if (!isRefreshing) {
            isRefreshing = true;
            refreshAccessToken()
              .then((newToken) => {
                isRefreshing = false;
                onRefreshed(newToken);
                // 重试原请求
                request(url, options).then(resolve).catch(reject);
              })
              .catch((err) => {
                isRefreshing = false;
                // 刷新失败，清除令牌并跳转到登录页
                wx.removeStorageSync('token');
                wx.removeStorageSync('refreshToken');
                wx.removeStorageSync('userId');
                wx.redirectTo({
                  url: '/pages/login/index'
                });
                reject(new Error('登录已过期，请重新登录'));
              });
          } else {
            // 正在刷新令牌，订阅刷新完成事件
            subscribeTokenRefresh((newToken) => {
              request(url, options).then(resolve).catch(reject);
            });
          }
        } else {
          // HTTP 错误
          let errorMsg = '请求失败';
          if (res.statusCode === 404) {
            errorMsg = `接口不存在 (404): ${url}`;
          } else if (res.data && (res.data.msg || res.data.message)) {
            errorMsg = res.data.msg || res.data.message;
          } else {
            errorMsg = `请求失败 (${res.statusCode})`;
          }
          console.error('【网络请求】HTTP错误:', {
            statusCode: res.statusCode,
            url: fullUrl,
            errorMsg: errorMsg
          });
          showError(errorMsg);
          reject(new Error(errorMsg));
        }
      },
      fail: function(err) {
        console.log('【网络请求】请求失败:', {
          url: fullUrl,
          error: err,
          errMsg: err.errMsg
        });
        
        // 判断是否是网络连接失败
        if (err.errMsg && err.errMsg.indexOf('fail') !== -1) {
          const msg = '无法连接到服务器，请检查网络';
          showError(msg);
          reject(new Error(msg));
        } else {
          const msg = '网络请求失败，请检查网络连接';
          showError(msg);
          reject(new Error(msg));
        }
      }
    });
  });
}

/**
 * GET 请求
 */
function get(url, options) {
  options = options || {};
  options.method = 'GET';
  return request(url, options);
}

/**
 * POST 请求
 */
function post(url, data, options) {
  options = options || {};
  options.method = 'POST';
  options.data = data || {};
  return request(url, options);
}

/**
 * PUT 请求
 */
function put(url, data, options) {
  options = options || {};
  options.method = 'PUT';
  options.data = data || {};
  return request(url, options);
}

/**
 * DELETE 请求
 */
function del(url, options) {
  options = options || {};
  options.method = 'DELETE';
  return request(url, options);
}

/**
 * 获取存储的 token
 */
function getToken() {
  return wx.getStorageSync('token') || '';
}

module.exports = {
  request: request,
  get: get,
  post: post,
  put: put,
  del: del
};