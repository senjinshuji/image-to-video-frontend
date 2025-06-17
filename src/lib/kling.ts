import jwt from 'jsonwebtoken';
import axios from 'axios';

export interface KlingVideoRequest {
  imageUrl: string;
  prompt: string;
  duration?: number;
}

export interface KlingVideoResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

export interface KlingTaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  error?: string;
}

class KlingClient {
  private accessKey: string;
  private secretKey: string;
  private baseUrl = 'https://api-singapore.klingai.com/v1';

  constructor() {
    this.accessKey = process.env.KLING_ACCESS_KEY || '';
    this.secretKey = process.env.KLING_SECRET_KEY || '';
    
    if (!this.accessKey || !this.secretKey) {
      throw new Error('KLING API keys not configured');
    }
  }

  private generateJWT(): string {
    const payload = {
      iss: this.accessKey,
      exp: Math.floor(Date.now() / 1000) + 1800, // 30分有効
      nbf: Math.floor(Date.now() / 1000) - 5      // 5秒前から有効
    };

    return jwt.sign(payload, this.secretKey, {
      algorithm: 'HS256',
      header: { alg: 'HS256', typ: 'JWT' }
    });
  }

  async generateVideo(imageUrl: string, prompt: string, duration: number = 5): Promise<{ taskId: string }> {
    const token = this.generateJWT();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const data = {
      model: 'kling-v1',
      image: imageUrl,
      prompt: prompt,
      duration: String(duration), // 文字列として送信
      aspect_ratio: '16:9',
      cfg_scale: 0.5,
      mode: 'std'
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/videos/image2video`,
        data,
        { headers }
      );
      
      if (response.data.code !== 0) {
        throw new Error(response.data.message || 'Unknown error');
      }
      
      return { taskId: response.data.data.task_id };
    } catch (error: any) {
      console.error('Error generating video:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async checkTaskStatus(taskId: string): Promise<KlingTaskStatus> {
    const token = this.generateJWT();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.get(
        `${this.baseUrl}/videos/image2video/${taskId}`,
        { headers }
      );
      
      if (response.data.code !== 0) {
        throw new Error(response.data.message || 'Unknown error');
      }
      
      const data = response.data.data;
      let status: KlingTaskStatus['status'] = 'processing';
      let progress = 0;
      let videoUrl: string | undefined;
      
      switch (data.task_status) {
        case 'submitted':
          status = 'pending';
          break;
        case 'processing':
          status = 'processing';
          progress = 50; // 推定進捗
          break;
        case 'succeed':
          status = 'completed';
          progress = 100;
          videoUrl = data.works?.[0]?.url;
          break;
        case 'failed':
          status = 'failed';
          break;
      }
      
      return {
        taskId,
        status,
        progress,
        videoUrl,
        error: status === 'failed' ? (data.task_status_msg || 'Video generation failed') : undefined
      };
    } catch (error: any) {
      console.error('Error checking task status:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  // Base64画像データの処理
  processImageUrl(imageUrl: string): string {
    // データURLの場合、Base64部分のみを抽出
    if (imageUrl.startsWith('data:')) {
      const base64Part = imageUrl.split(',')[1];
      return base64Part || imageUrl;
    }
    // HTTPSのURLの場合はそのまま返す
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // それ以外（既にBase64の場合）はそのまま返す
    return imageUrl;
  }
}

// シングルトンインスタンス
let klingClient: KlingClient | null = null;

export function getKlingClient(): KlingClient {
  if (!klingClient) {
    klingClient = new KlingClient();
  }
  return klingClient;
}