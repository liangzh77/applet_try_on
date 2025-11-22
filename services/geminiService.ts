import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a real production app, API keys should be handled securely (e.g., via backend proxy).
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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
  try {
    const response = await ai.models.generateContent({
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
};

/**
 * Generates a try-on image (Person + Garment).
 */
export const generateTryOnImage = async (personBase64: string, garmentBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
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
};