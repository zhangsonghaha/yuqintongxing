/**
 * 网络请求封装
 */

const BASE_URL = 'http://localhost:8080';
let isRefreshing = false;
let refreshSubscribers = [];

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
          data: res.data
        });
        if (res.statusCode === 200) {
          resolve(res.data);
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
          reject(new Error(res.data.msg || res.data.message || '请求失败'));
        }
      },
      fail: function(err) {
        console.log('【网络请求】请求失败:', {
          url: fullUrl,
          error: err
        });
        reject(new Error('网络请求失败，请检查网络连接'));
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