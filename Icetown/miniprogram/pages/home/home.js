let app = getApp();
Page({
  
  /**
   * 页面的初始数据(类似vue组件的data)
   */
  data: {
    //banner数据
    url: [
      'cloud://icetown-1gklyxsice72f4e0.6963-icetown-1gklyxsice72f4e0-1304341500/images/banner5.jpg',
      'cloud://icetown-1gklyxsice72f4e0.6963-icetown-1gklyxsice72f4e0-1304341500/images/banner4.jpg', 
      'cloud://icetown-1gklyxsice72f4e0.6963-icetown-1gklyxsice72f4e0-1304341500/images/banner3.jpg', 
      'cloud://icetown-1gklyxsice72f4e0.6963-icetown-1gklyxsice72f4e0-1304341500/images/banner1.jpg'
    ],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,

    //菜单列表数据
    menuNav:[],
    //激活菜单栏下标
    activeMenuIndex:0,
    //是否显示骨架屏
    loading:true,

    //商品数据
    products:[]
  },

  /**
   * 生命周期函数--监听页面加载，一般用于初始化页面数据(类似vue的created)
   */
  onLoad: function (options) {
    console.log('初始化数据');
    //获取菜单数据
    this.getMenuList();
    //获取商品数据
    this.getProductByType("mousse");
  },

  //获取菜单列表数据
  getMenuList() {
    //开启加载提示
    wx.showLoading({
      title:'加载中...',
      mask:true
    })
    //调用云函数【get_menu_list】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_menu_list',

      //成功执行
      success: result => {
        console.log('调用云函数成功');
        //关闭加载提示
        wx.hideLoading();

        //修改data数据只能通过this.setData()修改，页面才会响应
        this.setData({
          menuNav: result.result.data
        })
        // console.log(this.data.menuNav);
      },
      fail:err =>{
        //关闭加载提示
        wx.hideLoading();
        console.log(err)
      }

    })
  },

  //切换菜单栏点击事件
  toggleMenu(e){
    // console.log(e)
    let currentIndex = e.currentTarget.dataset.index;
    // console.log(currentIndex);
    if( currentIndex == this.data.activeMenuIndex){
      return;
    }

    this.setData({
     activeMenuIndex:currentIndex
    })

    //切换商品数据
    this.getProductByType(e.currentTarget.dataset.type)
    // console.log(e.currentTarget.dataset.type)
  },

  //根据商品类型获取数据
   getProductByType(type){
    //商品类型（type）

    wx.showLoading({
      title: '加载中...',
      mask:true
    })

    //调用云函数get_products
    wx.cloud.callFunction({
      name:'get_products',
      //携带参数
      data:{
        type
      },
      success:result =>{
        wx.hideLoading()
        
        this.setData({
          loading:false,
          products:result.result.data,
         
        })
        // console.log(result);
      },
      fail:err =>{
        console.log(err);
      },
    })
   },

})