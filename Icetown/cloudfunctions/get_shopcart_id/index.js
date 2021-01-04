// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
let db = cloud.database();
//查询指令
let _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(event);
  let currentTime = new Date().getTime() - 30 * 60 * 1000;
  let currentDate = new Date(currentTime);
  event.time = currentDate;
  return await db.collection('shopcart').where({
    //跟据shopcart中的_id查询
    pid: _.in(event._ids),
    userInfo: event.userInfo,
    time: _.gte(currentDate),
    //方法一
  }).get().then(async (result) => {
    //  查询购物车数据
    // console.log('result ==> ', result);

    let pids = [];
    //根据商品pid查询数据（当商品pid=商品集合的_id时，就查询）
    result.data.map(v => {
      pids.push(v.pid);
    })

    //根据商品pid查询集合数据
    return await db.collection('products').where({
      _id: _.in(pids)
    }).get().then(async (res) => {

      //将购物车数据和商品数据合并
      result.data.map(v => {
        //根据商品id查找数据
        for (let i = 0; i < res.data.length; i++) {
          if (v.pid == res.data[i]._id) {
            v.product = res.data[i];
            break;
          }
        }
      })
      //返回合并后的数据
      return result;
    });

  });


}