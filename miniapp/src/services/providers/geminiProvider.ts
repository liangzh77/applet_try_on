/**
 * Google Gemini 图像生成服务适配器
 */
import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageGenerationProvider } from '../imageGenerationService';

class GeminiProvider implements ImageGenerationProvider {
  private ai: GoogleGenAI;

  constructor() {
    // Vite环境变量访问方式: import.meta.env.VITE_*
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured in .env.local');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * 生成服装图像(文生图)
   */
  async generateGarmentImage(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `Generate a high-quality, photorealistic image of a piece of clothing: ${prompt}.
                     Flat lay or displayed on a mannequin with a neutral, clean background.
                     The clothing should be clearly visible and centered.`,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("No image data generated.");

    } catch (error) {
      console.error("Gemini Generate Garment Error:", error);
      throw error;
    }
  }

  /**
   * 生成虚拟试穿图像(图生图)
   */
  async generateTryOnImage(personBase64: string, garmentBase64: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: personBase64,
              },
            },
            {
              inlineData: {
                mimeType: 'image/png',
                data: garmentBase64,
              },
            },
            {
              text: `Virtual Try-On Task:
                     Image 1 is the user/model.
                     Image 2 is the garment.
                     Generate a new, photorealistic image of the person from Image 1 wearing the garment from Image 2.

                     Requirements:
                     1. Retain the identity, pose, and body shape of the person in Image 1 as much as possible.
                     2. Adapt the garment to fit the person's body naturally.
                     3. High resolution, studio lighting, cinematic quality.
                     4. Return only the generated image.`,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("No try-on result generated.");

    } catch (error) {
      console.error("Gemini Try-On Error:", error);
      throw error;
    }
  }
}

export const geminiProvider = new GeminiProvider();
