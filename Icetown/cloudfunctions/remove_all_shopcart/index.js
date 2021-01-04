// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
let datas = cloud.database();
const _ = datas.command
// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event ==> ', event);
  //含有携带的参数，用户id
  try {
    return await datas.collection('shopcart').where({
      //当商品等于值时就查询
      pid: _.in(event._ids)
    }).remove()
  }catch(res) {
    console.error("res ===>",res)
  }
}