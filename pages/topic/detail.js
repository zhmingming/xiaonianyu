// pages/goods/detail.js
var WxParse = require('../../utils/wxParse/wxParse.js');
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenLoading: false,
    detail: [],
    imgUrls: [],
    goodsList: [],
    currentID: '',
    hiddenTop: true,
    is_lod: false,
    currentTabsIndex : 0,
    id:"id",
    sales:"desc",
    goods_ids: "",
    type: "zh",
    is_sj: false,
    is_new_r: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.setDetailData(options.id);
    console.log(options.id)
    if (options.id == 8){
      this.setData({
        is_new_r: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    this.setDetailData(that.data.currentID);
    wx.stopPullDownRefresh();
  },

  //初始化详情
  setDetailData: function (id) {
    var that = this;
    var paraArr = new Array();
    paraArr['id'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_topic/'+id,
      data: { sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        WxParse.wxParse('article', 'html', res.data.info, that, 5);
        console.log(res)
        if (res.data.hasOwnProperty("slide")){
          that.setData({
            detail: res.data,        
            imgUrls: res.data.slide.split(","),
            currentID: id,
            goods_ids: res.data.goods_ids
          });
        }else{
          that.setData({
            imgUrls: "",
            goods_ids: res.data.goods_ids
          });
        }
        
        wx.setNavigationBarTitle({
          title: res.data.title,
        });
        that.setCountDown();
        console.log(that.data.id);
        that.setGoodsData(res.data.goods_ids, that.data.id, that.data.sales);
      }
    })
  },

  //初始化专题商品
  setGoodsData: function (ids, id, sales) {
    var that = this;
    var paraArr = new Array();
    paraArr['ids'] = ids;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getTopicGoods',
      data: { ids: ids, sign: sign, order: id, order_type: sales},
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          goodsList: res.data,
          hiddenLoading: true,
        });
        if (that.data.hiddenLoading == false) {
          that.setData({
            is_lod: false
          })
        }
        if (res.data.length < 1){
          that.setData({
            is_lod: true
          })
        }
       
      }
    })
  },
  //点击商品
  showGoodsDetial: function (e) {
    var id = e.currentTarget.dataset.id
    if (!id) return;
    app.redirect('goods/detail', 'id=' + id)
  },

  // 获取滚动条当前位置
  onPageScroll: function (e) {
    var that = this;
    if (e.scrollTop > 100) {
      that.setData({
        hiddenTop: false
      });
    } else {
      that.setData({
        hiddenTop: true
      });
    }
  },

  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  // 倒计时
  setCountDown: function () {
    let time = 1000;
    var that = this;
    var t_edate = '';
    var t_tamp = 0;
    var n_tamp = parseInt(new Date().getTime());    // 当前时间戳
    var m_detail = that.data.detail;
    if (!m_detail.pic){
      return;
    }
    t_edate = m_detail['e_date'];
    // console.log(t_edate)
    t_edate = t_edate.substring(0, 19);
    t_edate = t_edate.replace(/-/g, '/');
    t_tamp = parseInt(new Date(t_edate).getTime());
    if (n_tamp > t_tamp) {
     // topicList.splice(i, 1); //移除了
    }
    else {
      let formatTime = that.getFormat(t_tamp - n_tamp);
      m_detail['countDD'] = `${formatTime.dd}`;
      m_detail['countHH'] = `${formatTime.hh}`;
      m_detail['countMM'] = `${formatTime.mm}`;
      m_detail['countSS'] = `${formatTime.ss}`;
      that.setData({
        detail: m_detail
      });
      setTimeout(that.setCountDown, time);
    }
  },

  //格式化时间
  getFormat: function (msec) {
    let ss = parseInt(msec / 1000);
    let ms = parseInt(msec % 1000);
    let mm = 0;
    let hh = 0;
    let dd = 0;
    if (ss > 60) {
      mm = parseInt(ss / 60);
      ss = parseInt(ss % 60);
      if (mm > 60) {
        hh = parseInt(mm / 60);
        mm = parseInt(mm % 60);
        if (hh > 24) {
          dd = parseInt(hh / 24);
          hh = parseInt(hh % 24);
        }
      }
    }
    ss = ss > 9 ? ss : `0${ss}`;
    mm = mm > 9 ? mm : `0${mm}`;
    hh = hh > 9 ? hh : `0${hh}`;
    return { ms, ss, mm, hh, dd };
  },

  // 标签切换
  tabsWitch: function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    if (type == that.data.type && index != 2){
      return;
    }
    switch(type){
      case "zh":
        that.setData({
          id: "id",
          sales: "desc"
        });
        break;
      case "xl":
        that.setData({
          id: "sales",
          sales: "desc"
        });
        break;
      case "jg":
        if (that.data.is_sj){
          that.setData({
            id: "promotion_price",
            sales: "asc"
          });
        }
        else{
          that.setData({
            id: "promotion_price",
            sales: "desc"
          });
        }
        that.setData({
          is_sj : !that.data.is_sj
        })
        break;
      default:

    }
    that.setData({
      currentTabsIndex: index,
      type: type
    });
    console.log(that.data.goods_ids);
    that.setGoodsData(that.data.goods_ids, that.data.id, that.data.sales);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})