import axios from 'axios';

export interface AnalyzeImageRequest {
  imageUrl: string;
}

export interface AnalyzeImageResponse {
  yaml: string;
  preview: {
    description: string;
    mainSubjects: string[];
    mood: string;
  };
}

const YAML_TEMPLATE = `scene:
  description: 
  mood: 
  time_of_day: 
  weather: 

subjects:
  - type: 
    description: 
    position: 
    attributes:
      - 

environment:
  setting: 
  foreground: 
  background: 
  lighting: 

visual_style:
  art_style: 
  color_palette: 
  composition: 

technical:
  camera_angle: 
  focal_length: 
  depth_of_field: `;

class O3ImageAnalyzer {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  async analyzeImage(imageUrl: string): Promise<AnalyzeImageResponse> {
    const systemPrompt = `You are an expert image analyst. Analyze the provided image and generate a structured YAML description following this exact format:

${YAML_TEMPLATE}

Important guidelines:
1. Fill in ALL fields with specific, detailed descriptions in English
2. Use concrete, descriptive terms (avoid vague words)
3. For subjects, list all main elements in the image
4. Be accurate about technical aspects like camera angle and composition
5. Ensure the YAML is valid and properly formatted
6. Do not add any extra fields or explanations outside the YAML`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-vision-preview', // O3モデルが利用可能になったら変更
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and generate the YAML description:'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const yamlContent = response.data.choices[0].message.content;
      
      // プレビュー情報を抽出
      const preview = this.extractPreviewFromYaml(yamlContent);
      
      return {
        yaml: yamlContent,
        preview
      };
    } catch (error: any) {
      console.error('Image analysis error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  private extractPreviewFromYaml(yaml: string): AnalyzeImageResponse['preview'] {
    // 簡易的なYAML解析（実際のプロダクションではyamlライブラリを使用）
    const lines = yaml.split('\n');
    let description = '';
    let mood = '';
    const mainSubjects: string[] = [];
    
    for (const line of lines) {
      if (line.includes('description:') && !description) {
        description = line.split('description:')[1]?.trim() || '';
      }
      if (line.includes('mood:') && !mood) {
        mood = line.split('mood:')[1]?.trim() || '';
      }
      if (line.includes('type:') && line.trim().startsWith('-')) {
        const subject = line.split('type:')[1]?.trim();
        if (subject) mainSubjects.push(subject);
      }
    }
    
    return {
      description: description || 'Image analysis completed',
      mainSubjects: mainSubjects.length > 0 ? mainSubjects : ['No specific subjects identified'],
      mood: mood || 'neutral'
    };
  }

  // YAMLから自然言語プロンプトへの変換
  async convertYamlToPrompt(yaml: string): Promise<string> {
    const systemPrompt = `Convert the following YAML description into a natural, flowing image generation prompt. 
The prompt should be detailed but concise, incorporating all the important elements from the YAML.
Focus on visual elements, style, and composition. Output only the prompt text, nothing else.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: yaml
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('YAML to prompt conversion error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }
}

// シングルトンインスタンス
let o3Analyzer: O3ImageAnalyzer | null = null;

export function getO3Analyzer(): O3ImageAnalyzer {
  if (!o3Analyzer) {
    o3Analyzer = new O3ImageAnalyzer();
  }
  return o3Analyzer;
}