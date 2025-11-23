/**
 * 图像生成服务的统一抽象接口
 * 支持多种AI图像生成提供商
 */

export interface ImageGenerationProvider {
  /**
   * 生成服装图像(文生图)
   */
  generateGarmentImage(prompt: string): Promise<string>;

  /**
   * 生成虚拟试穿图像(图生图)
   * @param personBase64 - 人物图片的base64编码
   * @param garmentBase64 - 服装图片的base64编码
   */
  generateTryOnImage(personBase64: string, garmentBase64: string): Promise<string>;
}

/**
 * Provider配置类型
 */
export type ProviderType = 'gemini' | 'volcengine';

/**
 * 获取当前配置的图像生成提供商
 */
export function getImageGenerationProvider(): ImageGenerationProvider {
  // Vite环境变量访问方式: import.meta.env.VITE_*
  const providerType = (import.meta.env.VITE_IMAGE_PROVIDER || 'volcengine') as ProviderType;

  switch (providerType) {
    case 'gemini':
      // 延迟导入,避免不必要的依赖加载
      return import('./providers/geminiProvider').then(m => m.geminiProvider);
    case 'volcengine':
      return import('./providers/volcengineProvider').then(m => m.volcengineProvider);
    default:
      throw new Error(`Unsupported image provider: ${providerType}`);
  }
}
