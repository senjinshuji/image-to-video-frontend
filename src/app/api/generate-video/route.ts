import { NextRequest, NextResponse } from 'next/server';
import { getKlingClient, KlingVideoRequest } from '@/lib/kling';

export async function POST(request: NextRequest) {
  try {
    const body: KlingVideoRequest = await request.json();
    
    if (!body.imageUrl || !body.prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl and prompt' },
        { status: 400 }
      );
    }

    const klingClient = getKlingClient();
    
    // 画像URLの処理（Base64の場合は純粋なBase64文字列に変換）
    const processedImageUrl = klingClient.processImageUrl(body.imageUrl);
    
    // 動画生成リクエスト
    const result = await klingClient.generateVideo(
      processedImageUrl,
      body.prompt,
      body.duration || 5
    );
    
    return NextResponse.json({
      taskId: result.taskId,
      status: 'pending'
    });
    
  } catch (error: any) {
    console.error('Video generation error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
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