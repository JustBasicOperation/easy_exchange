# Easy Exchange 技术架构文档

## 1. 架构概述

### 1.1 系统架构
Easy Exchange 采用前后端分离的架构设计，前端使用微信小程序开发框架，后端采用微信小程序云函数开发，数据存储使用微信小程序云开发数据库，文件存储采用腾讯云开发存储服务。

### 1.2 技术栈选择
- **前端**：微信小程序（WXML、WXSS、JavaScript）
- **后端**：微信小程序云函数（Node.js）
- **数据库**：微信小程序云开发数据库
- **文件存储**：腾讯云开发存储服务
- **消息推送**：微信订阅消息
- **地图服务**：google位置服务

## 2. 前端架构

### 2.1 目录结构
```
miniprogram/
├── app.js                # 小程序入口文件
├── app.json              # 全局配置
├── app.wxss              # 全局样式
├── components/           # 自定义组件
├── images/               # 图片资源
├── pages/                # 页面文件
│   ├── index/            # 首页
│   ├── category/         # 分类页
│   ├── publish/          # 发布页
│   ├── detail/           # 详情页
│   ├── profile/          # 个人中心
│   ├── message/          # 消息页
│   └── search/           # 搜索页
├── utils/                # 工具函数
└── config/               # 配置文件
```

### 2.2 核心组件
- **商品卡片组件**：展示商品基本信息
- **图片上传组件**：处理图片选择和上传到云存储
- **消息对话组件**：用户间聊天界面
- **筛选组件**：多条件筛选商品
- **评论组件**：用户评论展示

### 2.3 状态管理
- 使用微信小程序的全局数据和页面数据进行状态管理
- 关键数据使用本地缓存提升性能
- 使用云开发数据库实时监听功能实现数据同步

### 2.4 网络请求
- 使用微信小程序云函数调用接口
- 封装统一的云函数调用模块，处理请求拦截、响应拦截和错误处理
- 实现请求重试机制

## 3. 云函数架构

### 3.1 目录结构
```
cloudfunctions/
├── login/                # 登录云函数
├── getOpenId/            # 获取OpenID云函数
├── userService/          # 用户相关服务
├── itemService/          # 商品相关服务
├── messageService/       # 消息相关服务
├── transactionService/   # 交易相关服务
├── searchService/        # 搜索相关服务
└── common/               # 公共模块
    ├── utils/            # 工具函数
    └── middlewares/      # 中间件
```

### 3.2 云函数设计
主要云函数模块包括：

#### 用户服务 (userService)
- 用户登录与授权
- 获取/更新用户信息
- 用户收藏管理

#### 商品服务 (itemService)
- 发布/编辑/删除商品
- 获取商品列表/详情
- 获取商品评论列表/详情
- 商品状态管理
- 商品统计数据

#### 消息服务 (messageService)
- 发送/接收消息
- 获取会话列表
- 标记消息已读
- 消息通知

#### 搜索服务 (searchService)
- 商品搜索
- 搜索建议
- 热门搜索

### 3.4 安全策略
- 使用云函数访问控制
- 敏感数据加密存储
- 数据库权限管理
- 防注入和XSS攻击
- 请求频率限制

## 4. 云开发数据库设计

### 4.1 数据集合设计
主要数据集合包括：

#### 用户集合 (users)
```javascript
{
  _id: String,            // 用户ID（自动生成）
  _openid: String,        // 微信openid（自动关联）
  unionid: String,        // 微信unionid
  nickname: String,       // 昵称
  avatar: String,         // 头像
  gender: Number,         // 性别
  location: {             // 位置
    country: String,
    province: String,
    city: String
  },
  school: String,         // 学校
  phone: String,          // 手机号
  email: String,          // 邮箱
  credit: Number,         // 信用评分
  createTime: Date,       // 创建时间
  updateTime: Date        // 更新时间
}
```

#### 商品集合 (items)
```javascript
{
  _id: String,            // 商品ID（自动生成）
  _openid: String,        // 发布者openid（自动关联）
  title: String,          // 标题
  description: String,    // 描述
  category: String,       // 分类
  price: Number,          // 价格
  originalPrice: Number,  // 原价
  images: [String],       // 图片列表（云存储路径）
  video: String,          // 视频（云存储路径）
  condition: String,      // 物品状态
  location: {             // 位置
    type: "Point",
    coordinates: [Number] // [经度, 纬度]
  },
  address: String,        // 地址描述
  status: String,         // 在售/已售/已下架
  viewCount: Number,      // 浏览次数
  favoriteCount: Number,  // 收藏次数
  createTime: Date,       // 创建时间
  updateTime: Date        // 更新时间
}
```

#### 消息集合 (messages)
```javascript
{
  _id: String,            // 消息ID（自动生成）
  conversationId: String, // 会话ID
  sender: String,         // 发送者openid
  receiver: String,       // 接收者openid
  content: String,        // 消息内容
  contentType: String,    // 文本/图片/语音
  status: String,         // 已发送/已读
  createTime: Date        // 创建时间
}
```

#### 会话集合 (conversations)
```javascript
{
  _id: String,            // 会话ID（自动生成）
  participants: [String], // 参与者openid列表
  itemId: String,         // 相关商品ID
  lastMessage: {          // 最后一条消息
    content: String,
    sender: String,
    createTime: Date
  },
  unreadCount: {          // 未读消息计数
    openid1: Number,
    openid2: Number
  },
  createTime: Date,       // 创建时间
  updateTime: Date        // 更新时间
}
```

#### 收藏集合 (favorites)
```javascript
{
  _id: String,            // 收藏ID（自动生成）
  _openid: String,        // 用户openid（自动关联）
  itemId: String,         // 商品ID
  createTime: Date        // 创建时间
}
```

### 4.2 索引设计
- 用户集合：_openid, unionid, phone, email
- 商品集合：_openid, category, status, location (地理位置索引)
- 消息集合：conversationId, sender, receiver
- 会话集合：participants, itemId
- 收藏集合：_openid, itemId

### 4.3 数据访问控制
- 基于角色的访问控制
- 字段级别的权限控制
- 查询条件限制

## 5. 云存储设计

### 5.1 存储目录结构
```
cloud://
├── item/                 # 商品相关文件
│   ├── images/           # 商品图片
│   └── videos/           # 商品视频
└── message/              # 消息相关文件
    ├── images/           # 消息图片
    └── voice/            # 语音消息
```

### 5.2 文件命名规则
- 商品图片：`item/images/{itemId}/{itemId}_{index}_{timestamp}.{ext}`
- 商品视频：`item/videos/{itemId}/{itemId}_{timestamp}.{ext}`
- 消息图片：`message/images/{conversationId}/{messageId}_{timestamp}.{ext}`
- 语音消息：`message/voice/{conversationId}/{messageId}_{timestamp}.{ext}`

### 5.3 存储安全策略
- 基于角色的访问控制
- 文件大小限制
- 文件类型限制
- 防盗链设置

## 6. 小程序云开发特性应用

### 6.1 云函数
- 无需自建服务器，降低运维成本
- 自动扩缩容，应对流量波动
- 按量计费，节约成本

### 6.2 云数据库
- 实时数据推送
- 自动备份恢复
- 数据安全加密
- 地理位置查询

### 6.3 云存储
- 高可用性和可靠性
- CDN加速
- 图片压缩和处理
- 安全访问控制

### 6.4 云调用
- 微信开放能力接口调用
- 订阅消息推送
- 小程序码生成

## 7. 性能优化

### 7.1 前端优化
- 分包加载
- 图片懒加载
- 本地数据缓存
- 预加载关键数据

### 7.2 云函数优化
- 云函数复用
- 冷启动优化
- 合理设置超时时间
- 异步处理大量数据

### 7.3 数据库优化
- 合理设计索引
- 避免大量数据查询
- 分页查询
- 聚合查询优化

### 7.4 云存储优化
- 图片压缩
- 使用临时链接
- 合理设置缓存策略

## 8. 安全与合规

### 8.1 数据安全
- 敏感数据加密
- 最小权限原则
- 定期数据备份
- 数据访问审计

### 8.2 应用安全
- 输入验证
- 防SQL注入
- 防XSS攻击
- 防CSRF攻击

### 8.3 合规要求
- 用户隐私保护
- 数据存储合规
- 内容安全审核
- 第三方服务合规

## 9. 监控与运维

### 9.1 监控系统
- 云开发控制台监控
- 自定义监控指标
- 异常告警机制

### 9.2 日志系统
- 云函数日志
- 数据库操作日志
- 用户行为日志
- 错误日志分析

### 9.3 运维策略
- 版本管理
- 灰度发布
- 回滚机制
- 定期安全检查

## 10. 扩展性设计

### 10.1 功能扩展
- 插件化设计
- 模块化开发
- 配置化功能

## 11. 开发与部署流程

### 11.1 开发环境
- 微信开发者工具
- 本地云函数调试
- 模拟数据环境

### 11.2 测试环境
- 云开发测试环境
- 自动化测试
- 性能测试

### 11.3 生产环境
- 云开发生产环境
- 发布审核流程
- 监控与告警