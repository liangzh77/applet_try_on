# 云函数配置指南

## 配置步骤

### 1. 开通微信云开发

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入小程序管理后台
3. 点击左侧菜单"云开发"
4. 开通云开发服务（首次需要填写环境名称）
5. 记录你的**云开发环境ID**（格式如：`cloud1-xxx`）

### 2. 配置小程序云开发环境ID

修改 `miniapp/src/app.ts` 文件，将 `your-env-id` 替换为你的云开发环境ID：

```typescript
Taro.cloud.init({
  env: 'cloud1-xxx', // 替换为你的实际环境ID
  traceUser: true
});
```

### 3. 配置云函数环境变量

在微信开发者工具中：

1. 打开云开发控制台（点击工具栏"云开发"按钮）
2. 点击左侧"云函数"
3. 找到 `generateTryOn` 函数（需要先上传）
4. 点击"版本管理" → "配置"
5. 在"环境变量"中添加以下配置：

```
ARK_API_KEY=你的火山引擎API密钥
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_MODEL=doubao-seedream-4-0-250828
```

**重要**：`ARK_API_KEY` 从 `web/.env.local` 文件中的 `VITE_ARK_API_KEY` 获取（当前值：`3ecc5d48-8986-4027-a052-2f63010e2f3d`）

### 4. 上传并部署云函数

#### 方法一：使用微信开发者工具（推荐）

1. 用微信开发者工具打开 `miniapp` 项目
2. 点击工具栏的"云开发"按钮
3. 在云函数列表中，右键点击 `generateTryOn`
4. 选择"上传并部署：云端安装依赖"
5. 等待上传完成

#### 方法二：使用命令行

```bash
cd miniapp/cloudfunctions/generateTryOn
npm install  # 安装依赖
# 然后使用微信开发者工具上传
```

### 5. 测试云函数

在微信开发者工具中：

1. 点击"云开发控制台"
2. 进入"云函数"
3. 找到 `generateTryOn` 函数
4. 点击"测试"按钮
5. 输入测试数据：

```json
{
  "personBase64": "data:image/png;base64,iVBORw0KG...",
  "garmentBase64": "data:image/png;base64,iVBORw0KG..."
}
```

## 项目结构

```
miniapp/
├── cloudfunctions/          # 云函数目录
│   └── generateTryOn/       # 虚拟试穿云函数
│       ├── index.js         # 云函数入口
│       ├── package.json     # 依赖配置
│       └── config.json      # 云函数配置
└── src/
    ├── app.ts              # 应用入口（初始化云开发）
    └── pages/
        └── index/
            └── index.tsx   # 首页（调用云函数）
```

## 常见问题

### Q1: 云函数调用失败，提示"云开发环境不存在"
**A:** 检查 `app.ts` 中的环境ID是否正确，确保已开通云开发服务。

### Q2: 云函数调用失败，提示"ARK_API_KEY未配置"
**A:** 确保在云开发控制台的环境变量中正确配置了 `ARK_API_KEY`。

### Q3: 生成时间过长或超时
**A:** Volcengine API生成图片需要较长时间（30-120秒），请耐心等待。如果超时，可以在云函数中增加 `timeout` 配置。

### Q4: 图片太大导致上传失败
**A:** 微信云函数有大小限制，建议在上传前压缩图片。可以修改 `Taro.chooseImage` 的 `sizeType` 参数为 `['compressed']`。

### Q5: 如何查看云函数日志？
**A:** 在云开发控制台 → 云函数 → 选择函数 → 日志，可以查看函数的运行日志和错误信息。

## 费用说明

- **微信云开发**：
  - 免费额度：每月5GB存储、2GB流量、10万次函数调用
  - 超出部分按量计费

- **火山引擎Seedream API**：
  - 按生成图片数量计费
  - 具体价格参考[火山引擎定价](https://www.volcengine.com/pricing)

## 技术支持

如有问题，请参考：
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [火山引擎Seedream文档](https://www.volcengine.com/docs/82379)
