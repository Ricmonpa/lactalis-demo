import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint para actualizar la URL del video de YouTube
 * POST /api/admin/update-video-url
 * 
 * Body:
 * {
 *   "contentId": "demo-content-1",
 *   "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
 *   "youtubeVideoId": "VIDEO_ID"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, youtubeUrl, youtubeVideoId } = body;

    // Validar parámetros
    if (!contentId) {
      return NextResponse.json(
        { success: false, error: 'contentId is required' },
        { status: 400 }
      );
    }

    if (!youtubeUrl && !youtubeVideoId) {
      return NextResponse.json(
        { success: false, error: 'youtubeUrl or youtubeVideoId is required' },
        { status: 400 }
      );
    }

    // Extraer videoId de la URL si solo se proporciona la URL
    let finalVideoId = youtubeVideoId;
    if (!finalVideoId && youtubeUrl) {
      // Intentar extraer el ID de diferentes formatos de URL de YouTube
      const urlPatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
      ];
      
      for (const pattern of urlPatterns) {
        const match = youtubeUrl.match(pattern);
        if (match && match[1]) {
          finalVideoId = match[1];
          break;
        }
      }
    }

    // Construir URL completa si solo se proporciona el ID
    let finalYoutubeUrl = youtubeUrl;
    if (!finalYoutubeUrl && finalVideoId) {
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${finalVideoId}`;
    }

    console.log(`[Update Video URL] Updating video for contentId: ${contentId}`);
    console.log(`  YouTube URL: ${finalYoutubeUrl}`);
    console.log(`  Video ID: ${finalVideoId}`);

    // Buscar VideoAsset por contentId
    const videoAsset = await prisma.videoAsset.findUnique({
      where: { contentId },
    });

    if (!videoAsset) {
      return NextResponse.json(
        { 
          success: false, 
          error: `VideoAsset not found for contentId: ${contentId}. Run /api/admin/seed-demo first.` 
        },
        { status: 404 }
      );
    }

    // Actualizar VideoAsset
    const updated = await prisma.videoAsset.update({
      where: { contentId },
      data: {
        youtubeUrl: finalYoutubeUrl,
        youtubeVideoId: finalVideoId,
        youtubeStatus: 'uploaded',
      },
    });

    console.log(`[Update Video URL] ✅ Video updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Video URL updated successfully',
      data: {
        contentId: updated.contentId,
        youtubeUrl: updated.youtubeUrl,
        youtubeVideoId: updated.youtubeVideoId,
        youtubeStatus: updated.youtubeStatus,
      },
    });
  } catch (error: any) {
    console.error('[Update Video URL] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update video URL',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para obtener la URL actual del video
 * GET /api/admin/update-video-url?contentId=demo-content-1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId') || 'demo-content-1';

    const videoAsset = await prisma.videoAsset.findUnique({
      where: { contentId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!videoAsset) {
      return NextResponse.json(
        {
          success: false,
          error: `VideoAsset not found for contentId: ${contentId}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: {
          id: videoAsset.content.id,
          title: videoAsset.content.title,
          description: videoAsset.content.description,
        },
        video: {
          youtubeUrl: videoAsset.youtubeUrl,
          youtubeVideoId: videoAsset.youtubeVideoId,
          youtubeStatus: videoAsset.youtubeStatus,
          muxUrl: videoAsset.muxUrl,
          muxStatus: videoAsset.muxStatus,
        },
      },
    });
  } catch (error: any) {
    console.error('[Update Video URL] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get video URL',
      },
      { status: 500 }
    );
  }
}

