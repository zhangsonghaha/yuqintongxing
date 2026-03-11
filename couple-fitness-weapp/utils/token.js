/**
 * 令牌管理工具
 */

/**
 * 检查令牌是否有效
 */
function isTokenValid() {
  const token = wx.getStorageSync('token');
  return !!token;
}

/**
 * 获取令牌
 */
function getToken() {
  return wx.getStorageSync('token') || '';
}

/**
 * 设置令牌
 */
function setToken(token) {
  wx.setStorageSync('token', token);
}

/**
 * 获取刷新令牌
 */
function getRefreshToken() {
  return wx.getStorageSync('refreshToken') || '';
}

/**
 * 设置刷新令牌
 */
function setRefreshToken(refreshToken) {
  wx.setStorageSync('refreshToken', refreshToken);
}

/**
 * 清除令牌
 */
function clearToken() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('refreshToken');
  wx.removeStorageSync('userId');
  wx.removeStorageSync('userInfo');
}

/**
 * 获取授权头
 */
function getAuthHeader() {
  const token = getToken();
  if (token) {
    return {
      'Authorization': 'Bearer ' + token
    };
  }
  return {};
}

module.exports = {
  isTokenValid,
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearToken,
  getAuthHeader
};
