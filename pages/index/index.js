// index.js
const app = getApp();

Page({
  data: {
    banners: [],
    categories: [],
    recommendItems: [],
    newItems: [],
    isLoading: false,
    loadNoMore: false,
    page: 1,
    pageSize: 10
  },

  onLoad: function() {
    this.loadBanners();
    this.loadCategories();
    this.loadRecommendItems();
    this.loadNewItems();
  },

  onPullDownRefresh: function() {
    this.setData({
      recommendItems: [],
      newItems: [],
      page: 1,
      loadNoMore: false
    });
    this.loadBanners();
    this.loadCategories();
    this.loadRecommendItems();
    this.loadNewItems();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
    if (!this.data.loadNoMore) {
      this.loadMoreItems();
    }
  },

  // 加载轮播图数据
  loadBanners: function() {
    const that = this;
    wx.cloud.callFunction({
      name: 'getBanners',
      success: res => {
        that.setData({
          banners: res.result.data
        });
      },
      fail: err => {
        console.error('获取轮播图失败', err);
        // 使用默认数据
        that.setData({
          banners: [
            {
              id: 1,
              imageUrl: '../../images/banner/banner1.jpg'
            },
            {
              id: 2,
              imageUrl: '../../images/banner/banner2.jpg'
            },
            {
              id: 3,
              imageUrl: '../../images/banner/banner3.jpg'
            }
          ]
        });
      }
    });
  },

  // 加载分类数据
  loadCategories: function() {
    const that = this;
    wx.cloud.callFunction({
      name: 'getCategories',
      success: res => {
        that.setData({
          categories: res.result.data
        });
      },
      fail: err => {
        console.error('获取分类失败', err);
        // 使用默认数据
        that.setData({
          categories: [
            {
              id: 1,
              name: '电子产品',
              icon: '../../images/category/electronics.png'
            },
            {
              id: 2,
              name: '书籍教材',
              icon: '../../images/category/books.png'
            },
            {
              id: 3,
              name: '家居用品',
              icon: '../../images/category/furniture.png'
            },
            {
              id: 4,
              name: '服装鞋帽',
              icon: '../../images/category/clothing.png'
            },
            {
              id: 5,
              name: '运动户外',
              icon: '../../images/category/sports.png'
            },
            {
              id: 6,
              name: '美妆护肤',
              icon: '../../images/category/beauty.png'
            },
            {
              id: 7,
              name: '票券卡券',
              icon: '../../images/category/tickets.png'
            },
            {
              id: 8,
              name: '其他物品',
              icon: '../../images/category/others.png'
            }
          ]
        });
      }
    });
  },

  // 加载推荐商品
  loadRecommendItems: function() {
    const that = this;
    that.setData({
      isLoading: true
    });

    wx.cloud.callFunction({
      name: 'getItems',
      data: {
        type: 'recommend',
        limit: 6
      },
      success: res => {
        that.setData({
          recommendItems: res.result.data,
          isLoading: false
        });
      },
      fail: err => {
        console.error('获取推荐商品失败', err);
        that.setData({
          isLoading: false
        });
      }
    });
  },

  // 加载最新商品
  loadNewItems: function() {
    const that = this;
    that.setData({
      isLoading: true
    });

    wx.cloud.callFunction({
      name: 'getItems',
      data: {
        type: 'new',
        page: that.data.page,
        pageSize: that.data.pageSize
      },
      success: res => {
        const newData = res.result.data;
        if (newData.length < that.data.pageSize) {
          that.setData({
            loadNoMore: true
          });
        }
        that.setData({
          newItems: that.data.page === 1 ? newData : that.data.newItems.concat(newData),
          isLoading: false,
          page: that.data.page + 1
        });
      },
      fail: err => {
        console.error('获取最新商品失败', err);
        that.setData({
          isLoading: false
        });
      }
    });
  },

  // 加载更多商品
  loadMoreItems: function() {
    this.loadNewItems();
  },

  // 跳转到搜索页
  goToSearch: function() {
    wx.navigateTo({
      url: '../search/search'
    });
  },

  // 跳转到商品详情页
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + id
    });
  },

  // 跳转到分类页
  navigateToCategory: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.switchTab({
      url: '../category/category',
      success: function() {
        // 传递参数到分类页
        const categoryPage = getCurrentPages().pop();
        if (categoryPage) {
          categoryPage.setData({
            selectedCategoryId: id
          });
          categoryPage.loadCategoryItems(id);
        }
      }
    });
  },

  // 查看更多
  viewMore: function(e) {
    const type = e.currentTarget.dataset.type;
    wx.switchTab({
      url: '../category/category',
      success: function() {
        // 传递参数到分类页
        const categoryPage = getCurrentPages().pop();
        if (categoryPage) {
          categoryPage.setData({
            viewType: type
          });
          if (type === 'recommend') {
            categoryPage.loadRecommendItems();
          } else if (type === 'new') {
            categoryPage.loadNewItems();
          }
        }
      }
    });
  },

  // 轮播图点击
  onBannerTap: function(e) {
    const id = e.currentTarget.dataset.id;
    // 根据banner配置跳转到不同页面
    wx.navigateTo({
      url: '../detail/detail?id=' + id
    });
  }
});