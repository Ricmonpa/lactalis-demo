import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint para crear datos de prueba (seed) para el demo
 * GET /api/admin/seed-demo
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🌱 Starting demo seed...');

    // 1. Crear o obtener usuario de prueba
    const testPhone = process.env.DEMO_TEST_PHONE || '+5214774046609';
    const testUser = await prisma.user.upsert({
      where: { phone: testPhone },
      update: {},
      create: {
        phone: testPhone,
        name: 'Usuario Demo',
        email: 'demo@lactalis.com',
        lCoins: 0,
      },
    });
    console.log('✅ User:', testUser.phone);

    // 2. Crear contenido de video
    const content = await prisma.content.upsert({
      where: { id: 'demo-content-1' },
      update: {},
      create: {
        id: 'demo-content-1',
        title: 'Introducción a Kraft Singles',
        description: 'Aprende sobre los ingredientes y beneficios de Kraft Singles. Descubre por qué es queso de verdad con calcio.',
        type: 'video',
        order: 1,
        isActive: true,
      },
    });
    console.log('✅ Content:', content.title);

    // 3. Crear VideoAsset (con YouTube URL de ejemplo - REEMPLAZA CON TU VIDEO REAL)
    const videoAsset = await prisma.videoAsset.upsert({
      where: { contentId: content.id },
      update: {},
      create: {
        contentId: content.id,
        muxStatus: 'ready',
        youtubeStatus: 'uploaded',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // ⚠️ REEMPLAZA CON TU VIDEO REAL
        youtubeVideoId: 'dQw4w9WgXcQ', // ⚠️ REEMPLAZA CON TU VIDEO ID REAL
        youtubeViewCount: 0,
      },
    });
    console.log('✅ VideoAsset:', videoAsset.youtubeUrl);

    // 4. Crear Quiz
    const quiz = await prisma.quiz.upsert({
      where: { contentId: content.id },
      update: {},
      create: {
        contentId: content.id,
        title: 'Quiz: Kraft Singles',
        description: 'Pon a prueba tus conocimientos sobre Kraft Singles',
        passingScore: 70,
        rewardCoins: 50,
        isActive: true,
      },
    });
    console.log('✅ Quiz:', quiz.title);

    // 5. Eliminar preguntas existentes y crear nuevas
    await prisma.question.deleteMany({
      where: { quizId: quiz.id },
    });

    const questions = [
      {
        quizId: quiz.id,
        questionText: '¿Cuál es el ingrediente principal de Kraft Singles?',
        type: 'MULTIPLE_CHOICE',
        options: ['Grasa Vegetal', 'Leche de Vaca y Calcio', 'Saborizante Artificial', 'Agua'],
        correctAnswer: 1,
        order: 0,
      },
      {
        quizId: quiz.id,
        questionText: '¿Qué diferencia a Kraft Singles de las imitaciones?',
        type: 'MULTIPLE_CHOICE',
        options: ['Es más barato', 'El color naranja', 'Es queso de verdad', 'Tiene más grasa'],
        correctAnswer: 2,
        order: 1,
      },
      {
        quizId: quiz.id,
        questionText: '¿Cuántos gramos de proteína tiene una rebanada de Kraft Singles?',
        type: 'MULTIPLE_CHOICE',
        options: ['2g', '4g', '6g', '8g'],
        correctAnswer: 2,
        order: 2,
      },
      {
        quizId: quiz.id,
        questionText: '¿Kraft Singles contiene lácteos reales?',
        type: 'MULTIPLE_CHOICE',
        options: ['No, es completamente artificial', 'Sí, contiene leche y calcio', 'Solo contiene calcio', 'Depende del sabor'],
        correctAnswer: 1,
        order: 3,
      },
      {
        quizId: quiz.id,
        questionText: '¿Cuál es el beneficio principal de Kraft Singles?',
        type: 'MULTIPLE_CHOICE',
        options: ['Es más económico', 'Es queso real con calcio', 'No necesita refrigeración', 'Tiene más sabor'],
        correctAnswer: 1,
        order: 4,
      },
    ];

    const createdQuestions = [];
    for (const questionData of questions) {
      const question = await prisma.question.create({
        data: questionData,
      });
      createdQuestions.push(question);
    }
    console.log(`✅ Created ${createdQuestions.length} questions`);

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        user: {
          phone: testUser.phone,
          name: testUser.name,
          lCoins: testUser.lCoins,
        },
        content: {
          id: content.id,
          title: content.title,
          description: content.description,
        },
        video: {
          youtubeUrl: videoAsset.youtubeUrl,
          youtubeVideoId: videoAsset.youtubeVideoId,
        },
        quiz: {
          id: quiz.id,
          title: quiz.title,
          passingScore: quiz.passingScore,
          rewardCoins: quiz.rewardCoins,
          questionsCount: createdQuestions.length,
        },
      },
      note: '⚠️ IMPORTANTE: Reemplaza la YouTube URL con tu video real antes del demo',
    });
  } catch (error: any) {
    console.error('❌ Error seeding demo data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed demo data',
      },
      { status: 500 }
    );
  }
}

