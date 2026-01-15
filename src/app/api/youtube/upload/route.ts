import { NextRequest, NextResponse } from 'next/server';
import { uploadToYouTube } from '@/lib/youtube/uploader';

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, muxPlaybackId, title, description, category } = body;

    // Validate required fields
    if (!contentId || !muxPlaybackId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: contentId, muxPlaybackId, title' },
        { status: 400 }
      );
    }

    console.log(`[YouTube Upload API] Received request for contentId: ${contentId}`);

    const result = await uploadToYouTube({
      contentId,
      muxPlaybackId,
      title,
      description,
      category,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        youtubeVideoId: result.youtubeVideoId,
        youtubeUrl: result.youtubeUrl,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to upload to YouTube' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[YouTube Upload API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

