import { prisma } from '../prisma';
import { sendWhatsAppInteractive } from './provider';

interface SendQuizFlowParams {
  userPhone: string;
  contentId: string;
}

export async function sendQuizFlow({
  userPhone,
  contentId,
}: SendQuizFlowParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[WhatsApp Send Quiz Flow] Sending quiz flow to ${userPhone} for contentId: ${contentId}`);

    // Get content with quiz
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        quiz: true,
      },
    });

    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }

    if (!content.quiz) {
      throw new Error(`Quiz not found for content: ${contentId}`);
    }

    const quizId = content.quiz.id;
    const flowId = process.env.WHATSAPP_QUIZ_FLOW_ID;

    if (!flowId) {
      throw new Error('WHATSAPP_QUIZ_FLOW_ID not configured');
    }

    // Create flow_token with JSON data
    const flowToken = JSON.stringify({
      quiz_id: quizId,
      content_id: contentId,
      user_phone: userPhone,
      timestamp: Date.now(),
    });

    // Send interactive message with Flow
    const whatsappResponse = await sendWhatsAppInteractive({
      to: userPhone,
      flowId,
      flowToken,
      header: '📝 Quiz disponible',
      body: '¡Es hora de poner a prueba lo que aprendiste! Completa el quiz y gana 50 L-Coins 🪙',
    });

    if (!whatsappResponse.success) {
      throw new Error(`Failed to send WhatsApp interactive message: ${whatsappResponse.error}`);
    }

    console.log(`[WhatsApp Send Quiz Flow] Quiz flow sent successfully to ${userPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[WhatsApp Send Quiz Flow] Error:`, error);
    return {
      success: false,
      error: error.message || 'Failed to send quiz flow',
    };
  }
}


