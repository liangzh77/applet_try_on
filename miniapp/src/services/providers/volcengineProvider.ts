/**
 * Volcengine Seedream 4.0 图像生成服务适配器 - 小程序版
 */
import Taro from '@tarojs/taro';
import type { ImageGenerationProvider } from '../imageGenerationService';

interface VolcengineImageResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
    b64_image?: string;
    size?: string;
  }>;
}

class VolcengineProvider implements ImageGenerationProvider {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    // 小程序需要配置服务器域名,通过云函数或自己的后端API调用Volcengine
    // TODO: 配置云函数URL或后端API地址
    this.apiKey = process.env.VITE_ARK_API_KEY || '';
    this.baseURL = 'https://ark.cn-beijing.volces.com/api/v3';
    this.model = process.env.VITE_ARK_MODEL || 'doubao-seedream-4-0-250828';
  }

  /**
   * 生成服装图像(文生图)
   */
  async generateGarmentImage(prompt: string): Promise<string> {
    try {
      const fullPrompt = `生成一张高质量、专业的服装图片:${prompt}。要求:平铺或挂在衣架上,背景干净简洁,服装清晰可见且居中显示。`;

      const response = await Taro.request({
        url: `${this.baseURL}/images/generations`,
        method: 'POST',
        data: {
          model: this.model,
          prompt: fullPrompt,
          size: '2K',
          response_format: 'b64_json',
          watermark: false,
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 60000,
      });

      // 详细日志用于调试
      console.log('Volcengine Garment API Response:', {
        statusCode: response.statusCode,
        hasData: !!response.data,
        fullData: response.data
      });

      if (response.statusCode !== 200) {
        throw new Error(`API request failed with status ${response.statusCode}`);
      }

      const responseData = response.data as VolcengineImageResponse;
      const imageData = responseData.data?.[0];
      if (!imageData) {
        console.error('No image data in response:', response.data);
        throw new Error('No image generated from Volcengine API');
      }

      // 返回base64 data URI
      if (imageData.b64_json) {
        return `data:image/jpeg;base64,${imageData.b64_json}`;
      } else if (imageData.b64_image) {
        return `data:image/png;base64,${imageData.b64_image}`;
      } else if (imageData.url) {
        return await this.urlToBase64(imageData.url);
      }

      console.error('Invalid image data format:', imageData);
      throw new Error('Invalid response format from Volcengine API');
    } catch (error: any) {
      console.error('Volcengine Generate Garment Error:', error);
      throw new Error(`Volcengine API Error: ${error.message || error}`);
    }
  }

  /**
   * 生成虚拟试穿图像(多图融合)
   */
  async generateTryOnImage(personBase64: string, garmentBase64: string): Promise<string> {
    try {
      // 将base64转换为volcengine需要的格式
      const personImageData = personBase64.startsWith('data:')
        ? personBase64.split(',')[1]
        : personBase64;

      const garmentImageData = garmentBase64.startsWith('data:')
        ? garmentBase64.split(',')[1]
        : garmentBase64;

      const prompt = `虚拟试穿任务:将第二张图片中的服装穿到第一张图片中的人物身上。
要求:
1. 保持人物的身份特征、姿势和体型
2. 服装要自然贴合人物身体
3. 高分辨率、专业摄影级质量
4. 保持光影和谐,看起来真实自然`;

      const response = await Taro.request({
        url: `${this.baseURL}/images/generations`,
        method: 'POST',
        data: {
          model: this.model,
          prompt: prompt,
          image: [
            `data:image/png;base64,${personImageData}`,
            `data:image/png;base64,${garmentImageData}`
          ],
          size: '2K',
          response_format: 'b64_json',
          watermark: false,
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 120000,
      });

      // 详细日志用于调试
      console.log('Volcengine API Response:', {
        statusCode: response.statusCode,
        hasData: !!response.data,
        fullData: response.data
      });

      if (response.statusCode !== 200) {
        throw new Error(`API request failed with status ${response.statusCode}`);
      }

      const responseData = response.data as VolcengineImageResponse;
      const imageData = responseData.data?.[0];
      if (!imageData) {
        console.error('No image data in response:', response.data);
        throw new Error('No try-on result generated from Volcengine API');
      }

      // 返回base64 data URI
      if (imageData.b64_json) {
        return `data:image/jpeg;base64,${imageData.b64_json}`;
      } else if (imageData.b64_image) {
        return `data:image/png;base64,${imageData.b64_image}`;
      } else if (imageData.url) {
        return await this.urlToBase64(imageData.url);
      }

      console.error('Invalid image data format:', imageData);
      throw new Error('Invalid response format from Volcengine API');
    } catch (error: any) {
      console.error('Volcengine Try-On Error:', error);
      throw new Error(`Volcengine试穿失败: ${error.message || error}`);
    }
  }

  /**
   * 将URL转换为base64 data URI (小程序版)
   */
  private async urlToBase64(url: string): Promise<string> {
    try {
      const response = await Taro.request({
        url: url,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      if (response.statusCode !== 200) {
        throw new Error(`Failed to download image: ${response.statusCode}`);
      }

      // 小程序环境下ArrayBuffer转base64
      const base64 = Taro.arrayBufferToBase64(response.data as ArrayBuffer);
      return `data:image/png;base64,${base64}`;
    } catch (error: any) {
      console.error('Error converting URL to base64:', error);
      throw new Error('Failed to download generated image');
    }
  }
}

export const volcengineProvider = new VolcengineProvider();
