// pages/user/myorder.js
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenLoading: false,
    order_type: -1,
    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.type!=''){
      that.setData({
        order_type: options.type
      });
    }
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.getOrder();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (opt) {
    //用户授权登录
    app.login();
    var that = this;
    that.getOrder();
  },

  //切换订单
  changeOrder: function (e) {
    var that = this;
    var otype = e.currentTarget.dataset.type
    that.setData({
      order_type: otype
    });
    that.getOrder();
  },

  //获取订单列表
  getOrder: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['state'] = that.data.order_type;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_order',
      data: { state: paraArr['state'], user_id: paraArr['user_id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          orderList: res.data,
          hiddenLoading: true
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
              app.redirect('user/myorder', 'type=' + that.data.order_type);
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
              app.redirect('user/myorder', 'type=' + that.data.order_type);
            }
          })
        }
      }
    })
  },

})