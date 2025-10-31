Page({
  data: {
    items: []
  },

  onShow: function() {
    this.fetchMyItems();
  },

  fetchMyItems: function() {
    wx.cloud.callFunction({
      name: 'itemService',
      data: {
        action: 'getItemList',
        payload: {
          // 这里可以添加 openid 来获取当前用户的物品列表
        }
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

  editItem: function(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/publish/publish?id=${itemId}`
    });
  },

  deleteItem: function(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除这个物品吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'itemService',
            data: {
              action: 'deleteItem',
              payload: {
                itemId
              }
            },
            success: res => {
              if (res.result.code === 200) {
                wx.showToast({
                  title: '删除成功'
                });
                this.fetchMyItems();
              } else {
                wx.showToast({
                  title: res.result.message || '删除失败',
                  icon: 'none'
                });
              }
            },
            fail: err => {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
});