/**
 * 日历页面
 */

const api = require('../../utils/api');
const dateUtil = require('../../utils/date');

Page({
  data: {
    // 日历数据
    currentYear: 2024,
    currentMonth: 1,
    calendarDates: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    selectedDate: '',
    
    // 筛选条件
    filterType: '', // 运动类型筛选
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
    
    // 打卡日期集合（用于标记）
    checkInDates: new Set(),
    
    // 加载状态
    loading: false,
    loadingMore: false
  },
  
  onLoad() {
    console.log('日历页面加载');
    this.initCalendar();
    this.loadCheckInDates();
    this.loadRecords();
  },
  
  onShow() {
    console.log('日历页面显示');
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
    
    // 上个月的日期填充
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startWeekDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 2, day);
      dates.push({
        day: day,
        date: this.formatDate(date),
        isCurrentMonth: false,
        isToday: false,
        hasCheckIn: false
      });
    }
    
    // 当前月的日期
    const today = this.formatDate(new Date());
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = this.formatDate(date);
      dates.push({
        day: day,
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        hasCheckIn: this.data.checkInDates.has(dateStr)
      });
    }
    
    // 下个月的日期填充
    const remainingDays = 42 - dates.length; // 6行 x 7列
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month, day);
      dates.push({
        day: day,
        date: this.formatDate(date),
        isCurrentMonth: false,
        isToday: false,
        hasCheckIn: false
      });
    }
    
    this.setData({
      calendarDates: dates
    });
  },
  
  /**
   * 加载打卡日期（用于标记）
   */
  loadCheckInDates() {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    api.checkInAPI.getCheckInRecords({
      startDate: startDate,
      endDate: endDate,
      pageNum: 1,
      pageSize: 100
    }).then(res => {
      if (res.code === 200 && res.data && res.data.records) {
        const dates = new Set();
        res.data.records.forEach(record => {
          dates.add(record.checkInDate);
        });
        
        this.setData({
          checkInDates: dates
        });
        
        // 重新生成日历以更新标记
        this.generateCalendar(year, month);
      }
    }).catch(err => {
      console.error('加载打卡日期失败:', err);
    });
  },
  
  /**
   * 加载打卡记录
   */
  loadRecords(reset = false) {
    if (this.data.loading || this.data.loadingMore) {
      return;
    }
    
    if (reset) {
      this.setData({
        loading: true,
        pageNum: 1,
        records: []
      });
    } else {
      this.setData({
        loadingMore: true
      });
    }
    
    const params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };
    
    // 添加筛选条件
    if (this.data.filterType) {
      params.exerciseType = this.data.filterType;
    }
    
    // 如果选择了日期，只查询该日期的记录
    if (this.data.selectedDate) {
      params.startDate = this.data.selectedDate;
      params.endDate = this.data.selectedDate;
    }
    
    api.checkInAPI.getCheckInRecords(params).then(res => {
      if (res.code === 200 && res.data) {
        const records = res.data.records || [];
        const total = res.data.total || 0;
        
        // 格式化记录数据
        const formattedRecords = records.map(record => {
          const date = new Date(record.checkInDate);
          return {
            ...record,
            dayOfMonth: date.getDate(),
            monthYear: `${date.getMonth() + 1}月`,
            createTime: this.formatTime(record.createTime)
          };
        });
        
        this.setData({
          records: reset ? formattedRecords : [...this.data.records, ...formattedRecords],
          totalRecords: total,
          hasMore: this.data.pageNum * this.data.pageSize < total,
          loading: false,
          loadingMore: false
        });
      }
    }).catch(err => {
      console.error('加载打卡记录失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({
        loading: false,
        loadingMore: false
      });
    });
  },
  
  /**
   * 上一月
   */
  onPrevMonth() {
    let year = this.data.currentYear;
    let month = this.data.currentMonth - 1;
    
    if (month < 1) {
      year -= 1;
      month = 12;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month,
      selectedDate: ''
    });
    
    this.generateCalendar(year, month);
    this.loadCheckInDates();
    this.loadRecords(true);
  },
  
  /**
   * 下一月
   */
  onNextMonth() {
    let year = this.data.currentYear;
    let month = this.data.currentMonth + 1;
    
    if (month > 12) {
      year += 1;
      month = 1;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month,
      selectedDate: ''
    });
    
    this.generateCalendar(year, month);
    this.loadCheckInDates();
    this.loadRecords(true);
  },
  
  /**
   * 日期点击
   */
  onDateClick(e) {
    const date = e.currentTarget.dataset.date;
    const hasCheckIn = e.currentTarget.dataset.hasCheckin;
    
    this.setData({
      selectedDate: date
    });
    
    // 重新加载该日期的记录
    this.loadRecords(true);
  },
  
  /**
   * 运动类型筛选
   */
  onFilterTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      filterType: type
    });
    
    this.loadRecords(true);
  },
  
  /**
   * 重置筛选
   */
  onResetFilter() {
    this.setData({
      filterType: '',
      selectedDate: ''
    });
    
    this.loadRecords(true);
  },
  
  /**
   * 加载更多
   */
  onLoadMore() {
    if (!this.data.hasMore || this.data.loadingMore) {
      return;
    }
    
    this.setData({
      pageNum: this.data.pageNum + 1
    });
    
    this.loadRecords();
  },
  
  /**
   * 预览图片
   */
  onPreviewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url],
      current: url
    });
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
   * 格式化时间
   */
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const date = new Date(timeStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
});