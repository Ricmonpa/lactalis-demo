import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateQuiz } from '@/lib/quiz/evaluator';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry } = body;

    console.log('[WhatsApp Webhook] Received webhook:', JSON.stringify(body, null, 2));

    if (!entry || !Array.isArray(entry) || entry.length === 0) {
      return NextResponse.json({ success: true, message: 'No entries to process' });
    }

    for (const entryItem of entry) {
      const { changes } = entryItem;

      if (!changes || !Array.isArray(changes)) continue;

      for (const change of changes) {
        const { value } = change;

        if (!value || !value.messages) continue;

        for (const message of value.messages) {
          // Handle interactive message with nfm_reply type
          if (
            message.type === 'interactive' &&
            message.interactive?.type === 'nfm_reply'
          ) {
            await handleNfmReply(message);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleNfmReply(message: any) {
  try {
    const { from: userPhone, interactive } = message;
    const { response_json, flow_token } = interactive;

    console.log(`[WhatsApp Webhook] Handling nfm_reply from ${userPhone}`);

    // Parse flow_token and response_json
    let flowTokenData;
    let flowResponse;

    try {
      flowTokenData = JSON.parse(flow_token);
      flowResponse = JSON.parse(response_json);
    } catch (parseError) {
      console.error('[WhatsApp Webhook] Failed to parse flow_token or response_json:', parseError);
      return;
    }

    const { quiz_id, content_id } = flowTokenData;

    if (!quiz_id || !content_id) {
      console.error('[WhatsApp Webhook] Missing quiz_id or content_id in flow_token');
      return;
    }

    // Handle quiz completion
    await handleQuizCompletion(userPhone, flowTokenData, flowResponse);
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Error handling nfm_reply:', error);
  }
}

async function handleQuizCompletion(
  userPhone: string,
  flowToken: any,
  flowResponse: any
) {
  try {
    const { quiz_id, content_id } = flowToken;

    console.log(`[WhatsApp Webhook] Handling quiz completion for user ${userPhone}, quiz ${quiz_id}`);

    // Get user by phone
    let user = await prisma.user.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          phone: userPhone,
          name: userPhone, // Default name to phone
        },
      });
      console.log(`[WhatsApp Webhook] Created new user: ${user.id}`);
    }

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quiz_id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new Error(`Quiz not found: ${quiz_id}`);
    }

    // Extract answers from flowResponse
    const answers = extractAnswersFromFlowResponse(flowResponse, quiz.questions);

    // Evaluate quiz
    const evaluation = evaluateQuiz(quiz, answers);

    // Save QuizAttempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz_id,
        score: evaluation.score,
        passed: evaluation.passed,
        answers: answers as any,
      },
    });

    console.log(`[WhatsApp Webhook] Quiz attempt saved: ${quizAttempt.id}, Score: ${evaluation.score}%`);

    // Update UserProgress
    await prisma.userProgress.upsert({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId: content_id,
        },
      },
      create: {
        userId: user.id,
        contentId: content_id,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // If passed: increment L-Coins and create WalletTransaction
    if (evaluation.passed) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          lCoins: {
            increment: quiz.rewardCoins,
          },
        },
      });

      await prisma.walletTransaction.create({
        data: {
          userId: user.id,
          amount: quiz.rewardCoins,
          type: 'quiz_reward',
          description: `Recompensa por completar quiz: ${quiz.title}`,
          contentId: content_id,
          quizAttemptId: quizAttempt.id,
        },
      });

      console.log(`[WhatsApp Webhook] User ${user.id} earned ${quiz.rewardCoins} L-Coins. Total: ${updatedUser.lCoins}`);

      // Send success message
      await sendFeedbackMessage(
        userPhone,
        evaluation,
        quiz.rewardCoins,
        updatedUser.lCoins,
        true
      );
    } else {
      // Send failure message
      await sendFeedbackMessage(
        userPhone,
        evaluation,
        0,
        user.lCoins,
        false
      );
    }
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Error in handleQuizCompletion:', error);
    throw error;
  }
}

function extractAnswersFromFlowResponse(flowResponse: any, questions: any[]): Array<{ questionId: string; answer: number }> {
  const answers: Array<{ questionId: string; answer: number }> = [];

  // Extract answers from flow response
  // The structure depends on how WhatsApp Flow returns the data
  // This is a simplified version - you may need to adjust based on actual Flow response structure
  if (flowResponse.screens) {
    for (const screen of flowResponse.screens) {
      if (screen.id && screen.id.startsWith('QUESTION_')) {
        const questionIndex = parseInt(screen.id.replace('QUESTION_', '')) - 1;
        const question = questions[questionIndex];

        if (question && screen.data?.answer !== undefined) {
          answers.push({
            questionId: question.id,
            answer: parseInt(screen.data.answer),
          });
        }
      }
    }
  }

  // Alternative: if answers are in a different structure
  if (answers.length === 0 && flowResponse.answers) {
    for (const [questionId, answer] of Object.entries(flowResponse.answers)) {
      answers.push({
        questionId,
        answer: answer as number,
      });
    }
  }

  return answers;
}

async function sendFeedbackMessage(
  userPhone: string,
  evaluation: { score: number; correctAnswers: number; totalQuestions: number },
  rewardCoins: number,
  totalCoins: number,
  passed: boolean
) {
  try {
    let message = '';
    if (passed) {
      message = `🎉 ¡Felicitaciones!\n\n` +
        `✅ Respuestas correctas: ${evaluation.correctAnswers}/${evaluation.totalQuestions}\n` +
        `📊 Puntuación: ${evaluation.score}%\n` +
        `🪙 Recompensa: +${rewardCoins} L-Coins\n` +
        `💰 Total de L-Coins: ${totalCoins}\n\n` +
        `¡Sigue aprendiendo para ganar más puntos!`;
    } else {
      message = `📝 Resultados del Quiz\n\n` +
        `❌ Respuestas correctas: ${evaluation.correctAnswers}/${evaluation.totalQuestions}\n` +
        `📊 Puntuación: ${evaluation.score}%\n` +
        `⚠️ No alcanzaste el puntaje mínimo para ganar puntos.\n\n` +
        `¡Intenta de nuevo y sigue aprendiendo!`;
    }

    const result = await sendWhatsAppMessage({
      to: userPhone,
      body: message,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send feedback message');
    }

    console.log(`[WhatsApp Webhook] Feedback message sent to ${userPhone}`);
  } catch (error: any) {
    console.error(`[WhatsApp Webhook] Error sending feedback message:`, error);
  }
}

