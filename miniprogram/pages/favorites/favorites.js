Page({
  data: {
    items: []
  },

  onShow: function() {
    this.getFavoriteList();
  },

  getFavoriteList: function() {
    wx.cloud.callFunction({
      name: 'itemService',
      data: {
        action: 'getFavoriteList'
      },
      success: res => {
        if (res.result.code === 200) {
          this.setData({
            items: res.result.data.list
          });
        } else {
          wx.showToast({
            title: res.result.message || '加载失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  navigateToDetail: function(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${itemId}`
    });
  }
});