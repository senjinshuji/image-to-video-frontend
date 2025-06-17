import axios from 'axios';
import { mutate } from 'swr';

// API Base URL - Render FastAPI
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface Row {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ImageJob {
  id: string;
  prompt: string;
  image_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  created_at: string;
}

export interface VideoJob {
  id: string;
  source_image_url: string;
  motion_prompt: string;
  model: 'veo' | 'kling';
  video_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error_message?: string;
  created_at: string;
}

// API Functions
export const api = {
  // Export apiClient for direct use
  apiClient,
  // Rows
  async getRows() {
    const { data } = await apiClient.get<Row[]>('/rows');
    return data;
  },

  // Image Jobs
  async createImageJob(prompt: string, imageUrl?: string) {
    const { data } = await apiClient.post<ImageJob>('/image-jobs', {
      prompt,
      reference_image_url: imageUrl,
      size: '1024x1024'
    });
    return data;
  },

  async getImageJob(id: string) {
    const { data } = await apiClient.get<ImageJob>(`/image-jobs/${id}`);
    return data;
  },

  async rebuildImageJob(id: string, prompt: string) {
    const { data } = await apiClient.post<ImageJob>(`/image-jobs/${id}/rebuild`, {
      prompt,
    });
    // Invalidate the cache for this job
    mutate(`/image-jobs/${id}`);
    return data;
  },

  // Video Jobs
  async createVideoJob(imageUrl: string, motionText: string, model: 'veo' | 'kling') {
    const { data } = await apiClient.post<VideoJob>('/video-jobs', {
      source_image_url: imageUrl,
      motion_prompt: motionText,
      model,
    });
    return data;
  },

  async getVideoJob(id: string) {
    const { data } = await apiClient.get<VideoJob>(`/video-jobs/${id}`);
    return data;
  },

  // Finalize
  async finalize(rowId: string, videoUrl: string) {
    const { data } = await apiClient.post('/finalize', {
      row_id: rowId,
      video_url: videoUrl,
    });
    // Invalidate rows cache
    mutate('/rows');
    return data;
  },
};

// SWR fetcher
export const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

// Export axios instance for custom requests
export default apiClient;