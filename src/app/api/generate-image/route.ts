import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, GenerateImageRequest } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const openAIClient = getOpenAIClient();
    
    // 画像生成
    const imageUrl = await openAIClient.generateImage(
      body.prompt,
      body.size || '1024x1024'
    );
    
    return NextResponse.json({
      imageUrl,
      prompt: body.prompt
    });
    
  } catch (error: any) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}