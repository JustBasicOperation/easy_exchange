Page({
  data: {
    categories: ['书籍', '电子产品', '家具', '生活用品', '其他'],
    categoryIndex: 0,
    images: []
  },

  bindCategoryChange: function(e) {
    this.setData({
      categoryIndex: e.detail.value
    });
  },

  chooseImage: function() {
    const that = this;
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          images: that.data.images.concat(res.tempFilePaths)
        });
      }
    });
  },

  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({
      images: images
    });
  },

  submitForm: function(e) {
    console.log("call submitForm");
    const formData = e.detail.value;
    const { title, description, price, originalPrice } = formData;
    const category = this.data.categories[this.data.categoryIndex];
    const images = this.data.images;

    if (!title || !description || !price) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发布中...'
    });

    const uploadTasks = images.map(image => this.uploadFile(image));

    Promise.all(uploadTasks).then(res => {
      console.log("uploadFile success");
      const uploadedImages = res.map(r => r.fileID);
      wx.cloud.callFunction({
        name: 'itemService',
        data: {
          action: 'publishItem',
          payload: {
            title,
            description,
            category,
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            images: uploadedImages
          }
        },
        success: res => {
          wx.hideLoading();
          if (res.result.code === 200) {
            wx.showToast({
              title: '发布成功'
            });
            wx.navigateBack();
          } else {
            wx.showToast({
              title: res.result.message || '发布失败',
              icon: 'none'
            });
          }
        },
        fail: err => {
          wx.hideLoading();
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          });
        }
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '图片上传失败',
        icon: 'none'
      });
    });
  },

  uploadFile: function(filePath) {
    console.log("call uploadFile");
    const cloudPath = `item/images/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}`;
    return wx.cloud.uploadFile({
      cloudPath,
      filePath
    });
  }
});