// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//创建数据库引用
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('order').where({
    address:{
      userInfo:event.userInfo
    }
    //按添加时间排序并且限制显示数量
  }).orderBy('date','desc').skip(event.offset).limit(event.count).get();
}