<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI 霓裳 - 智能虚拟试穿应用

基于AI图像生成技术的虚拟试穿应用,支持多种AI服务提供商。

## 支持的AI服务

- **Volcengine (火山引擎)** - Seedream 4.0 多图融合 (默认)
- **Google Gemini** - Gemini 2.5 Flash Image

## 本地运行

**前置要求:** Node.js 16+

1. 安装依赖:
   ```bash
   npm install
   ```

2. 配置环境变量:
   - 复制 `.env.example` 为 `.env.local`
   - 根据你选择的AI服务提供商,配置对应的API Key:

   ### 使用 Volcengine (推荐)
   ```bash
   IMAGE_PROVIDER=volcengine
   ARK_API_KEY=your_ark_api_key_here
   ```
   获取API Key: https://console.volcengine.com/ark/region:ark+cn-beijing/apikey

   ### 使用 Gemini
   ```bash
   IMAGE_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   获取API Key: https://ai.google.dev/

3. 运行应用:
   ```bash
   npm run dev
   ```

## 切换AI服务提供商

只需修改 `.env.local` 中的 `IMAGE_PROVIDER` 参数:
- `IMAGE_PROVIDER=volcengine` - 使用火山引擎
- `IMAGE_PROVIDER=gemini` - 使用Google Gemini

## 项目结构

```
services/
  ├── imageGenerationService.ts    # 统一服务抽象层
  ├── geminiService.ts              # 对外暴露的API接口
  └── providers/
      ├── volcengineProvider.ts     # Volcengine适配器
      └── geminiProvider.ts         # Gemini适配器
```
