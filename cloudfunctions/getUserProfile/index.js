// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event.openid || wxContext.OPENID
  
  try {
    // 查询用户信息
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length > 0) {
      // 返回用户资料
      const userData = userResult.data[0]
      return {
        success: true,
        data: {
          realName: userData.realName || '',
          contactNumber: userData.contactNumber || '',
          school: userData.school || '',
          city: userData.city || ''
        }
      }
    } else {
      return {
        success: false,
        errMsg: '用户不存在'
      }
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message
    }
  }
}