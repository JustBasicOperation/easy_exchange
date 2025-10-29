// app.js
App({
  onLaunch: function() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        // 此处请填入环境 ID, 环境 ID 可打开云控制台查看
        env: 'cloud1-9gqjb1zrd639b9cc',
        traceUser: true,
      });
    }

    // 获取用户信息
    this.globalData = {
      userInfo: null,
      isLoggedIn: false,
      openid: '',
      unionid: ''
    };

    // 检查用户登录状态
    this.checkLoginStatus();
  },

  // 检查用户登录状态
  checkLoginStatus: function() {
    const that = this;
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    if (userInfo && openid) {
      that.globalData.userInfo = userInfo;
      that.globalData.openid = openid;
      that.globalData.isLoggedIn = true;
    }
  },

  // 用户登录方法
  userLogin: function(callback) {
    const that = this;
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        that.globalData.openid = res.result.openid;
        that.globalData.unionid = res.result.unionid || '';
        wx.setStorageSync('openid', res.result.openid);
        if (callback) {
          callback(res.result);
        }
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err);
      }
    });
  }
});