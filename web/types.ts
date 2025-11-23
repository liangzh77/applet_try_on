export interface ImageItem {
  id: string;
  url: string; // Can be a remote URL or a data URI (base64)
  isGenerated?: boolean;
}

export interface HistoryItem {
  id: string;
  personImage: string;
  garmentImage: string;
  resultImage: string;
  timestamp: number;
}

export enum Step {
  PERSON = 1,
  GARMENT = 2,
  RESULT = 3,
}