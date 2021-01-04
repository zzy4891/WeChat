// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
let db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  console.log('获取菜单数据云函数');

  //返回查询结果, db.collection()查询集合名称, get()查询， 
  //异步查询必须使用await等待查询结果，再将查询结果返回去
  //await：注意：await关键字不能单独使用，必须配合async使用
  return await db.collection("menu_list").get();
}