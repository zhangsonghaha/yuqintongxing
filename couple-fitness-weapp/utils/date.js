/**
 * 日期处理工具
 */

/**
 * 格式化日期
 * @param {Date|number} date - 日期对象或时间戳
 * @param {string} format - 格式字符串
 * @returns {string}
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 获取今天的日期
 */
function getToday() {
  return formatDate(new Date(), 'YYYY-MM-DD');
}

/**
 * 获取昨天的日期
 */
function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date, 'YYYY-MM-DD');
}

/**
 * 计算连续打卡天数
 */
function calculateConsecutiveDays(records) {
  if (!records || records.length === 0) return 0;
  
  let consecutive = 0;
  const today = new Date();
  
  for (let i = 0; i < records.length; i++) {
    const recordDate = new Date(records[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (formatDate(recordDate, 'YYYY-MM-DD') === formatDate(expectedDate, 'YYYY-MM-DD')) {
      consecutive++;
    } else {
      break;
    }
  }
  
  return consecutive;
}

/**
 * 获取本月的天数
 */
function getDaysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * 获取本月的第一天
 */
function getFirstDayOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 获取本月的最后一天
 */
function getLastDayOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

module.exports = {
  formatDate,
  getToday,
  getYesterday,
  calculateConsecutiveDays,
  getDaysInMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth
};
