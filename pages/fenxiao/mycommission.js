// pages/fenxiao/mycommission.js
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenLoading: false,
    commission: 0,
    mini_cash: 0,
    dataList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
    var that = this;
    that.getData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData();
    wx.stopPullDownRefresh();
  },

  /**
   * 获取数据
   */
  getData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    paraArr['type'] = 'commission';
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getPayLog',
      data: { user_id: paraArr['user_id'], type: paraArr['type'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          dataList: res.data.list,
          commission: res.data.money,
          mini_cash: res.data.mini_cash,
          hiddenLoading: true
        });
      }
    })

  },

  /**
   * 提现
   */
  cash: function () {
    var that = this;
    if (parseFloat(that.data.commission)>0) {
        if (parseFloat(that.data.commission) < parseFloat(that.data.mini_cash)){
          wx.showToast({
            title: '最低提现额为 ' + that.data.mini_cash + ' 元',
            icon: 'none'
          })
        }
        else {

        }
    }
    else {
      wx.showToast({
        title: '还没有佣金可提现',
        icon: 'none'
      })
    }
  }

})