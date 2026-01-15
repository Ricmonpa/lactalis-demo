import { prisma } from '../prisma';
import { sendWhatsAppMessage } from './provider';

interface SendConversationalQuizParams {
  userPhone: string;
  quizId: string;
}

/**
 * Inicia un quiz conversacional por WhatsApp
 */
export async function sendConversationalQuiz({
  userPhone,
  quizId,
}: SendConversationalQuizParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Conversational Quiz] Starting quiz for ${userPhone}, quizId: ${quizId}`);

    // 1. Obtener quiz con preguntas
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    if (quiz.questions.length === 0) {
      throw new Error(`Quiz has no questions: ${quizId}`);
    }

    // 2. Obtener o crear usuario
    let user = await prisma.user.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: userPhone,
          name: userPhone,
        },
      });
      console.log(`[Conversational Quiz] Created new user: ${user.id}`);
    }

    // 3. Cerrar cualquier sesión activa previa del mismo quiz
    await prisma.quizSession.updateMany({
      where: {
        userId: user.id,
        quizId: quizId,
        status: 'active',
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // 4. Crear nueva sesión de quiz
    const session = await prisma.quizSession.create({
      data: {
        userId: user.id,
        quizId: quizId,
        currentQuestionIndex: 0,
        answers: {},
        status: 'active',
      },
    });

    console.log(`[Conversational Quiz] Created session: ${session.id}`);

    // 5. Enviar primera pregunta
    await sendQuestion({
      userPhone,
      quiz,
      session,
      questionIndex: 0,
    });

    return { success: true };
  } catch (error: any) {
    console.error(`[Conversational Quiz] Error:`, error);
    return {
      success: false,
      error: error.message || 'Failed to start conversational quiz',
    };
  }
}

/**
 * Envía una pregunta del quiz
 */
export async function sendQuestion({
  userPhone,
  quiz,
  session,
  questionIndex,
}: {
  userPhone: string;
  quiz: any;
  session: any;
  questionIndex: number;
}): Promise<void> {
  const question = quiz.questions[questionIndex];
  const totalQuestions = quiz.questions.length;
  const questionNumber = questionIndex + 1;

  if (!question) {
    throw new Error(`Question not found at index ${questionIndex}`);
  }

  const options = question.options as string[];
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

  let message = `📝 *¡Hora del Quiz!*\n\n`;
  message += `Responde estas preguntas para ganar L-Coins:\n\n`;
  message += `*Pregunta ${questionNumber}/${totalQuestions}:*\n\n`;
  message += `${question.questionText}\n\n`;
  message += `Responde con el número de tu opción:\n\n`;

  options.forEach((option, index) => {
    message += `${emojis[index]} ${option}\n`;
  });

  const result = await sendWhatsAppMessage({
    to: userPhone,
    body: message,
  });

  if (!result.success) {
    throw new Error(`Failed to send question: ${result.error}`);
  }

  console.log(`[Conversational Quiz] Sent question ${questionNumber}/${totalQuestions} to ${userPhone}`);
}

/**
 * Procesa la respuesta del usuario y envía la siguiente pregunta o finaliza el quiz
 */
export async function processQuizAnswer({
  userPhone,
  answer: answerText,
}: {
  userPhone: string;
  answer: string;
}): Promise<{ success: boolean; error?: string; completed?: boolean }> {
  try {
    // Limpiar respuesta (solo números)
    const answerNumber = answerText.trim().replace(/[^1-4]/g, '');

    if (!answerNumber || !['1', '2', '3', '4'].includes(answerNumber)) {
      // Respuesta inválida
      await sendWhatsAppMessage({
        to: userPhone,
        body: '❌ Por favor responde solo con el número de tu opción (1, 2, 3 o 4)',
      });
      return { success: false, error: 'Invalid answer format' };
    }

    const answerIndex = parseInt(answerNumber) - 1; // Convertir a índice (0-3)

    // Buscar sesión activa
    const user = await prisma.user.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const session = await prisma.quizSession.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (!session) {
      // No hay sesión activa, ignorar o enviar mensaje genérico
      return { success: true, completed: false };
    }

    const { quiz } = session;
    const currentQuestion = quiz.questions[session.currentQuestionIndex];

    if (!currentQuestion) {
      return { success: false, error: 'Question not found' };
    }

    // Guardar respuesta
    const answers = (session.answers as any) || {};
    answers[session.currentQuestionIndex.toString()] = answerIndex.toString();
    
    await prisma.quizSession.update({
      where: { id: session.id },
      data: {
        answers,
      },
    });

    // Verificar si es correcta
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const correctOption = currentQuestion.options[currentQuestion.correctAnswer];
    const totalQuestions = quiz.questions.length;
    const currentQuestionNumber = session.currentQuestionIndex + 1;
    const nextQuestionIndex = session.currentQuestionIndex + 1;

    // Enviar feedback
    if (isCorrect) {
      await sendWhatsAppMessage({
        to: userPhone,
        body: `✅ ¡Correcto!\n\n${currentQuestion.questionText}\n\nLa respuesta "${correctOption}" es correcta.`,
      });
    } else {
      await sendWhatsAppMessage({
        to: userPhone,
        body: `❌ Incorrecto\n\nLa respuesta correcta es: ${correctOption}\n\n${currentQuestion.questionText}`,
      });
    }

    // Si hay más preguntas, enviar la siguiente
    if (nextQuestionIndex < totalQuestions) {
      // Actualizar índice
      await prisma.quizSession.update({
        where: { id: session.id },
        data: {
          currentQuestionIndex: nextQuestionIndex,
        },
      });

      // Enviar siguiente pregunta
      await sendQuestion({
        userPhone,
        quiz,
        session: { ...session, currentQuestionIndex: nextQuestionIndex },
        questionIndex: nextQuestionIndex,
      });

      return { success: true, completed: false };
    } else {
      // Quiz completado - calcular resultados
      await completeQuiz({ userPhone, session, quiz });
      return { success: true, completed: true };
    }
  } catch (error: any) {
    console.error(`[Conversational Quiz] Error processing answer:`, error);
    return {
      success: false,
      error: error.message || 'Failed to process answer',
    };
  }
}

/**
 * Completa el quiz y envía resumen
 */
async function completeQuiz({
  userPhone,
  session,
  quiz,
}: {
  userPhone: string;
  session: any;
  quiz: any;
}): Promise<void> {
  const answers = (session.answers as any) || {};
  let correctCount = 0;

  // Evaluar respuestas
  quiz.questions.forEach((question: any, index: number) => {
    const userAnswer = parseInt(answers[index.toString()] || '-1');
    if (userAnswer === question.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= quiz.passingScore;

  // Actualizar sesión
  await prisma.quizSession.update({
    where: { id: session.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Crear QuizAttempt
  const quizAttempt = await prisma.quizAttempt.create({
    data: {
      userId: session.userId,
      quizId: quiz.id,
      score,
      passed,
      answers: answers,
    },
  });

  // Obtener usuario actual
  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  // Actualizar L-Coins si pasó
  let newBalance = currentUser?.lCoins || 0;
  if (passed) {
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        lCoins: {
          increment: quiz.rewardCoins,
        },
      },
    });
    newBalance = updatedUser.lCoins;

    // Crear transacción
    await prisma.walletTransaction.create({
      data: {
        userId: session.userId,
        amount: quiz.rewardCoins,
        type: 'quiz_reward',
        description: `Recompensa por completar quiz: ${quiz.title}`,
        quizAttemptId: quizAttempt.id,
      },
    });
  }

  // Enviar resumen
  let summary = `🎉 *¡Quiz completado!*\n\n`;
  summary += `*Resultados:*\n\n`;
  summary += `Respuestas correctas: ${correctCount}/${totalQuestions}\n\n`;
  summary += `Calificación: ${score}%\n`;
  summary += `Estado: ${passed ? 'APROBADO ✅' : 'REPROBADO ❌'}\n\n`;

  if (passed) {
    summary += `¡Has ganado ${quiz.rewardCoins} L-Coins! 🪙\n\n`;
  } else {
    summary += `Intenta de nuevo para ganar L-Coins\n\n`;
  }

  summary += `Saldo actual: ${newBalance} L-Coins`;

  await sendWhatsAppMessage({
    to: userPhone,
    body: summary,
  });

  console.log(`[Conversational Quiz] Quiz completed for ${userPhone}. Score: ${score}%, Passed: ${passed}`);
}

