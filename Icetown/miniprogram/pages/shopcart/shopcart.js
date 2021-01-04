// miniprogram/pages/shopcart/shopcart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否显示骨架屏
    loading:true,
    //商品数据
    productData:"",
    //购物车id
    _ids:[],
    //商品总价\总数量
    proInfo:{
      count:0,
      total:0,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //切割传过来的字符串并且保存
    this.data._ids = options._ids.split('-');
    // console.log('this.data._ids ==>',this.data._ids);
    this.getshopcartData();

   
  },

    //通过id查询购物车数据
    getshopcartData(){
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
        console.log(result.result.data);
        this.setData({
          loading:false,
          productData:result.result.data,
        })
        this.getAccount();
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
    },

    //点击购物车商品跳转到详情页面
    goDetail(event){
      // console.log(event);
      // 获取data-route的值
      let route = event.currentTarget.dataset.route;
      wx.navigateTo({
        url: route,
      })
    },


    //订单总价格与总共数量
    getAccount(){
      //注意：价格必须先设置为0，不然会累加，
      this.data.proInfo.total = 0
      // console.log(this.data.productData)
      this.data.productData.map(v =>{
        //订单总与订单数量的计算
        this.data.proInfo.count += v.scount;
        this.data.proInfo.total += v.scount * v.product.price;
        // console.log(this.data.proInfo.total)
      })
      this.setData({
        proInfo:this.data.proInfo
      })
    },

  //删除购物车数据
  removeShopcart(e){
    let _id = e.currentTarget.dataset._id;
    // console.log(_id)
    //调用云函数get_shopcart_id
    wx.cloud.callFunction({
      name: 'remove_shopcart',
      //携带参数商品id
      data:{
       _id,
      },
      success: res => {
        wx.hideLoading();
        //删除之后重新设置数据
        this.getshopcartData();
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
    
   
  },

  //删除购物车全部数据
  removeAllData(){
    let _ids = this.data._ids;
    // console.log(_ids)
    //调用云函数get_shopcart_id
    
    wx.cloud.callFunction({
      name: 'remove_all_shopcart',
      //携带参数商品id
      data:{
       _ids,
      },
      success: res => {
        wx.hideLoading();
        console.log(res)
        //删除之后重新设置数据
        this.getshopcartData();
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },


  //立即结算
  goAccount(){
    wx.navigateTo({
      url: '../pay/pay?_ids=' + this.data._ids.join('-'),
    })
  }
})