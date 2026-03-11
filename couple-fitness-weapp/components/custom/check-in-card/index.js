/**
 * 打卡记录卡片组件
 */
Component({
  properties: {
    // 打卡记录数据
    record: {
      type: Object,
      value: {}
    }
  },

  data: {
  },

  methods: {
    /**
     * 点击卡片
     */
    onCardTap() {
      // 触发父组件事件，传递记录ID
      this.triggerEvent('cardtap', {
        recordId: this.properties.record.recordId
      });
    },

    /**
     * 点赞状态变化
     */
    onLikeChange(e) {
      const { recordId, isLiked, likeCount } = e.detail;
      // 向上传递事件
      this.triggerEvent('likechange', { recordId, isLiked, likeCount });
    },

    /**
     * 点击评论
     */
    onComment(e) {
      const { recordId } = e.detail;
      // 向上传递事件
      this.triggerEvent('comment', { recordId });
    },

    /**
     * 互动更新事件
     */
    onInteractionUpdate(e) {
      const { type, recordId } = e.detail;
      // 向上传递事件到页面
      this.triggerEvent('interactionupdate', { type, recordId });
    }
  }
});
