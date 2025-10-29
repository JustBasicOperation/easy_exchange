// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const unionid = wxContext.UNIONID
  const { userInfo, userProfile } = event
  
  try {
    // 查询用户是否已存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    let userData = {}
    
    if (userInfo) {
      // 基本用户信息
      userData = {
        ...userInfo,
        _openid: openid,
        unionid: unionid || '',
        updateTime: db.serverDate()
      }
    }
    
    if (userProfile) {
      // 个人资料信息
      userData = {
        ...userData,
        realName: userProfile.realName,
        contactNumber: userProfile.contactNumber,
        school: userProfile.school,
        city: userProfile.city,
        updateTime: db.serverDate()
      }
    }
    
    if (userResult.data.length > 0) {
      // 更新用户信息
      await db.collection('users').where({
        _openid: openid
      }).update({
        data: userData
      })
    } else {
      // 新增用户信息
      userData.createTime = db.serverDate()
      await db.collection('users').add({
        data: userData
      })
    }
    
    return {
      success: true,
      openid,
      unionid
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message
    }
  }
}