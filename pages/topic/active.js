// pages/topic/active.js
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList:[],
    scrollHeight:0,
    page:1,
    lastPage:0,
  },
  // 初始化商品列表
  loadList() {
    var that = this;
    var paraArr = new Array();
    var id = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getNewGoodsList/',
      data: { 
        size:10,
        index:0,
        user_id:id,
        page: that.data.page,
        sign: sign,
        },
      method: 'GET',
      header: {},
      success: function (res) {
        let arr = [...res.data.new_goods_list.data];
        let list = that.data.goodsList;
        
        arr.forEach(function(item,index) {
          list.push(item);
        });
        that.setData({
          goodsList: list,
        });
        if(that.data.page <= 1) {
          that.setData({
            lastPage: res.data.new_goods_list.last_page
          })
        }
      }
    })
  },

  //滚动到底部触发事件  
  showScrollLower: function () {
    var that = this;

    let page = that.data.page;
    if(page < that.data.lastPage) {
      page++;
      that.setData({
        page: page
      });
      that.loadList();
    }
  },

  // 获取滚动条当前位置
  scrolltoupper: function (e) {
    if (e.detail.scrollTop > 100) {
      this.setData({
        hiddenTop: false
      });
    } else {
      this.setData({
        hiddenTop: true
      });
    }
  },

  // 自定义分享事件
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '好货不贵，小年鱼邀你一起耍大牌，新人优惠，直降500，仅限首单！',
      imageUrl: 'https://img.xiaonianyu.com/1563330683su.png',
      path: '/pages/index/index?isActive=true',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.loadList();
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // this.loadList();
    // wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})