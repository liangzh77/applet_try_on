/**
 * Volcengine Seedream 4.0 图像生成服务适配器
 */
import axios from 'axios';
import type { ImageGenerationProvider } from '../imageGenerationService';

interface VolcengineImageResponse {
  data: Array<{
    url?: string;
    b64_image?: string;
    size?: string;
  }>;
}

class VolcengineProvider implements ImageGenerationProvider {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    // 使用Vite代理,API Key在服务端处理
    this.apiKey = import.meta.env.VITE_ARK_API_KEY || '';
    // 使用代理路径而不是直接访问Volcengine API
    this.baseURL = '/api/volcengine';
    this.model = import.meta.env.VITE_ARK_MODEL || 'doubao-seedream-4-0-250828';

    if (!this.apiKey) {
      console.warn('VITE_ARK_API_KEY is not configured, using proxy mode');
    }
  }

  /**
   * 生成服装图像(文生图)
   */
  async generateGarmentImage(prompt: string): Promise<string> {
    try {
      const fullPrompt = `生成一张高质量、专业的服装图片:${prompt}。要求:平铺或挂在衣架上,背景干净简洁,服装清晰可见且居中显示。`;

      const response = await axios.post<VolcengineImageResponse>(
        `${this.baseURL}/images/generations`,
        {
          model: this.model,
          prompt: fullPrompt,
          size: '2K',
          response_format: 'b64_json', // 使用base64格式更稳定
          watermark: false, // 根据需要调整
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Authorization header在Vite代理中自动添加
          },
          timeout: 60000, // 60秒超时
        }
      );

      // 详细日志用于调试
      console.log('Volcengine Garment API Response:', {
        status: response.status,
        hasData: !!response.data,
        dataStructure: response.data ? Object.keys(response.data) : [],
        fullData: response.data
      });

      const imageData = response.data.data?.[0];
      if (!imageData) {
        console.error('No image data in response:', response.data);
        throw new Error('No image generated from Volcengine API');
      }

      // 返回base64 data URI
      // 注意: Volcengine API使用b64_json字段名
      if (imageData.b64_json) {
        return `data:image/jpeg;base64,${imageData.b64_json}`;
      } else if (imageData.b64_image) {
        return `data:image/png;base64,${imageData.b64_image}`;
      } else if (imageData.url) {
        // 如果返回URL,需要下载并转换为base64
        return await this.urlToBase64(imageData.url);
      }

      console.error('Invalid image data format:', imageData);
      throw new Error('Invalid response format from Volcengine API');
    } catch (error) {
      console.error('Volcengine Generate Garment Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Volcengine API Error: ${message}`);
      }
      throw error;
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

      const response = await axios.post<VolcengineImageResponse>(
        `${this.baseURL}/images/generations`,
        {
          model: this.model,
          prompt: prompt,
          // 多图输入:人物图+服装图
          image: [
            `data:image/png;base64,${personImageData}`,
            `data:image/png;base64,${garmentImageData}`
          ],
          size: '2K',
          response_format: 'b64_json',
          watermark: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Authorization header在Vite代理中自动添加
          },
          timeout: 120000, // 试穿生成可能需要更长时间
        }
      );

      // 详细日志用于调试
      console.log('Volcengine API Response:', {
        status: response.status,
        hasData: !!response.data,
        dataStructure: response.data ? Object.keys(response.data) : [],
        fullData: response.data
      });

      const imageData = response.data.data?.[0];
      if (!imageData) {
        console.error('No image data in response:', response.data);
        throw new Error('No try-on result generated from Volcengine API');
      }

      // 注意: Volcengine API使用b64_json字段名
      if (imageData.b64_json) {
        return `data:image/jpeg;base64,${imageData.b64_json}`;
      } else if (imageData.b64_image) {
        return `data:image/png;base64,${imageData.b64_image}`;
      } else if (imageData.url) {
        return await this.urlToBase64(imageData.url);
      }

      console.error('Invalid image data format:', imageData);
      throw new Error('Invalid response format from Volcengine API');
    } catch (error) {
      console.error('Volcengine Try-On Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Volcengine试穿失败: ${message}`);
      }
      throw error;
    }
  }

  /**
   * 将URL转换为base64 data URI
   */
  private async urlToBase64(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('Error converting URL to base64:', error);
      throw new Error('Failed to download generated image');
    }
  }
}

export const volcengineProvider = new VolcengineProvider();
