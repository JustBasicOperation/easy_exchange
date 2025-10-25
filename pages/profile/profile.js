// profile.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    isLoggedIn: false,
    openid: ''
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function() {
    if (app.globalData.isLoggedIn) {
      this.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo,
        openid: app.globalData.openid
      });
    } else {
      // 尝试从本地存储获取
      const userInfo = wx.getStorageSync('userInfo');
      const openid = wx.getStorageSync('openid');
      if (userInfo && openid) {
        app.globalData.userInfo = userInfo;
        app.globalData.openid = openid;
        app.globalData.isLoggedIn = true;
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo,
          openid: openid
        });
      }
    }
  },

  // 获取用户信息
  onGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      // 用户同意授权
      const userInfo = e.detail.userInfo;
      
      // 调用云函数登录
      wx.showLoading({
        title: '登录中...',
      });
      
      app.userLogin(res => {
        // 保存用户信息
        app.globalData.userInfo = userInfo;
        app.globalData.isLoggedIn = true;
        
        // 存储到本地
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo,
          openid: res.openid
        });
        
        // 调用云函数保存/更新用户信息到数据库
        wx.cloud.callFunction({
          name: 'saveUserInfo',
          data: {
            userInfo: userInfo
          },
          success: res => {
            console.log('保存用户信息成功', res);
          },
          fail: err => {
            console.error('保存用户信息失败', err);
          },
          complete: () => {
            wx.hideLoading();
          }
        });
      });
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '需要授权才能使用完整功能',
        icon: 'none'
      });
    }
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');
          
          // 清除全局数据
          app.globalData.userInfo = null;
          app.globalData.isLoggedIn = false;
          app.globalData.openid = '';
          
          // 更新页面状态
          this.setData({
            isLoggedIn: false,
            userInfo: {},
            openid: ''
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 页面导航
  navigateTo: function(e) {
    const url = e.currentTarget.dataset.url;
    
    // 检查是否需要登录
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: url
    });
  }
});