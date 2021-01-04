// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(event);
  //含有携带的参数，用户id
  // return
  return await db.collection('products').where({
    //当类型等于值时就查询
    type:event.type
  }).get();
}