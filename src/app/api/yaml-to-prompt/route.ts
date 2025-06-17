import { NextRequest, NextResponse } from 'next/server';
import { getO3Analyzer } from '@/lib/o3-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body: { yaml: string } = await request.json();
    
    if (!body.yaml) {
      return NextResponse.json(
        { error: 'YAML content is required' },
        { status: 400 }
      );
    }

    const analyzer = getO3Analyzer();
    
    // YAMLをプロンプトに変換
    const prompt = await analyzer.convertYamlToPrompt(body.yaml);
    
    return NextResponse.json({ prompt });
    
  } catch (error: any) {
    console.error('YAML conversion error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to convert YAML to prompt' },
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