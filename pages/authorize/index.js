//index.js
//获取应用实例
Page({
  data: {
  },
  onLoad: function (opt) {
  },
  //微信授权登录
  onGotUserInfo: function (e) {
    wx.navigateBack();
  },
  //拒绝
  goBack: function (e) {
    wx.navigateBack();
  },

})
