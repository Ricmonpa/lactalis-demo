import { NextRequest, NextResponse } from 'next/server';
import { sendVideo } from '@/lib/whatsapp/send-video';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint para probar el envío completo del video y flujo de quiz
 * POST /api/admin/test-send-video
 * 
 * Body (opcional):
 * {
 *   "userPhone": "+5214774046609",  // Opcional, usa DEMO_TEST_PHONE del .env
 *   "contentId": "demo-content-1"   // Opcional, usa el demo por defecto
 * }
 * 
 * GET /api/admin/test-send-video
 * Envía el video usando valores por defecto
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userPhone = body.userPhone || process.env.DEMO_TEST_PHONE || '+5214774046609';
    const contentId = body.contentId || 'demo-content-1';

    console.log(`[Test Send Video] Starting test for ${userPhone}, contentId: ${contentId}`);

    // Verificar que el contenido existe
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        videoAsset: true,
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: `Content not found: ${contentId}. Run /api/admin/seed-demo first.`,
        },
        { status: 404 }
      );
    }

    if (!content.videoAsset) {
      return NextResponse.json(
        {
          success: false,
          error: `VideoAsset not found for content: ${contentId}`,
        },
        { status: 404 }
      );
    }

    if (!content.videoAsset.youtubeUrl && !content.videoAsset.muxUrl) {
      return NextResponse.json(
        {
          success: false,
          error: `No video URL configured. Update the video URL first using /api/admin/update-video-url`,
          videoAsset: {
            youtubeUrl: content.videoAsset.youtubeUrl,
            muxUrl: content.videoAsset.muxUrl,
          },
        },
        { status: 400 }
      );
    }

    if (!content.quiz) {
      return NextResponse.json(
        {
          success: false,
          error: `Quiz not found for content: ${contentId}`,
        },
        { status: 404 }
      );
    }

    if (content.quiz.questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Quiz has no questions. Run /api/admin/seed-demo to create questions.`,
        },
        { status: 400 }
      );
    }

    // Enviar el video (esto automáticamente iniciará el quiz después de 30 segundos)
    const result = await sendVideo({
      userPhone,
      contentId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send video',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video sent successfully! Quiz will start automatically in 30 seconds.',
      data: {
        userPhone,
        content: {
          id: content.id,
          title: content.title,
          description: content.description,
        },
        video: {
          youtubeUrl: content.videoAsset.youtubeUrl,
          muxUrl: content.videoAsset.muxUrl,
          videoUrl: content.videoAsset.youtubeUrl || content.videoAsset.muxUrl,
        },
        quiz: {
          id: content.quiz.id,
          title: content.quiz.title,
          questionsCount: content.quiz.questions.length,
          passingScore: content.quiz.passingScore,
          rewardCoins: content.quiz.rewardCoins,
        },
        timeline: {
          now: 'Video sent',
          in30Seconds: 'Quiz will start automatically',
          userAction: 'User should respond with numbers (1, 2, 3, or 4)',
        },
      },
      instructions: [
        '1. Check your WhatsApp for the video message',
        '2. Wait 30 seconds for the quiz to start automatically',
        '3. Answer the quiz questions by replying with numbers (1, 2, 3, or 4)',
        '4. Receive feedback after each answer',
        '5. Get final results and L-Coins if you pass',
      ],
    });
  } catch (error: any) {
    console.error('[Test Send Video] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test video',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Envía el video usando valores por defecto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('phone') || process.env.DEMO_TEST_PHONE || '+5214774046609';
    const contentId = searchParams.get('contentId') || 'demo-content-1';

    // Usar el mismo código del POST
    const response = await POST(
      new Request(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPhone, contentId }),
      })
    );

    return response;
  } catch (error: any) {
    console.error('[Test Send Video] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test video',
      },
      { status: 500 }
    );
  }
}

