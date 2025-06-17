import { NextRequest, NextResponse } from 'next/server';
import { getO3Analyzer, AnalyzeImageRequest } from '@/lib/o3-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeImageRequest = await request.json();
    
    if (!body.imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const analyzer = getO3Analyzer();
    
    // 画像解析
    const result = await analyzer.analyzeImage(body.imageUrl);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Image analysis error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
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