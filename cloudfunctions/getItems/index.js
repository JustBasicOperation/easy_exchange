// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, page = 1, pageSize = 10, categoryId, keyword } = event
  const skip = (page - 1) * pageSize
  
  // 构建查询条件
  let query = {}
  
  // 根据分类筛选
  if (categoryId) {
    query.categoryId = categoryId
  }
  
  // 关键词搜索
  if (keyword) {
    query = {
      ...query,
      title: db.RegExp({
        regexp: keyword,
        options: 'i',
      })
    }
  }
  
  // 根据类型筛选
  if (type === 'recommend') {
    query.isRecommend = true
  }
  
  try {
    // 获取总数
    const countResult = await db.collection('items').where(query).count()
    const total = countResult.total
    
    // 查询数据
    let itemsQuery = db.collection('items').where(query)
    
    // 排序
    if (type === 'new') {
      itemsQuery = itemsQuery.orderBy('createTime', 'desc')
    } else if (type === 'price_asc') {
      itemsQuery = itemsQuery.orderBy('price', 'asc')
    } else if (type === 'price_desc') {
      itemsQuery = itemsQuery.orderBy('price', 'desc')
    } else {
      // 默认按更新时间排序
      itemsQuery = itemsQuery.orderBy('updateTime', 'desc')
    }
    
    // 分页
    const itemsResult = await itemsQuery.skip(skip).limit(pageSize).get()
    
    return {
      success: true,
      data: itemsResult.data,
      total,
      page,
      pageSize
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message
    }
  }
}