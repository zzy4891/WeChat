// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
let db = cloud.database();

//获取查询指令引用
let _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(event)
  //获取当前是时间
  //生成加入购物车时间
  let currentTime = new Date().getTime() - 30 * 60 * 1000;
  let currentDate = new Date(currentTime);
  // let year = currentDate.getFullYear();
  // let month = currentDate.getMonth() +1;
  // let date  = currentDate.getDate();
  // let hours = currentDate.getHours();
  // let minutes = currentDate.getMinutes();
  // let seconds = currentDate.getSeconds();
  // let time = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  event.time = currentDate;
  // console.log('time ==>',time)
  //shopcart表示数据库里面的集合，add方法用于给云函数添加数据
  //查询距离当前时间半小时内购物车数据，集合的shopcart的time 字段 >= currentDate
  return await db.collection('shopcart').where({
    //查询指令：gte表示：>=
    time:_.gte(currentDate),
    userInfo:event.userInfo
  }).get();
}