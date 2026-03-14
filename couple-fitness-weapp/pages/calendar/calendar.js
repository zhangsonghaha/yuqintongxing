/**
 * 日历页面
 */

const api = require('../../utils/api');
const storage = require('../../utils/storage');
const request = require('../../utils/request');

const EXERCISE_ICON_MAP = {
  '跑步': '🏃', 'running': '🏃',
  '骑行': '🚴', 'cycling': '🚴',
  '瑜伽': '🧘', 'yoga': '🧘',
  '游泳': '🏊', 'swimming': '🏊',
  '健身房': '🏋️', 'gym': '🏋️',
  '居家': '🤸', 'home': '🤸',
  '户外': '🌿', 'outdoor': '🌿',
  '力量训练': '💪', 'strength': '💪'
};

Page({
  data: {
    // 日历数据
    currentYear: 2024,
    currentMonth: 1,
    calendarDates: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    selectedDate: '',

    // 筛选条件
    filterType: '',
    exerciseTypes: [
      { label: '居家', value: '居家' },
      { label: '健身房', value: '健身房' },
      { label: '户外', value: '户外' },
      { label: '跑步', value: '跑步' },
      { label: '瑜伽', value: '瑜伽' },
      { label: '力量训练', value: '力量训练' }
    ],

    // 打卡记录
    records: [],
    totalRecords: 0,
    pageNum: 1,
    pageSize: 20,
    hasMore: true,

    // 打卡日期集合（区分我/TA/双方）
    // 值: 'me' | 'partner' | 'both'
    checkInDates: {},

    // 用户信息
    userInfo: null,
    partnerInfo: null,

    // 加载状态
    loading: false,
    loadingMore: false
  },

  onLoad() {
    const userInfo = storage.getUserInfo();
    const partnerInfo = storage.getPartnerInfo();
    this.setData({ userInfo, partnerInfo });
    this.initCalendar();
    this.loadCheckInDates();
    this.loadRecords(true);
  },

  onShow() {
    // 每次显示时刷新（打卡后回来能看到最新数据）
    this.loadCheckInDates();
    this.loadRecords(true);
  },

  /**
   * 初始化日历
   */
  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    this.setData({
      currentYear: year,
      currentMonth: month,
      selectedDate: this.formatDate(now)
    });
    this.generateCalendar(year, month);
  },

  /**
   * 生成日历数据
   */
  generateCalendar(year, month) {
    const dates = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekDay = firstDay.getDay();
    const today = this.formatDate(new Date());
    const { checkInDates, selectedDate } = this.data;

    // 上个月填充
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startWeekDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 2, day);
      dates.push({
        day, date: this.formatDate(date),
        isCurrentMonth: false, isToday: false,
        checkInType: null
      });
    }

    // 当前月
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = this.formatDate(date);
      dates.push({
        day, date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        checkInType: checkInDates[dateStr] || null  // 'me' | 'partner' | 'both' | null
      });
    }

    // 下个月填充
    const remainingDays = 42 - dates.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month, day);
      dates.push({
        day, date: this.formatDate(date),
        isCurrentMonth: false, isToday: false,
        checkInType: null
      });
    }

    this.setData({ calendarDates: dates });
  },

  /**
   * 加载打卡日期（同时加载我和TA的，用于日历标记）
   */
  loadCheckInDates() {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const params = { beginTime: startDate, endTime: endDate, pageNum: 1, pageSize: 100 };

    // 并行请求我和TA的打卡日期
    const myRequest = api.checkInAPI.getCheckInRecords(params);
    const partnerId = this.data.partnerInfo
      ? (this.data.partnerInfo.partnerId || this.data.partnerInfo.userId)
      : null;
    const partnerRequest = partnerId
      ? api.checkInAPI.getCheckInRecordsByUserId(partnerId, params)
      : Promise.resolve({ code: 200, rows: [] });

    Promise.all([myRequest, partnerRequest]).then(([myRes, partnerRes]) => {
      const myDates = new Set();
      const partnerDates = new Set();

      if (myRes.code === 200) {
        (myRes.rows || []).forEach(r => myDates.add(r.checkInDate));
      }
      if (partnerRes.code === 200) {
        (partnerRes.rows || []).forEach(r => partnerDates.add(r.checkInDate));
      }

      // 合并：判断每天是我/TA/双方
      const checkInDates = {};
      myDates.forEach(d => {
        checkInDates[d] = partnerDates.has(d) ? 'both' : 'me';
      });
      partnerDates.forEach(d => {
        if (!checkInDates[d]) checkInDates[d] = 'partner';
      });

      this.setData({ checkInDates }, () => {
        this.generateCalendar(year, month);
      });
    }).catch(err => {
      console.error('加载打卡日期失败:', err);
    });
  },

  /**
   * 加载打卡记录列表（合并我和TA的）
   */
  loadRecords(reset = false) {
    if (!reset && (this.data.loading || this.data.loadingMore)) return;

    if (reset) {
      this.setData({ loading: true, pageNum: 1, records: [] });
    } else {
      this.setData({ loadingMore: true });
    }

    const { filterType, selectedDate, pageNum, pageSize } = this.data;
    const params = { pageNum, pageSize };
    if (filterType) params.exerciseType = filterType;
    if (selectedDate) {
      params.beginTime = selectedDate;
      params.endTime = selectedDate;
    }

    // 同时请求我和TA的记录
    const myRequest = api.checkInAPI.getCheckInRecords(params);
    const partnerId = this.data.partnerInfo
      ? (this.data.partnerInfo.partnerId || this.data.partnerInfo.userId)
      : null;
    const partnerRequest = partnerId
      ? api.checkInAPI.getCheckInRecordsByUserId(partnerId, params)
      : Promise.resolve({ code: 200, rows: [], total: 0 });

    Promise.all([myRequest, partnerRequest]).then(([myRes, partnerRes]) => {
      const userInfo = this.data.userInfo;
      const partnerInfo = this.data.partnerInfo;

      const myRecords = (myRes.code === 200 ? myRes.rows || [] : []).map(r => ({
        ...r,
        exerciseIcon: EXERCISE_ICON_MAP[r.exerciseType] || '💪',
        isPartner: false,
        createTimeStr: this.formatTime(r.createTime)
      }));

      const partnerRecords = (partnerRes.code === 200 ? partnerRes.rows || [] : []).map(r => ({
        ...r,
        exerciseIcon: EXERCISE_ICON_MAP[r.exerciseType] || '💪',
        isPartner: true,
        createTimeStr: this.formatTime(r.createTime)
      }));

      // 合并并按日期倒序排序
      let merged = [...myRecords, ...partnerRecords];
      merged.sort((a, b) => {
        const ta = new Date(a.checkInDate + ' ' + (a.createTime || '')).getTime();
        const tb = new Date(b.checkInDate + ' ' + (b.createTime || '')).getTime();
        return tb - ta;
      });

      const total = (myRes.total || 0) + (partnerRes.total || 0);

      this.setData({
        records: reset ? merged : [...this.data.records, ...merged],
        totalRecords: total,
        hasMore: pageNum * pageSize < total,
        loading: false,
        loadingMore: false
      });
    }).catch(err => {
      console.error('加载打卡记录失败:', err);
      this.setData({ loading: false, loadingMore: false });
    });
  },

  /**
   * 上一月
   */
  onPrevMonth() {
    let { currentYear: year, currentMonth: month } = this.data;
    month -= 1;
    if (month < 1) { year -= 1; month = 12; }
    this.setData({ currentYear: year, currentMonth: month, selectedDate: '' });
    this.generateCalendar(year, month);
    this.loadCheckInDates();
    this.loadRecords(true);
  },

  /**
   * 下一月
   */
  onNextMonth() {
    let { currentYear: year, currentMonth: month } = this.data;
    month += 1;
    if (month > 12) { year += 1; month = 1; }
    this.setData({ currentYear: year, currentMonth: month, selectedDate: '' });
    this.generateCalendar(year, month);
    this.loadCheckInDates();
    this.loadRecords(true);
  },

  /**
   * 日期点击
   */
  onDateClick(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date }, () => {
      this.loadRecords(true);
    });
  },

  /**
   * 运动类型筛选
   */
  onFilterTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type });
    this.loadRecords(true);
  },

  /**
   * 加载更多
   */
  onLoadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ pageNum: this.data.pageNum + 1 });
    this.loadRecords();
  },

  /**
   * 点击记录跳转详情
   */
  onRecordTap(e) {
    const recordId = e.currentTarget.dataset.recordId;
    if (!recordId) return;
    wx.navigateTo({ url: `/pages/checkin-detail/index?recordId=${recordId}` });
  },

  /**
   * 格式化日期 YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 格式化时间 HH:mm
   */
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return '';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
