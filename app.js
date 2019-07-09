//app.js
var utilMd5 = require('utils/md5.js');
App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  //授权登录
  login: function(cb) {
    var that = this;
    var fid = 0; //分销人ID
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      if (cb != "" && typeof cb != "function") {
        fid = cb;
      }
      //调用登录接口
      wx.login({
        success: function(res) {
          var code = res.code;
          wx.getUserInfo({
            success: function(res) {
              console.log(res);
              if (code) {
                //发起网络请求
                wx.request({
                  url: that.globalData.postUrl + '/api/Logic/WxLogin',
                  data: {
                    code: code,
                    nickname: res.userInfo.nickName,
                    avatar: res.userInfo.avatarUrl,
                    fid: fid
                  },
                  method: 'GET',
                  header: {},
                  success: function(res) {
                    console.log(res)
                    if (res.data.success) {
                      wx.setStorageSync('sessionID', res.data.session_id);
                      that.globalData.openID = res.data.session_id
                      that.globalData.userID = res.data.user_id
                      that.globalData.isFX = res.data.is_fx
                    }
                  }
                })
              } else {
                console.log('获取用户登录态失败！' + res.errMsg)
              }
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail: function(res) {
              //没有授权
              that.redirect('authorize/index');
            }
          })

        }
      })
    }
  },


  /**
   * 签名
   * @param data        提交的数据
   * @returns {string}
   */
  signature: function(data) {
    var n = null,
      d = {},
      str = '',
      s = ''
    n = Object.keys(data).sort()
    for (var i in n) {
      d[n[i]] = data[n[i]]
    }
    for (var k in d) {
      if (d[k] === '') continue
      if (str != '') str += '&'
      str += k + '=' + encodeURI(d[k])
    }
    str += '&key=' + this.globalData.signKey;
    s = utilMd5.hexMD5(str).toUpperCase() // 这儿是进行MD5加密并转大写
    return s;
  },

  //跳转到不是底部菜单的页面(保存之前页面)
  redirect: function(url, param) {
    wx.navigateTo({
      url: '/pages/' + url + '?' + param
    })
  },
  //跳转到不是底部菜单的页面(关闭之前页面),切换小类要用
  gourl: function(url, param) {
    wx.redirectTo({
      url: '/pages/' + url + '?' + param
    })
  },
  //跳转到底部菜单的页面
  gotaburl: function(url) {
    wx.switchTab({
      url: '/pages/' + url
    })
  },
  globalData: {
    userInfo: null,
    openID: '',
    userID: '',
    isFX: '',
    signKey: 'myjrc',
    postUrl: "https://sapi.xiaonianyu.com"
    // postUrl: "https://saptest.xiaonianyu.com"
  }
})