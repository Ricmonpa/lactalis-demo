import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const quizId = req.nextUrl.searchParams.get('quizId');

  if (!quizId) {
    return NextResponse.json({ error: 'quizId required' }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: 'asc' } } },
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // Generar Flow JSON VALIDADO para WhatsApp
  const flowJson = {
    version: "6.0",
    data_api_version: "3.0",
    routing_model: {
      QUIZ_INTRO: ["QUESTION_1"],
      ...Object.fromEntries(
        quiz.questions.map((q, i) => [
          `QUESTION_${i + 1}`,
          i === quiz.questions.length - 1 ? ["RESULTS"] : [`QUESTION_${i + 2}`]
        ])
      ),
      RESULTS: []
    },
    screens: [
      // Pantalla de introducción
      {
        id: "QUIZ_INTRO",
        title: "Quiz",
        terminal: false,
        success: false,
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            {
              type: "TextHeading",
              text: quiz.title
            },
            {
              type: "TextBody",
              text: `${quiz.questions.length} preguntas · Aprueba con ${quiz.passingScore}%`
            },
            {
              type: "TextCaption",
              text: `🪙 Recompensa: ${quiz.rewardCoins} L-Coins`
            },
            {
              type: "Footer",
              label: "Comenzar",
              on_click_action: {
                name: "navigate",
                next: { name: "QUESTION_1" },
                payload: {}
              }
            }
          ]
        }
      },
      // Generar pantallas de preguntas dinámicamente
      ...quiz.questions.map((question, index) => {
        const options = question.options as string[];

        return {
          id: `QUESTION_${index + 1}`,
          title: `Pregunta ${index + 1}/${quiz.questions.length}`,
          terminal: false,
          success: false,
          data: {
            question_id: question.id,
            question_order: index + 1
          },
          layout: {
            type: "SingleColumnLayout",
            children: [
              {
                type: "TextSubheading",
                text: question.questionText
              },
              {
                type: "RadioButtonsGroup",
                name: `q${index + 1}`,
                label: "Selecciona una opción",
                required: true,
                data_source: options.map((opt, optIndex) => ({
                  id: String.fromCharCode(65 + optIndex), // A, B, C, D
                  title: opt,
                  enabled: true
                }))
              },
              {
                type: "Footer",
                label: index === quiz.questions.length - 1 ? "Finalizar" : "Siguiente",
                on_click_action: {
                  name: "navigate",
                  next: { 
                    name: index === quiz.questions.length - 1 ? "RESULTS" : `QUESTION_${index + 2}`
                  },
                  payload: {}
                }
              }
            ]
          }
        };
      }),
      // Pantalla de resultados
      {
        id: "RESULTS",
        title: "¡Completado!",
        terminal: true,
        success: true,
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            {
              type: "TextHeading",
              text: "Quiz completado"
            },
            {
              type: "TextBody",
              text: "Estamos evaluando tus respuestas..."
            },
            {
              type: "Footer",
              label: "Finalizar",
              on_click_action: {
                name: "complete",
                payload: {
                  quiz_completed: "true",
                  quiz_id: quiz.id
                }
              }
            }
          ]
        }
      }
    ]
  };

  return NextResponse.json(flowJson, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

