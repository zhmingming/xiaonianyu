//index.js
//获取应用实例
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({
  data: {
    imgPath: rootDocment + '/upload/pic/',
    hiddenLoading: false,
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    topicList: [],
    newGoodsList: [],
    hotGoodsList: [],
    inputShowed: false,
    inputVal: "",
    fid: 0,
    catList: [],
    hiddenTop: true,
    tabSelect: true
  },
  onLoad: function (opt) {
    var that = this;
    //获取分销ID
    if (opt.scene) {
      var scene = decodeURIComponent(opt.scene);
      that.setData({
        fid: scene
      });
    }
    //初始化
    this.setCategoryData();
    that.setSlideData();
    that.setNewGoodsData();
    that.setTopicData();
    that.setHotGoodsData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    var that = this;
    app.login(that.data.fid);
  },
  
  //下拉刷新
  onPullDownRefresh: function () {
    this.setCategoryData();
    this.setSlideData();
    this.setNewGoodsData();
    this.setTopicData();
    this.setHotGoodsData();
    wx.stopPullDownRefresh();
  },

  //初始化分类
  setCategoryData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['pid'] = 0;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_goods_category',
      data: { pid: paraArr['pid'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log('11111'+ res.data)
        that.setData({
          catList: res.data
        });
      }
    })
  },

  //初始化幻灯片
  setSlideData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = "5";
    paraArr['stype'] = "3";
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_ads',
      data: { size: paraArr['size'], stype: paraArr['stype'], sign: sign},
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          imgUrls: res.data.data
        });
      }
    })
  },

  //初始化新人专享
  setNewGoodsData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = "3";
    paraArr['is_new'] = "1";
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getFlashGoods',
      data: { size: paraArr['size'], is_new: paraArr['is_new'], sign: sign},
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          newGoodsList: res.data.data
        });
      }
    })
  },

  //初始化专题
  setTopicData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = "20";
    paraArr['stype'] = "index";
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_topic',
      data: { stype: paraArr['stype'], size: paraArr['size'], sign: sign},
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          topicList: res.data.data
        });
      }
    })
    that.setCountDown();
  },

  //初始化限时抢购
  setHotGoodsData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = 6;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getFlashGoods',
      data: { size: paraArr['size'],sign: sign},
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          hotGoodsList: res.data.data,
          hiddenLoading: true
        });
      }
    })
  },
  
  //点击幻灯片
  showSlide: function (e) {
    var url = e.currentTarget.dataset.url
    if (!url || url=='#') return;
    app.redirect(url);
  },

  //点击导航
  goCategory: function (e) {
    var id = e.currentTarget.dataset.id
    app.redirect('category/index?id='+id);
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

  // tab切换
  tabSwitch: function (e) {
    var that = this;
    that.setData({
      tabSelect: !that.data.tabSelect
    });
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
    var topicList = that.data.topicList;
    for (var i = 0; i < topicList.length; i++) {
      t_edate = topicList[i]['e_date'];
      t_edate = t_edate.substring(0, 19);
      t_edate = t_edate.replace(/-/g, '/');
      t_tamp = parseInt(new Date(t_edate).getTime());
      if (n_tamp > t_tamp) {
        topicList.splice(i, 1); //移除了
      }
      else {
        let formatTime = that.getFormat(t_tamp - n_tamp);
        topicList[i]['countDD'] = `${formatTime.dd}`;
        topicList[i]['countHH'] = `${formatTime.hh}`;
        topicList[i]['countMM'] = `${formatTime.mm}`;
        topicList[i]['countSS'] = `${formatTime.ss}`;
      }
    }
    that.setData({
      topicList: topicList
    });
    setTimeout(that.setCountDown, time);
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
      }
    }
    ss = ss > 9 ? ss : `0${ss}`;
    mm = mm > 9 ? mm : `0${mm}`;
    hh = hh > 9 ? hh : `0${hh}`;
    return { ms, ss, mm, hh, dd };
  },

  //去搜索
  toSearch: function () {
      app.redirect('search/index');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})
