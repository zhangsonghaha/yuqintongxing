/**
 * 腾讯地图位置服务工具类
 * API Key: CKJBZ-LRJ6N-X6IFR-SNB74-7XGBT-PZB3B
 */

const QQ_MAP_KEY = 'CKJBZ-LRJ6N-X6IFR-SNB74-7XGBT-PZB3B';

/**
 * 获取用户当前位置
 * @returns {Promise} 返回位置信息
 */
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02', // 国测局坐标系
      success: (res) => {
        console.log('获取位置成功:', res);
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
          speed: res.speed,
          altitude: res.altitude
        });
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 逆地址解析（坐标转地址）
 * @param {Number} latitude 纬度
 * @param {Number} longitude 经度
 * @returns {Promise} 返回地址信息
 */
function reverseGeocoder(latitude, longitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latitude},${longitude}`,
        key: QQ_MAP_KEY,
        get_poi: 1 // 返回附近POI列表
      },
      success: (res) => {
        if (res.data.status === 0) {
          const result = res.data.result;
          resolve({
            address: result.address,
            formatted_addresses: result.formatted_addresses,
            address_component: result.address_component,
            ad_info: result.ad_info,
            pois: result.pois || []
          });
        } else {
          reject(new Error(res.data.message || '地址解析失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 获取用户位置并解析地址
 * @returns {Promise} 返回完整的位置和地址信息
 */
function getLocationWithAddress() {
  return getCurrentLocation()
    .then(location => {
      return reverseGeocoder(location.latitude, location.longitude)
        .then(address => {
          return {
            ...location,
            ...address
          };
        });
    });
}

/**
 * 检查位置权限
 * @returns {Promise} 返回权限状态
 */
function checkLocationAuth() {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 请求位置权限
 * @returns {Promise}
 */
function requestLocationAuth() {
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        resolve(true);
      },
      fail: () => {
        // 用户拒绝授权，引导用户打开设置
        wx.showModal({
          title: '需要位置权限',
          content: '打卡需要获取您的位置信息，请在设置中开启位置权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.userLocation']) {
                    resolve(true);
                  } else {
                    reject(new Error('用户未授权位置权限'));
                  }
                }
              });
            } else {
              reject(new Error('用户拒绝授权位置权限'));
            }
          }
        });
      }
    });
  });
}

/**
 * 格式化地址（简短版本）
 * @param {Object} locationData 位置数据
 * @returns {String} 格式化后的地址
 */
function formatAddress(locationData) {
  if (!locationData || !locationData.address_component) {
    return '未知位置';
  }
  
  const comp = locationData.address_component;
  const city = comp.city || comp.province;
  const district = comp.district;
  const street = comp.street;
  
  return `${city}${district}${street}`;
}

/**
 * 格式化详细地址
 * @param {Object} locationData 位置数据
 * @returns {String} 详细地址
 */
function formatDetailAddress(locationData) {
  if (!locationData || !locationData.formatted_addresses) {
    return locationData.address || '未知位置';
  }
  
  return locationData.formatted_addresses.recommend || locationData.address;
}

module.exports = {
  getCurrentLocation,
  reverseGeocoder,
  getLocationWithAddress,
  checkLocationAuth,
  requestLocationAuth,
  formatAddress,
  formatDetailAddress
};
