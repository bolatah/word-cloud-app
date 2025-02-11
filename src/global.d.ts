import { WordCloud, WordCloudAdding } from "./app/word-cloud.model";
export interface DatabaseRow {
  id: number;
  name: string;
  category: string;
  words: string;
}

declare global {
  interface Window {
    electron: {
      initializeDatabase: () => Promise<void>;
      getDbPath: () => Promise<string>;
      getClouds: () => Promise<DatabaseRow[]>;
      addCloud: (wordCloud : WordCloudAdding) => Promise<WordCloud>;
      updateCloud: (wordCloud : WordCloud) => Promise<WordCloud>;
      deleteCloud: (id: number) => Promise<void>;
      getCloud: (id: number) => Promise<any>;
      setWallpaper: (base64Image: string) => void;
    };
  }
}

export {};
