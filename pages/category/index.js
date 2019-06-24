// pages/category/index.js
//获取应用实例
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPath: rootDocment + '/upload/pic/',
    hiddenLoading: false,
    topicList: [],
    hotGoodsList: [],
    currentID: '',
    catList: [],
    sonList: [],  //子类
    currentList: [],  //当前类别信息
    hiddenTop: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var id = options.id;
    that.setCategoryData(id);
    that.setHotGoodsData(id);
    that.setTopicData(id);
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
    var that = this;
    that.setCategoryData(that.data.currentID);
    that.setHotGoodsData(that.data.currentID);
    that.setTopicData(that.data.currentID);
    wx.stopPullDownRefresh();
  },

  //初始化分类
  setCategoryData: function (id) {
    var that = this;
    var paraArr = new Array();
    var myArr = new Array();

    paraArr['pid'] = 0;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_goods_category',
      data: { pid: paraArr['pid'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          catList: res.data,
          currentID: id
        });
      }
    })
    //初始化子类
    paraArr['pid'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_goods_category',
      data: { pid: paraArr['pid'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          sonList: res.data
        });
      }
    })
    //初始当前类别信息
    myArr['id'] = id;
    var sign = app.signature(myArr);
    wx.request({
      url: rootDocment + '/api_goods_category',
      data: { id: myArr['id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          currentList: res.data[0]
        });
      }
    })

  },

  //初始化限时抢购
  setHotGoodsData: function (id) {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = "6";
    paraArr['cat_id'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getFlashGoods',
      data: { cat_id: paraArr['cat_id'], size: paraArr['size'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          hotGoodsList: res.data.data
        });
      }
    })
  },

  //初始化专题
  setTopicData: function (id) {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = "20";
    paraArr['cid'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_topic',
      data: { cid: paraArr['cid'], size: paraArr['size'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data.data);
        that.setData({
          topicList: res.data.data,
          hiddenLoading: true
        });
      }
    })
    that.setCountDown();
  },

  //点击导航
  goCategory: function (e) {
    var id = e.currentTarget.dataset.id
    console.log(id);
    if(id==0){
      app.gotaburl('index/index');
    }
    else {
      app.gourl('category/index?id=' + id);
    }
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
    return { ms, ss, mm, hh };
  },

  //去搜索
  toSearch: function () {
    app.redirect('search/index');
  }

})