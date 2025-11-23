import { getImageGenerationProvider } from "./imageGenerationService";

// 获取当前配置的图像生成提供商(Gemini或Volcengine)
let providerPromise: Promise<any> | null = null;

const getProvider = () => {
  if (!providerPromise) {
    providerPromise = getImageGenerationProvider();
  }
  return providerPromise;
};

/**
 * Converts a URL or File object to a Base64 string (without the data prefix for the API).
 */
export const urlToBase64 = async (url: string): Promise<string> => {
  // If it's already a data URI
  if (url.startsWith('data:')) {
    return url.split(',')[1];
  }

  // Fetch and convert
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    throw new Error("Failed to load image. Possible CORS issue with the image source.");
  }
};

/**
 * Generates a garment image based on a text prompt.
 */
export const generateGarmentImage = async (prompt: string): Promise<string> => {
  const provider = await getProvider();
  return provider.generateGarmentImage(prompt);
};

/**
 * Generates a try-on image (Person + Garment).
 */
export const generateTryOnImage = async (personBase64: string, garmentBase64: string): Promise<string> => {
  const provider = await getProvider();
  return provider.generateTryOnImage(personBase64, garmentBase64);
};