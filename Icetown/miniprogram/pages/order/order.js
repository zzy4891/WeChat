// 导出时间处理函数
import {utils} from '../../js/utils.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否显示骨架屏
    loading:true,
    //订单偏移量
    offset:0,
    //每次查询订单的数据量
    count:20,
    //订单数据
    orderData:[],
    //是否存在是数据加载
    isHas:true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    setTimeout(() => {
      this.setData({
        loading:false
      })
    }, 1500);

    
  },

 onShow(){
  this.setData({
    loading: false,
    //订单数量偏移量
    offset: 0,
    //订单数据
    orderData: [],
    //是否存在数据加载
    isHas: true
  })
   //获取订单数据
   this.getOrderData();
 },
  
  //获取订单数据
  getOrderData(){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_order
    wx.cloud.callFunction({
      name: 'get_order',
      data:{
        offset:this.data.offset,
        count:this.data.count
      },
      success: result => {
        wx.hideLoading();
        
        result.result.data.map(v =>{
          //处理时间格式化问题
          v.date =  utils.formatDate(v.date,'yyyy-MM-dd hh:mm:ss');
          //处理地址拼接
          v.address.detailAddress = v.address.area.join('') + v.address.detail;
          //订单数量与总价
          v.productCount = 0;
          v.productTotal = 0;
          v.products.map(item =>{
            v.productCount += item.scount;
            v.productTotal += item.scount * item.product.price;
          })
        })
        // console.log('result ===>', result);
        //如果本次请求获取订单是数据不足5条，下次无需请求
        if(result.result.data.length < 5){
          this.setData({
            isHas:false
          })
        }

        this.data.orderData.push(...result.result.data),
        this.setData({
          orderData:this.data.orderData,
          //偏移量 + 数量
          offset:this.data.offset + this.data.count
        })
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //删除订单
  removerOrder(e){
    let orderNo = e.currentTarget.dataset.orderno;
    // console.log(orderNo);
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数remove_order
    wx.cloud.callFunction({
      name: 'remove_order',
      data:{
        orderNo,
      },
      success: result => {
        wx.hideLoading();
        // console.log(result);
        this.setData({
          loading: false,
          //订单数量偏移量
          offset: 0,
          //订单数据
          orderData: [],
          //是否存在数据加载
          isHas: true
        })
        //重新获取订单数据
        this.getOrderData();
        
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.isHas){
      // console.log('没有数据可加载了');
      return;
    }

    this.getOrderData();
  },


})