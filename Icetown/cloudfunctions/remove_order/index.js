// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
let datas = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  return await datas.collection('order').where({
    //当商品等于值时就查询
    orderNo:event.orderNo,
  }).remove();
}