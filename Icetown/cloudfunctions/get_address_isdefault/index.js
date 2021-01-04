// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
let db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  // console.log('event ==>' ,event);
  return await db.collection('address').where({
    userInfo:event.userInfo,
    // 动态键名
    [event.key]:event.value
  }).get();
}