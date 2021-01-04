
Component({
  /**
   * 组件的属性列表,一般用于父子组件传值
   */
  properties: {
   
    productData:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //跳转到商品详情页面
    goDetail(event){
      // console.log(event);
      // 获取data-route的值
      let route = event.currentTarget.dataset.route;
      wx.navigateTo({
        url: route,
      })
    },

   
  }
})
