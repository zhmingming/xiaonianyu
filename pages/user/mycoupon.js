// pages/user/mycoupon.js
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenLoading: false,
    dataType: 0,
    dataList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.getList();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (opt) {
    //用户授权登录
    app.login();
    var that = this;
    that.getList();
  },

  //切换
  changeType: function (e) {
    var that = this;
    var otype = e.currentTarget.dataset.type
    that.setData({
      dataType: otype,
      dataList: []
    });
    that.getList();
  },

  //获取列表
  getList: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['state'] = that.data.dataType;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_coupon',
      data: { state: paraArr['state'], user_id: paraArr['user_id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          dataList: res.data,
          hiddenLoading: true
        });
      }
    })
  },

  //点击优惠券
  hitCoupon: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id
    if (that.data.dataType == 0){ //去使用
      app.gotaburl('index/index');
    }
    if (that.data.dataType == 1){  //领取
      var paraArr = new Array();
      paraArr['m_id'] = id;
      paraArr['user_id'] = app.globalData.userID;
      var sign = app.signature(paraArr);
      wx.request({
        url: rootDocment + '/api_coupon',
        data: { m_id: id, user_id: paraArr['user_id'], sign: sign },
        method: 'POST',
        header: {},
        success: function (res) {
          if (res.data.code == 1001){
            that.setData({
              dataType: 0
            });
            app.redirect('user/mycoupon');
          }
          else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }
      })
    }
  },

})