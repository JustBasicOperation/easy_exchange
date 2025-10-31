const app = getApp();

Page({
  data: {
    item: null,
    isFavorited: false,
    itemId: null
  },

  onLoad: function(options) {
    this.setData({ itemId: options.id });
    this.getItemDetail();
  },

  getItemDetail: function() {
    wx.cloud.callFunction({
      name: 'itemService',
      data: {
        action: 'getItemDetail',
        payload: {
          itemId: this.data.itemId
        }
      },
      success: res => {
        if (res.result.code === 200) {
          this.setData({
            item: res.result.data
          });
          this.checkIfFavorited();
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

  toggleFavorite: function() {
    wx.cloud.callFunction({
      name: 'itemService',
      data: {
        action: 'toggleFavorite',
        payload: {
          itemId: this.data.itemId
        }
      },
      success: res => {
        if (res.result.code === 200) {
          this.setData({
            isFavorited: res.result.data.isFavorited
          });
          wx.showToast({
            title: res.result.message
          });
        } else {
          wx.showToast({
            title: res.result.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },

  checkIfFavorited: function() {
    // 在实际应用中，您需要一个方法来检查当前用户是否已收藏该商品。
    // 这里我们暂时假设未收藏。
    this.setData({ isFavorited: false });
  }
});