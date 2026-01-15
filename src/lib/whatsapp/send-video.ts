import { prisma } from '../prisma';
import { sendQuizFlow } from './send-quiz-flow';
import { sendWhatsAppMessage } from './provider';

interface SendVideoParams {
  userPhone: string;
  contentId: string;
}

export async function sendVideo({ userPhone, contentId }: SendVideoParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[WhatsApp Send Video] Sending video to ${userPhone} for contentId: ${contentId}`);

    // 1. Get content with videoAsset and quiz included
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        videoAsset: true,
        quiz: true,
      },
    });

    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }

    if (!content.videoAsset) {
      throw new Error(`VideoAsset not found for content: ${contentId}`);
    }

    const { videoAsset } = content;
    const { title, description } = content;

    // 2. Prioritize youtubeUrl if exists, fallback to muxUrl
    const videoUrl = videoAsset.youtubeUrl || videoAsset.muxUrl;

    if (!videoUrl) {
      throw new Error(`No video URL available for content: ${contentId}`);
    }

    // 3. Send message with YouTube URL (WhatsApp/Twilio detecta automáticamente y crea preview)
    const duration = '5 min'; // TODO: Obtener duración real del video si está disponible
    const rewardCoins = content.quiz?.rewardCoins || 50;
    
    const message = `🎬 *${title}*

${description || 'Mira el video completo y gana puntos'}

${videoUrl}

⏱️ Duración: ${duration}
🪙 Recompensa: ${rewardCoins} L-Coins`;

    const whatsappResponse = await sendWhatsAppMessage({
      to: userPhone,
      body: message,
      previewUrl: true,
    });

    if (!whatsappResponse.success) {
      throw new Error(`Failed to send WhatsApp message: ${whatsappResponse.error}`);
    }

    console.log(`[WhatsApp Send Video] Video message sent successfully to ${userPhone}`);

    // 4. After 30 seconds, call conversational quiz (para demo rápida)
    setTimeout(async () => {
      try {
        console.log(`[WhatsApp Send Video] Triggering conversational quiz after 30 seconds for ${userPhone}`);
        if (content.quiz) {
          const { sendConversationalQuiz } = await import('./send-conversational-quiz');
          await sendConversationalQuiz({
            userPhone,
            quizId: content.quiz.id,
          });
        }
      } catch (error) {
        console.error(`[WhatsApp Send Video] Failed to send conversational quiz:`, error);
      }
    }, 30 * 1000); // 30 segundos para demo rápida

    return { success: true };
  } catch (error: any) {
    console.error(`[WhatsApp Send Video] Error:`, error);
    return {
      success: false,
      error: error.message || 'Failed to send video',
    };
  }
}


