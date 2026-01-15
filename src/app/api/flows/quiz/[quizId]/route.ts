import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    console.log(`[Quiz Flow API] Generating Flow JSON for quizId: ${quizId}`);

    // 1. Get quiz with questions from DB
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    if (quiz.questions.length === 0) {
      return NextResponse.json(
        { error: 'Quiz has no questions' },
        { status: 400 }
      );
    }

    // 2. Generate JSON for WhatsApp Flow v6.0
    const flowJson = generateFlowJSON(quiz);

    console.log(`[Quiz Flow API] Flow JSON generated successfully for quizId: ${quizId}`);

    return NextResponse.json(flowJson);
  } catch (error: any) {
    console.error('[Quiz Flow API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFlowJSON(quiz: any) {
  const screens: any[] = [];
  const data: any = {};

  // QUIZ_INTRO screen
  screens.push({
    id: 'QUIZ_INTRO',
    title: quiz.title,
    data: {
      quiz_description: quiz.description || 'Completa el quiz para ganar puntos',
      total_questions: quiz.questions.length,
      passing_score: quiz.passingScore,
      reward_coins: quiz.rewardCoins,
    },
    actions: [
      {
        id: 'start_quiz',
        type: 'complete',
        payload: {
          screen: 'QUESTION_1',
        },
      },
    ],
  });

  // One screen per question
  quiz.questions.forEach((question: any, index: number) => {
    const screenId = `QUESTION_${index + 1}`;
    const nextScreenId = index < quiz.questions.length - 1 
      ? `QUESTION_${index + 2}`
      : 'SUBMIT';

    // Create radio buttons for options
    const radioButtons = question.options.map((option: string, optIndex: number) => ({
      id: `option_${optIndex}`,
      title: option,
      type: 'radio',
      value: optIndex.toString(),
    }));

    screens.push({
      id: screenId,
      title: question.questionText,
      data: {
        question_id: question.id,
        question_type: question.type,
        options: question.options,
      },
      components: [
        {
          type: 'RadioButtonsGroup',
          name: 'answer',
          options: radioButtons,
        },
      ],
      actions: [
        {
          id: 'next',
          type: 'complete',
          payload: {
            screen: nextScreenId,
            answer: '{{answer}}',
            question_id: question.id,
          },
        },
      ],
    });
  });

  // SUBMIT screen
  screens.push({
    id: 'SUBMIT',
    title: '¡Quiz completado!',
    data: {
      message: 'Gracias por completar el quiz. Tus respuestas están siendo evaluadas.',
    },
    actions: [
      {
        id: 'submit',
        type: 'complete',
        payload: {
          action: 'submit_quiz',
        },
      },
    ],
  });

  return {
    version: '6.0',
    screens,
    data,
  };
}

