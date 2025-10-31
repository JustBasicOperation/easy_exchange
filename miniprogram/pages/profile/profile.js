// profile.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    isLoggedIn: false, 
    openid: '',
    // 个人资料字段
    userProfile: {
      realName: '',
      contactNumber: '',
      school: '',
      city: ''
    },
    showProfileForm: false
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    this.checkLoginStatus();
    // 如果已登录，获取用户详细资料
    if (this.data.isLoggedIn) {
      this.getUserProfile();
    }
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

  // 获取用户信息 - 使用新版微信登录API
  handleUserLogin: function() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        console.log(res)
        
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
          
          // 获取用户详细资料
          this.getUserProfile();
          
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
      },
      fail: (err) => {
        // 用户拒绝授权
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取用户详细资料
  getUserProfile: function() {
    wx.cloud.callFunction({
      name: 'getUserProfile',
      data: {
        openid: this.data.openid
      },
      success: res => {
        if (res.result && res.result.data) {
          this.setData({
            userProfile: res.result.data
          });
        }
      },
      fail: err => {
        console.error('获取用户资料失败', err);
      }
    });
  },

  // 显示编辑个人资料表单
  showEditProfile: function() {
    this.setData({
      showProfileForm: true
    });
  },

  // 隐藏编辑个人资料表单
  hideEditProfile: function() {
    this.setData({
      showProfileForm: false
    });
  },

  // 输入框内容变化处理
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`userProfile.${field}`]: value
    });
  },

  // 保存个人资料
  saveProfile: function() {
    wx.showLoading({
      title: '保存中...',
    });
    
    wx.cloud.callFunction({
      name: 'saveUserInfo',
      data: {
        userProfile: this.data.userProfile
      },
      success: res => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        this.hideEditProfile();
      },
      fail: err => {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
        console.error('保存用户资料失败', err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 页面跳转
  navigateTo: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
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