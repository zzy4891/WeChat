//获取小程序实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //购物车商品_id
    _ids: [],
    //商品数据
    productData: [],
    //是否显示骨架屏
    loading: true,
    //地址信息
    addressInfo: {},
    //商品总价\总数量
    proInfo: {
      count: 0,
      total: 0,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData._ids) {
      this.data._ids = (app.globalData._ids).split('-');
    } else {
      this.data._ids = options._ids.split('-');
    }
    //判断aid是否存在
    if (options.aid) {
      // 跟据地址_id查询地址信息
      this.getDefault('_id', options.aid);
    } else {
      //获取默认地址
      this.getDefault('isDefault', true);
    }

    //跟据id获取商品数据
    this.getPayData();
    //获取默认地址
    this.getDefault();
    //删除全局_ids
    delete app.globalData._ids;
  },

  //跟据id获取商品数据
  getPayData() {
    //加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_shopcart_id
    wx.cloud.callFunction({
      name: 'get_shopcart_id',
      //携带参数商品id
      data: {
        _ids: this.data._ids
      },
      success: result => {
        wx.hideLoading();
        // console.log(result.result.data);
        this.setData({
          loading: false,
          productData: result.result.data,
        })
        // console.log(this.data.productData);
        this.getAccount();
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //跳转到地址页面
  goAddress() {
    app.globalData._ids = this.data._ids.join('-');
    wx.navigateTo({
      url: '../address/address',
    })
  },

  //获取默认地址
  getDefault(key, value) {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_address_isdefault
    wx.cloud.callFunction({
      name: 'get_address_isdefault',
      data: {
        key,
        value
      },
      success: result => {
        wx.hideLoading();
        // console.log('result ===>', result);
        let data = result.result.data;
        if (data.length > 0) {
          data[0].datailAddress = data[0].area.join('') + data[0].detail;
        }

        this.setData({
          addressInfo: result.result.data[0]
        })
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //订单总价格与总共数量
  getAccount() {
    //注意：价格必须先设置为0，不然会累加，
    this.data.proInfo.total = 0;
    this.data.proInfo.count = 0
    // console.log(this.data.productData)
    this.data.productData.map(v => {
      //订单总与订单数量的计算
      this.data.proInfo.count += v.scount;
      this.data.proInfo.total += v.scount * v.product.price;
      // console.log(this.data.proInfo.total)
    })
    this.setData({
      proInfo: this.data.proInfo
    })
  },

  //删除购物车数据
  removeShopcart(e) {
    let _id = e.currentTarget.dataset._id;
    // console.log(_id)
    //调用云函数get_shopcart_id
    wx.cloud.callFunction({
      name: 'remove_shopcart',
      //携带参数商品id
      data: {
        _id,
      },
      success: res => {
        wx.hideLoading();
        //删除之后重新设置数据
        this.getPayData();
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //订单结算
  payAccount() {
    // 获取地址id
    let aid = this.data.addressInfo._id;
    //获取购物车id
    let sid = this.data._ids;

    //添加顶单
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数add_order
    wx.cloud.callFunction({
      name: 'add_order',
      data: {
        aid,
        sid
      },
      success: result => {
        wx.hideLoading();
        console.log('result ===>', result);
        if (result.result.stats.removed > 0) {
          //添加订单成功
          wx.switchTab({
            url: '../order/order'
          })
        } else {
          wx.showToast({
            title: '添加订单失败',
            icon: 'none',
            mask: true,
            duration: 1500
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


})