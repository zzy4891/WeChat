// miniprogram/pages/newaddress/newaddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否显示骨架屏
    loading: true,
    //地址信息
    addressInfo: {
      receiver: '',
      phone: '',
      area: '请选择省/市/区',
      detail: '',
      email: '',
      isDefault: false
    },
    //地址id(编辑地址需要)
    _id: '',
    //保存编辑地址副本，以便于检测用户是否编辑过地址
    copyAddressInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取参数
    let _id = options._id;
    if (_id) {
      //如果_id存在，那么就编辑地址
      this.setData({
        _id
      })

      //修改导航标题
      wx.setNavigationBarTitle({
        title: '编辑地址',
      })
      //跟据_id查询数据
      this.findAddressBy_id(_id);

    } else {
      //新增地址
      setTimeout(() => {
        this.setData({
          loading: false
        })
      }, 1000);
    }
  },

  //修改文本框的数据
  changeIptText(e) {
    // console.log("e ==>" , e);
    let key = e.currentTarget.dataset.key;
    // console.log('key ===>', key)
    this.data.addressInfo[key] = e.detail.value;
    //重新设置值 
    this.setData({
      addressInfo: this.data.addressInfo
    })
  },

  //验证表单
  varifyAddressForm() {
    //验证表单
    let addressInfo = this.data.addressInfo;
    for (let key in addressInfo) {
      if (addressInfo[key] === '' || addressInfo[key] == '请选择省/市/区') {
        wx.showToast({
          title: '请填写完整地址信息',
          icon: 'none',
          duration: 1500,
          mask: true
        })
        return false;
      }
    }
    //验证手机号
    if (!/^[1][3-9]\d{9}$/.test(addressInfo.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 500,
        mask: true
      })
      return false;
    }

    //验证邮政编码
    if (!/^\d{6}$/.test(addressInfo.email)) {
      wx.showToast({
        title: '邮编格式不正确',
        icon: 'none',
        duration: 500,
        mask: true
      })
      return false;
    }
    return true;
  },

  //提交
  commit() {
    // console.log(this.data.addressInfo);
    //如果地址表单验证不通过，就拦截
    if (!this.varifyAddressForm()) {
      return;
    }

    //先查询数据库是否存在默认地址,如果存在则将默认修改为非默认
    if (this.data.addressInfo.isDefault) {
      // 查新默认地址
      this.findAddress();
    } else {
      //新增地址
      this.addAddress();
    }

  },

  //新增地址
  addAddress() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_shopcart_id
    wx.cloud.callFunction({
      name: 'add_address',
      data: this.data.addressInfo,
      success: result => {
        wx.hideLoading();
        // console.log('result ===>', result);

        if (result.result._id) {
          //成功返回上一级
          wx.navigateTo({
            url: '../address/address',
          })
        } else {
          wx.showToast({
            title: '新增地址失败',
            icon: 'none',
            duration: 2000,
            mask: true
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

  //查询地址
  findAddress() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_address_isdefault
    wx.cloud.callFunction({
      name: 'get_address_isdefault',
      data: {
        key: 'isDefault',
        value: true
      },
      success: result => {
        wx.hideLoading();
        // console.log('result ===>', result);
        if (result.result.data.length > 0) {
          //如果存在修改该地址为默认地址，
          // 获取地址_id
          let _id = result.result.data[0]._id;
          //编辑地址
          this.editAddress(_id);
        } else {
          //新增地址
          this.addAddress();
        }
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //编辑地址
  editAddress(_id) {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数edit_address
    wx.cloud.callFunction({
      name: 'edit_address',
      data: {
        _id,
        //要更新的数据
        data: {
          isDefault: false
        }
      },
      success: result => {
        wx.hideLoading();
        // console.log('result ===>', result);
        if (result.result.stats.updated == 1) {
          //已经成功编辑地址数据，再重新新增一条数据
          this.addAddress();
        }
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //跟据地址id查询地址信息
  findAddressBy_id(_id) {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_address_isdefault
    wx.cloud.callFunction({
      name: 'get_address_isdefault',
      data: {
        key: '_id',
        value: _id
      },
      success: result => {
        wx.hideLoading();
        // console.log('result ===>', result);

        let addressInfo = this.data.addressInfo;
        for (let key in addressInfo) {
          addressInfo[key] = result.result.data[0][key];

          //保存用户信息副本
          this.data.copyAddressInfo[key] = result.result.data[0][key]
        }
        this.setData({
          loading: false,
          addressInfo
        })
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  },

  //删除地址
  delAddress() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数del_address
    wx.cloud.callFunction({
      name: 'del_address',
      data: {
        _id: this.data._id
      },
      success: result => {
        wx.hideLoading();
        // console.log('result ===>', result);
        if (result.result.stats.removed == 1) {
          wx.navigateTo({
            url: '../address/address',
          })
        } else {
          wx.showToast({
            title: '删除地址失败',
            mask: true,
            duration: 1500,
            icon: 'none'
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

  //保存编辑地址 
  saveAddress(data) {
    console.log('copyAddressInfo ===>', this.data.copyAddressInfo);
    //判断用户是否编辑过地址
    let editAddressData = {};
    for (let key in this.data.addressInfo) {
      if (key == 'area') {
        let area = this.data.addressInfo[key].join(' ');
        let copyArea = this.data.copyAddressInfo[key].join(' ');

        if (area != copyArea) {
          editAddressData[key] = this.data.addressInfo[key];
        }
        continue;
      }

      if (this.data.addressInfo[key] != this.data.copyAddressInfo[key]) {
        editAddressData[key] = this.data.addressInfo[key];
      }
    }
    //如果没有编辑过地址
    //判断editAddressData是否为空对象
    if (JSON.stringify(editAddressData) == '{}') {
      //直接返回上一级
      return wx.navigateBack();
    }
    // console.log('发起编辑地址请求');
    //判断表单是否填写
    if (!this.varifyAddressForm()) {
      return;
    }

    //发起编辑地址请求,编辑后重新保存地址
    this.saveEditAddress(editAddressData);
  },

  //编辑后重新保存地址
  saveEditAddress(data) {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数new_edit_address
    wx.cloud.callFunction({
      name: 'new_edit_address',
      data: {
        _id: this.data._id,
        // 编辑地址数据
        data
      },
      success: result => {
        wx.hideLoading();
        // console.log('result ===>', result);

         if (result.result.stats.updated ==1) {
           //成功返回上一级
           wx.navigateTo({
             url: '../address/address',
           })
         } else {
           wx.showToast({
             title: '编辑地址失败',
             icon: 'none',
             duration: 2000,
             mask: true
           })
         }
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading()
        console.log(err);
      },
    })
  }


})