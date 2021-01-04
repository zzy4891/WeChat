// miniprogram/pages/address/address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否显示骨架屏
    loading: false,
    //地址列表
    addressList:[],
    //跳转路径
    url:'../newaddress/newaddress'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取地址列表数据
    this.getAddressList();
  

  },

  //获取地址列表数据
  getAddressList() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_address_list
    wx.cloud.callFunction({
      name: 'get_address_list',
      success: result => {
        wx.hideLoading();
        console.log('result ===>', result);
        result.result.data.map(v =>{
          //detailAddress为新添加的属性
          v.detailAddress =`${v.area.join(' ')}${v.detail}` 
        })
        this.setData({
          loading:false,
          addressList:result.result.data
        })
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //跳转到新增地址页面/编辑页面
  goNewAddress(e) {
    let url = e.currentTarget.dataset.url;
   
     wx.navigateTo({
      url: url,
    })
  },

  //选择地址页面
  selectAddress(e){
    //获取地址id
    let _id = e.currentTarget.dataset._id;
    // console.log(_id)
    wx.navigateTo({
      url: '../pay/pay?aid=' + _id,
    })
    
  }

})