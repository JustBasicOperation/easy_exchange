const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { action, payload } = event;

  switch (action) {
    case 'publishItem':
      return await publishItem(wxContext, payload);
    case 'editItem':
      return await editItem(wxContext, payload);
    case 'deleteItem':
      return await deleteItem(wxContext, payload);
    case 'getItemDetail':
      return await getItemDetail(wxContext, payload);
    case 'getItemList':
      return await getItemList(wxContext, payload);
    case 'toggleFavorite':
      return await toggleFavorite(wxContext, payload);
    case 'getFavoriteList':
      return await getFavoriteList(wxContext, payload);
    default:
      return {
        code: 400,
        message: '无效的操作'
      };
  }
};

async function publishItem(wxContext, payload) {
  const { title, description, category, price, originalPrice, images, video, condition, location, address } = payload;
  const { openid } = wxContext;

  try {
    const data = {
      _openid: openid,
      title,
      description,
      category,
      price,
      originalPrice,
      images,
      status: '在售',
      viewCount: 0,
      favoriteCount: 0,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };

    if (video) data.video = video;
    if (condition) data.condition = condition;
    if (location) data.location = location;
    if (address) data.address = address;

    const result = await db.collection('items').add({ data });

    return {
      code: 200,
      message: '发布成功',
      data: result._id
    };
  } catch (error) {
    return {
      code: 500,
      message: '发布失败',
      data: error
    };
  }
}

async function editItem(wxContext, payload) {
  const { itemId, ...dataToUpdate } = payload;
  const { openid } = wxContext;

  try {
    const item = await db.collection('items').doc(itemId).get();

    if (item.data._openid !== openid) {
      return {
        code: 403,
        message: '无权操作'
      };
    }

    await db.collection('items').doc(itemId).update({
      data: {
        ...dataToUpdate,
        updateTime: db.serverDate()
      }
    });

    return {
      code: 200,
      message: '编辑成功'
    };
  } catch (error) {
    return {
      code: 500,
      message: '编辑失败',
      data: error
    };
  }
}

async function deleteItem(wxContext, payload) {
  const { itemId } = payload;
  const { openid } = wxContext;

  try {
    const item = await db.collection('items').doc(itemId).get();

    if (item.data._openid !== openid) {
      return {
        code: 403,
        message: '无权操作'
      };
    }

    await db.collection('items').doc(itemId).remove();

    return {
      code: 200,
      message: '删除成功'
    };
  } catch (error) {
    return {
      code: 500,
      message: '删除失败',
      data: error
    };
  }
}

async function getItemDetail(wxContext, payload) {
  const { itemId } = payload;

  try {
    const item = await db.collection('items').doc(itemId).get();

    // 更新浏览次数
    await db.collection('items').doc(itemId).update({
      data: {
        viewCount: db.command.inc(1)
      }
    });

    return {
      code: 200,
      message: '获取成功',
      data: item.data
    };
  } catch (error) {
    return {
      code: 500,
      message: '获取失败',
      data: error
    };
  }
}

async function getItemList(wxContext, payload) {
  const { category, keyword, page = 1, pageSize = 10 } = payload;
  const db = cloud.database();
  const _ = db.command;
  const query = {};

  if (category) {
    query.category = category;
  }

  if (keyword) {
    query.title = {
      $regex: '.*' + keyword + '.*',
      $options: 'i'
    };
  }

  try {
    const countResult = await db.collection('items').where(query).count();
    const total = countResult.total;
    const totalPage = Math.ceil(total / pageSize);

    const items = await db.collection('items')
      .where(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get();

    return {
      code: 200,
      message: '获取成功',
      data: {
        list: items.data,
        pagination: {
          page,
          pageSize,
          total,
          totalPage
        }
      }
    };
  } catch (error) {
    return {
      code: 500,
      message: '获取失败',
      data: error
    };
  }
}

async function toggleFavorite(wxContext, payload) {
  const { itemId } = payload;
  const { openid } = wxContext;
  const db = cloud.database();
  const _ = db.command;

  try {
    const favorite = await db.collection('favorites').where({
      _openid: openid,
      itemId: itemId
    }).get();

    if (favorite.data.length > 0) {
      // 取消收藏
      await db.collection('favorites').doc(favorite.data[0]._id).remove();
      await db.collection('items').doc(itemId).update({
        data: {
          favoriteCount: _.inc(-1)
        }
      });
      return {
        code: 200,
        message: '取消收藏成功',
        data: { isFavorited: false }
      };
    } else {
      // 添加收藏
      await db.collection('favorites').add({
        data: {
          _openid: openid,
          itemId: itemId,
          createTime: db.serverDate()
        }
      });
      await db.collection('items').doc(itemId).update({
        data: {
          favoriteCount: _.inc(1)
        }
      });
      return {
        code: 200,
        message: '收藏成功',
        data: { isFavorited: true }
      };
    }
  } catch (error) {
    return {
      code: 500,
      message: '操作失败',
      data: error
    };
  }
}

async function getFavoriteList(wxContext, payload) {
  const { page = 1, pageSize = 10 } = payload;
  const { openid } = wxContext;
  const db = cloud.database();

  try {
    const favorites = await db.collection('favorites').where({
      _openid: openid
    }).skip((page - 1) * pageSize).limit(pageSize).orderBy('createTime', 'desc').get();

    const itemIds = favorites.data.map(item => item.itemId);

    const items = await db.collection('items').where({
      _id: db.command.in(itemIds)
    }).get();

    return {
      code: 200,
      message: '获取成功',
      data: {
        list: items.data
      }
    };
  } catch (error) {
    return {
      code: 500,
      message: '获取失败',
      data: error
    };
  }
}