import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint para verificar que existen los datos necesarios para el demo
 * GET /api/admin/check-data
 */
export async function GET(request: NextRequest) {
  try {
    const contentId = 'demo-content-1';

    // Verificar contenido
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
      return NextResponse.json({
        success: false,
        message: '❌ No se encontró contenido. Ejecuta /api/admin/seed-demo primero.',
        missing: ['content'],
      });
    }

    const issues: string[] = [];
    const data: any = {
      content: {
        id: content.id,
        title: content.title,
        description: content.description,
        exists: true,
      },
    };

    // Verificar video
    if (!content.videoAsset) {
      issues.push('VideoAsset no encontrado');
      data.video = { exists: false };
    } else {
      data.video = {
        exists: true,
        youtubeUrl: content.videoAsset.youtubeUrl,
        youtubeVideoId: content.videoAsset.youtubeVideoId,
        hasYoutubeUrl: !!content.videoAsset.youtubeUrl,
      };
      if (!content.videoAsset.youtubeUrl) {
        issues.push('⚠️ YouTube URL no configurada. Actualiza el VideoAsset con tu video real.');
      }
    }

    // Verificar quiz
    if (!content.quiz) {
      issues.push('Quiz no encontrado');
      data.quiz = { exists: false };
    } else {
      data.quiz = {
        exists: true,
        id: content.quiz.id,
        title: content.quiz.title,
        questionsCount: content.quiz.questions.length,
        passingScore: content.quiz.passingScore,
        rewardCoins: content.quiz.rewardCoins,
        hasQuestions: content.quiz.questions.length > 0,
      };
      if (content.quiz.questions.length === 0) {
        issues.push('Quiz no tiene preguntas');
      }
    }

    return NextResponse.json({
      success: issues.length === 0,
      message: issues.length === 0 
        ? '✅ Todos los datos están listos para el demo' 
        : `⚠️ Hay ${issues.length} problema(s)`,
      issues,
      data,
      ready: issues.length === 0 && data.video?.hasYoutubeUrl,
    });
  } catch (error: any) {
    console.error('Error checking data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check data',
      },
      { status: 500 }
    );
  }
}

