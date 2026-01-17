import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';

/**
 * Datos de la lección - COPY FINAL DE REDPEPPER
 * Quiz NATIVO en WhatsApp (no webview)
 */
const LESSON_DATA = {
  topic: 'Kraft Singles: El Queso de Verdad',
  
  // Mensaje con video
  videoMessage: `🧀 *Kraft Singles: El Queso de Verdad*

¡Hola! 👋

Sabemos que las mamás buscan lo mejor para el lunch. Pero ojo: hay "quesos" que son imitaciones de plástico.

Kraft Singles es queso americano REAL, hecho con leche de vaca.

👇 Mira este video corto:`,

  // URL del video
  videoUrl: 'https://lactalis-demo.vercel.app/videos/Kraft_Singles_Commercial_Script.mp4',

  // Mensaje del quiz (se envía después del video)
  quizMessage: `📝 *QUIZ RÁPIDO*

Una mamá te dice: "Es que el otro queso es más barato..."

¿Cuál es la mejor respuesta?

*A)* "Sí, pero Kraft Singles tiene mejor sabor"

*B)* "Entiendo, pero fíjese: Kraft Singles tiene calcio y proteína de leche real. Las imitaciones no. ¿Qué prefiere darle a sus hijos?"

👇 *Escribe A o B para responder*`,

  // Feedback
  feedbackIncorrect: `❌ Estuviste cerca, pero el precio atrae y la nutrición convence.

💡 La respuesta correcta es B: Hablar de los beneficios reales (calcio, proteína, leche de vaca) es más convincente que solo mencionar el sabor.

Escribe *B* para continuar.`,

  feedbackCorrect: `✅ *¡Exacto!*

Eso vende nutrición y calidad. Cuando hablas de beneficios reales, las mamás confían más.

🎉 *¡Ganaste +50 Lactalises!*

Sigue aprendiendo para ganar más puntos. 💪`,

  feedbackInvalid: `⚠️ Opción no válida.

Por favor, escribe *A* o *B* para responder.`,
};

/**
 * POST /api/demo/kraft-lesson
 * Envía la lección de Kraft Singles (video + quiz nativo)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetPhone = body.phone || process.env.DEMO_TEST_PHONE;

    if (!targetPhone) {
      return NextResponse.json(
        { success: false, error: 'No phone number configured. Set DEMO_TEST_PHONE in .env' },
        { status: 400 }
      );
    }

    console.log(`[Demo Kraft] Enviando Demo Kraft a ${targetPhone} con Video: ${LESSON_DATA.videoUrl}`);

    // 1. Enviar mensaje con video
    const videoResult = await sendWhatsAppMessage({
      to: targetPhone,
      body: LESSON_DATA.videoMessage,
      mediaUrl: LESSON_DATA.videoUrl,
    });

    if (!videoResult.success) {
      console.error(`[Demo Kraft] Error al enviar video:`, videoResult.error);
      return NextResponse.json(
        { success: false, error: videoResult.error },
        { status: 500 }
      );
    }

    console.log(`[Demo Kraft] ✅ Video enviado a ${targetPhone}`);

    // 2. Esperar 3 segundos y enviar el quiz
    await new Promise(resolve => setTimeout(resolve, 3000));

    const quizResult = await sendWhatsAppMessage({
      to: targetPhone,
      body: LESSON_DATA.quizMessage,
    });

    if (!quizResult.success) {
      console.error(`[Demo Kraft] Error al enviar quiz:`, quizResult.error);
      return NextResponse.json(
        { success: false, error: quizResult.error },
        { status: 500 }
      );
    }

    console.log(`[Demo Kraft] ✅ Quiz enviado a ${targetPhone}`);

    return NextResponse.json({
      success: true,
      message: 'Lección de Kraft Singles enviada (video + quiz nativo)',
      data: {
        phone: targetPhone,
        topic: LESSON_DATA.topic,
        videoSent: true,
        quizSent: true,
        instructions: 'Responde A o B en WhatsApp para completar el quiz',
      },
    });
  } catch (error: any) {
    console.error('[Demo Kraft] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/demo/kraft-lesson
 * Envía la lección usando valores por defecto
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone') || process.env.DEMO_TEST_PHONE;

  if (!phone) {
    return NextResponse.json(
      { success: false, error: 'No phone number configured' },
      { status: 400 }
    );
  }

  // Reutilizar la lógica de POST
  const fakeRequest = {
    json: async () => ({ phone }),
  } as NextRequest;

  return POST(fakeRequest);
}

// Exportar los datos para usar en el webhook
export const KRAFT_QUIZ_DATA = LESSON_DATA;
