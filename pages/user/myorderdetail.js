// pages/user/myorderdetail.js
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: [],
    currentID: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setDetailData(options.id);
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    this.setDetailData(that.data.currentID);
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (opt) {
    //用户授权登录
    app.login();
  },

  //初始化详情
  setDetailData: function (id) {
    var that = this;
    var paraArr = new Array();
    paraArr['id'] = id;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_order/' + id,
      data: { user_id: paraArr['user_id'], sign: sign},
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          detail: res.data,
          currentID: id
        });
      }
    })
  },

  //去付款
  goPay: function (e) {
    app.redirect('order/pay', 'sn=' + e.currentTarget.dataset.sn);
  },

  //去评价
  goComment: function (e) {
    app.redirect('user/mycomment', 'id=' + e.currentTarget.dataset.id);
  },

  //取消订单
  cancelOrder: function (e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    var paraArr = new Array();
    paraArr['id'] = m_id;
    paraArr['m_type'] = 'cancel';
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要取消吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_order/' + m_id,
            data: { m_type: 'cancel', user_id: paraArr['user_id'], sign: sign },
            method: 'PUT',
            header: {},
            success: function (res) {
              app.redirect('user/myorder', 'type=0');
            }
          })
        }
      }
    })
  },

  //确认收货
  shOrder: function (e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    var paraArr = new Array();
    paraArr['id'] = m_id;
    paraArr['m_type'] = 'sh';
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要收货吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_order/' + m_id,
            data: { m_type: 'sh', user_id: paraArr['user_id'], sign: sign },
            method: 'PUT',
            header: {},
            success: function (res) {
              app.redirect('user/myorder', 'type=3');
            }
          })
        }
      }
    })
  },

  //查看物流
  showSend: function (e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    wx.request({
      url: rootDocment + '/api/com_get/getSend',
      data: { order_id: m_id },
      method: 'GET',
      header: {},
      success: function (res) {
        wx.showModal({
          title: res.data.sendType,
          content: res.data.sendNo,
          showCancel: false,
          success: function (res) {
          }
        })
      }
    })
  },

  //删除订单
  delOrder: function (e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    var paraArr = new Array();
    paraArr['id'] = m_id;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要删除吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_order/' + m_id,
            data: { user_id: paraArr['user_id'], sign: sign },
            method: 'DELETE',
            header: {},
            success: function (res) {
              app.redirect('user/myorder', 'type=-1');
            }
          })
        }
      }
    })
  },

  //退换货
  toReturns: function (e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id;
    app.redirect('user/returns', 'id=' + m_id);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

})