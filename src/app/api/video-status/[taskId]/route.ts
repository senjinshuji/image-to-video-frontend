import { NextRequest, NextResponse } from 'next/server';
import { getKlingClient } from '@/lib/kling';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const klingClient = getKlingClient();
    const status = await klingClient.checkTaskStatus(taskId);
    
    return NextResponse.json(status);
    
  } catch (error: any) {
    console.error('Status check error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to check video status' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}