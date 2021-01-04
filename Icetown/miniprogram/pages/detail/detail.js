let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //保存商品id
    id: '',
    //商品详情数据
    detailData: [],
    //是否显示骨架屏
    loading: true,
    //购物车数量
    shopCount: 0,
    //加购抖动标识
    isAdd: false,
    //保存购物车id集合
    _ids: [],
    //是否授权
    isAuth: false
  },

  //组件的生命周期
  lifetimes: {
    created() {
      //获取用户授权信息
      wx.getSetting({
        success: res => {
          // console.log('获取用户授权信息 res ==> ', res);
          //isAuth: 是否授权
          app.globalData.isAuth = res.authSetting['scope.userInfo'];
          this.setData({
            isAuth: res.authSetting['scope.userInfo']
          })
        }
      })
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let id = options._id;
    //跟据商品id查询数据id
    this.getProductByType(id);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  //页面显示执行
  onShow(options) {
    //获取购物车数据
    this.getShopCartData();
  },

  //获取购物车数据
  getShopCartData() {
    //加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    //调用云函数get_detail
    wx.cloud.callFunction({
      name: 'get_shopcart',
      success: result => {
        wx.hideLoading();
        // console.log(result);
        if (Array.isArray(result.result.data)) {
          //遍历购物车id集合数组
          result.result.data.map(v => {
            this.data._ids.push(v.pid);
          })

          this.setData({
            shopCount: result.result.data.length
          })
        }
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },


  //跟据商品id查询数据id
  getProductByType(id) {
    //商品id（id）
    //加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    //调用云函数get_detail
    wx.cloud.callFunction({
      name: 'get_detail',
      //携带参数商品id
      data: {
        id,
      },
      success: result => {
        wx.hideLoading();
        let newData = result.result.data;
        newData[0].toastData = []
        newData.map(v => {
          v.toastData.push(v.toast.split('\n'));
        })
        // console.log(newData)
        this.setData({
          loading: false,
          detailData: newData,
        })
        // console.log(this.data.detailData);
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //商品规格切换
  toggleMenu(e) {
    // console.log(e)
    //大规格的key
    let selectIndex = e.currentTarget.dataset.selectIndex;
    //小商品规格
    let attrIndex = e.currentTarget.dataset.attrIndex;
    //大商品规格数据
    let rules = e.currentTarget.dataset.rules
    //小商品规格数据长度
    var count = rules[selectIndex].rule.length;
    // 遍历小商品规格数据长度
    for (var i = 0; i < count; i++) {
      //给每一个小商品规格添加激活选项，默认为false
      rules[selectIndex].rule[i].isselect = false
    }
    //选中的商品规格数据变为true
    rules[selectIndex].rule[attrIndex].isselect = true;
    //存储所有规格
    let allRules = [];
    //遍历最大的数据
    this.data.detailData.map(v => {
      rules.map(n => {
        n.rule.map(m => {
          //把选中的规格筛选出来
          if (m.isselect) {
            allRules.push(m.delrule)
          }
        })
      })
      //将改变后的规格数据重新放入最大数据中
      v.rules = rules
      v.allRules = allRules
      //合并是所有规格重新放进大数据里
      v.newRules = v.allRules.join('/')
    })
    //替换原来的大数据
    let detailData = this.data.detailData;
    this.setData({
      // 重新渲染最大的数据
      detailData: detailData
    })

  },

  //加入购物车
  addShopcart() {
    this.data.detailData.map(v => {
      //查询是否有newRules这个属性，并且选择规格的长度要等与商品规格长度
      if (v.hasOwnProperty('allRules') && v.allRules.length == v.rules.length) {
        //获取商品id与数量
        let _id = v._id;
        let newRules = v.newRules;
        //商品数量
        let scount = 1;

        //调用云函数
        wx.cloud.callFunction({
          name: 'add_shopcart',
          //携带参数商品id
          data: {
            pid: _id,
            newRules,
            scount,
          },
          success: result => {
            // console.log(result);
            this.getShopCartData();
            if (result.result._id) {
              wx.showToast({
                title: '已加入购物车',
                duration: 1500,
                mask: true,
                icon: 'none'
              })
              //购物车数量抖动效果
              this.setData({
                isAdd: true
              })
              setTimeout(() => {
                this.setData({
                  isAdd: false
                })
              }, 500);
            }
          },
          fail: err => {
            console.log(err);
          },
        })
      } else {
        wx.showToast({
          title: '请选择完整的商品规格',
          duration: 1000,
          mask: true,
          icon: 'none'
        })
      }
    })
  },

  //点击图标进入购物车
  goShopCart() {
    if (this.data._ids.length == 0) {
      wx.showToast({
        title: '购物车暂时没有商品哦！',
        mask: true,
        duration: 2000,
        icon: 'none'
      })

      return;
    }
    wx.navigateTo({
      url: '../shopcart/shopcart?_ids=' + this.data._ids.join('-'),
    })
  },

  //获取用户授权
  getUserAuthInfo(res) {
    console.log('用户授权 res ==> ', res);
    if (res.detail.userInfo) {
      app.globalData.isAuth = true;
      this.setData({
        isAuth: true
      })
    }
  },

  //立即购买
  goBuy() {
    this.data.detailData.map(v => {
      //查询是否有newRules这个属性，并且选择规格的长度要等与商品规格长度
      if (v.hasOwnProperty('allRules') && v.allRules.length == v.rules.length) {
        //获取商品id与数量
        let _id = v._id;
        let newRules = v.newRules;
        //商品数量
        let scount = 1;

        //调用云函数
        wx.cloud.callFunction({
          name: 'add_shopcart',
          //携带参数商品id
          data: {
            pid: _id,
            newRules,
            scount,
          },
          success: result => {
            // console.log(result);
            this.getShopCartData();
            wx.navigateTo({
              url: '../pay/pay?_ids=' + v._id,
            })
          },
          fail: err => {
            console.log(err);
          },
        })
      } else {
        wx.showToast({
          title: '请选择完整的商品规格',
          duration: 1000,
          mask: true,
          icon: 'none'
        })
      }
    })
  
    
  }
})