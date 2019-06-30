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
    orderList: [],
    gray:'提醒发货',
    pay_type: 1,      // 微信支付
    pay_total: 99999, //预防出错
    order_type: 1     //
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
        // 修饰数据
        res.data.forEach(function(item,index) {
          let num = 0;
          for(let i = 0; i < item.goods.length; i++) {
            num += item.goods[i].amount;
          }
          item.goods_allNum = num;
        });
        that.setData({
          orderList: res.data,
          hiddenLoading: true,
        });
      }
    })
  },

  // //去付款 舍弃跳页面
  // goPay: function (e) { 
  //   app.redirect('order/pay', 'sn=' + e.currentTarget.dataset.sn);
  // },
  //立即支付
  goPay: function (e) {
    var that = this;
    let order_sn = e.currentTarget.dataset.sn;
    let total = e.currentTarget.dataset.pay_price;
    console.log(e)
    if (that.data.pay_type == 1) {//微信支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/wx_pay',
        data: { order_no: order_sn, open_id: app.globalData.openID, total: total || that.data.pay_total, uid: app.globalData.userID, order_type: that.data.order_type },
        method: 'GET',
        header: {},
        success: function (res) {
          //更新订单formID
          if (that.data.order_type == 1) {
            var form_id = res.data.package.replace('prepay_id=', '');
            wx.request({
              url: rootDocment + '/api/com_get/updateFormID',
              data: { sn: that.data.order_sn, prepay_id: form_id },
              method: 'GET',
              header: {},
              success: function (res) {
              }
            })
          }

          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function (res) {
              if (that.data.order_type == 1) {
                app.redirect('user/myorder', 'type=');
              }
              else {
                app.gotaburl('user/index');
              }
            },
            'fail': function (res) {
              console.log(res);
            }
          })

        }
      })
    }
    else {//余额支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/balance_pay',
        data: { sn: that.data.order_sn, user_id: app.globalData.userID },
        method: 'POST',
        header: {},
        success: function (res) {
          if (res.data.code == '1001') {
            app.redirect('user/myorder', 'type=');
          }
          else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          }
        }
      })
    }
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
              app.gourl('user/myorder', 'type=' + that.data.order_type);
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
              app.gourl('user/myorder', 'type=3');
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
              app.gourl('user/myorder', 'type=' + that.data.order_type);
            }
          })
        }
      }
    })
  },

  tixingHandle() {
    var that = this;
    that.setData({
      gray:'已提醒',
    })
  },

})