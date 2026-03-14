/**
 * 全局配置文件
 * 统一管理 API 请求地址和其他配置
 */

// API 基础地址配置
const config = {
  // 开发环境
  development: {
    baseURL: 'http://82.157.176.188:8080',
    uploadURL: 'http://82.157.176.188:8080'
  },
  // 测试环境
  test: {
    baseURL: 'http://localhost:8080',
    uploadURL: 'http://localhost:8080'
  }, 
  // 生产环境
  production: {
    baseURL: 'https://www.yqtx.site',
    uploadURL: 'https://www.yqtx.site'
  }
};

// 当前环境 (development | test | production)
// 修改这里可以切换环境
const ENV = 'development';

// 导出当前环境的配置
module.exports = {
  BASE_URL: config[ENV].baseURL,
  UPLOAD_URL: config[ENV].uploadURL,
  ENV: ENV
};
