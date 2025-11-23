# AI霓裳智能换装 - 全平台项目

这个仓库包含AI霓裳智能换装应用的Web版和微信小程序版。

## 项目结构

```
applet_try_on/
├── web/              # Web应用 (React + Vite)
├── miniapp/          # 微信小程序 (Taro + React)
├── node_modules/     # 共享的node_modules (主要用于全局工具)
└── README.md         # 本文件
```

## 子项目说明

### Web应用 (`web/`)

基于React和Vite的Web应用,支持:
- 虚拟试穿功能
- 文生图服装生成
- Volcengine和Gemini多AI提供商支持

**开发运行:**
```bash
cd web
npm install
npm run dev
```

**部署:**
可以部署到Vercel、Netlify等静态托管平台。

详细文档请查看 `web/README.md`

### 微信小程序 (`miniapp/`)

基于Taro框架的微信小程序版本,功能与Web版基本一致。

**开发运行:**
```bash
cd miniapp
npm install
npm run dev:weapp
```

然后使用微信开发者工具打开 `miniapp/dist` 目录。

**构建:**
```bash
npm run build:weapp
```

## 共享代码

两个项目共享以下代码结构:
- `services/` - 业务逻辑层(图像生成服务)
- 类型定义
- 常量配置

## 技术栈

### Web版
- React 19
- Vite
- Tailwind CSS (CDN)
- Axios
- Volcengine Seedream 4.0 / Gemini API

### 小程序版
- Taro 4.1.8
- React 18
- Sass
- Volcengine Seedream 4.0 API

## 环境变量配置

两个项目都需要配置环境变量文件 `.env.local`:

```env
# 图像生成服务提供商: 'volcengine' | 'gemini'
VITE_IMAGE_PROVIDER=volcengine

# Gemini配置
VITE_GEMINI_API_KEY=your_gemini_api_key

# Volcengine配置
VITE_ARK_API_KEY=your_volcengine_api_key
```

## 开发指南

1. 首次克隆仓库后,分别进入 `web/` 和 `miniapp/` 目录安装依赖
2. 配置各自的 `.env.local` 文件
3. 分别运行各项目的开发命令

## 注意事项

- Web版和小程序版使用不同的React版本(Web用19,小程序用18),因此分开维护
- 小程序需要在微信公众平台配置服务器域名白名单
- Volcengine API调用可能需要较长时间,注意超时设置

## License

MIT
