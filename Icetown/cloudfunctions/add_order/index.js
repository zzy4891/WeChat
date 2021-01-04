// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
let db = cloud.database();

//引用查询指令
let _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  // console.log('event ==>',event);
  // 保存查询的记录
  let pm = [];
  //查询地址
  pm.push(db.collection('address').where({
    _id:event.aid,
    userInfo:event.userInfo
  }).get());

  //查询购物车数据
  pm.push(db.collection('shopcart').where({
    pid:_.in(event.sid),
    userInfo:event.userInfo,

  }).get());

  //等待所有查询完成
  return await Promise.all(pm).then(async (result) =>{
    // console.log('result ==>', result);
  //通过商品id查询商品
   return await db.collection('products').where({
      _id:_.in(event.sid),
   }).get().then(async (res) =>{
    //  console.log('res ===>',res);
     res.data.map(v => {
      for (let i = 0; i < result[1].data.length; i++) {
        if (result[1].data[i].pid == v._id) {
          result[1].data[i].product = v;
          break;
        }
      }
    })
     
     //订单时间
     let date = new Date();
     //生成订单编号
     let orderNo = 'NO' + date.getTime();
     //订单状态:0：准备中 1:配送中 2：已完成
     let status = 0;
     //订单总数据
     let orderData = {
      orderNo,
      date,
      status,
      address:result[0].data[0],
      products:result[1].data
     }

     //写入订单信息
     return await db.collection('order').add({
       data:orderData
     }).then(async (value) =>{
       //根据购物车id删除数据
       if(value && value._id){
        //如果订单添加成功，在删除购物车数据
        return await db.collection('shopcart').where({
          pid:_.in(event.sid),
          userInfo:event.userInfo
        }).remove()
       }
     });
    // console.log('result ==>', result);
     
   });
  }).catch(err =>{
    console.log('err ==>', err);
  });
}