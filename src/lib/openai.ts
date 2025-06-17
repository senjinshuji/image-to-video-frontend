import axios from 'axios';

export interface GenerateImageRequest {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
}

export interface GenerateImageResponse {
  imageUrl: string;
  prompt: string;
}

class OpenAIClient {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  async generateImage(prompt: string, size: string = '1024x1024'): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: size
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.data && response.data.data[0]) {
        // APIがURLを返す場合
        if (response.data.data[0].url) {
          return response.data.data[0].url;
        }
        // APIがBase64を返す場合
        if (response.data.data[0].b64_json) {
          return `data:image/png;base64,${response.data.data[0].b64_json}`;
        }
      }

      throw new Error('No image data in response');
    } catch (error: any) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }
}

// シングルトンインスタンス
let openAIClient: OpenAIClient | null = null;

export function getOpenAIClient(): OpenAIClient {
  if (!openAIClient) {
    openAIClient = new OpenAIClient();
  }
  return openAIClient;
}