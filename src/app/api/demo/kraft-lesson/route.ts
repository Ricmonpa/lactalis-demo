import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';

/**
 * Datos de la lección - COPY FINAL DE REDPEPPER
 * Solo reemplaza videoUrl con la URL pública del video
 */
const LESSON_DATA = {
  topic: 'Kraft Singles: El Queso de Verdad',
  // COPY FINAL DE REDPEPPER:
  body: '¡Hola Luisa! 🧀🎒\n\nSabemos que las mamás buscan lo mejor para el lunch. Pero ojo: hay "quesos" que son imitaciones de plástico.\n\nKraft Singles es queso americano REAL, hecho con leche de vaca. Mira el video para saber qué responder cuando duden.',
  // AQUI IRÁ EL VIDEO REAL - REEMPLAZA ESTA URL:
  videoUrl: 'https://lactalis-demo.vercel.app/videos/Kraft_Singles_Commercial_Script.mp4',
  // Link visual del quiz (no funcional aún en webview real)
  quizUrl: 'https://lactalisflow.com/quiz/kraft-singles',
};

/**
 * POST /api/demo/kraft-lesson
 * Envía la lección de Kraft Singles al número de demo
 * 
 * Body opcional:
 * {
 *   "phone": "+52...",  // Opcional, usa DEMO_TEST_PHONE por defecto
 *   "customBody": "..." // Opcional, reemplaza el body por defecto
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetPhone = body.phone || process.env.DEMO_TEST_PHONE;
    const messageBody = body.customBody || LESSON_DATA.body;

    if (!targetPhone) {
      return NextResponse.json(
        { success: false, error: 'No phone number configured. Set DEMO_TEST_PHONE in .env' },
        { status: 400 }
      );
    }

    console.log(`[Demo Kraft] Enviando Demo Kraft a ${targetPhone} con Video: ${LESSON_DATA.videoUrl}`);

    // Enviar mensaje con video usando el provider
    const result = await sendWhatsAppMessage({
      to: targetPhone,
      body: messageBody,
      mediaUrl: LESSON_DATA.videoUrl, // CRÍTICO: Adjunta el video
    });

    if (!result.success) {
      console.error(`[Demo Kraft] Error al enviar:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`[Demo Kraft] ✅ Mensaje enviado exitosamente a ${targetPhone}`);

    return NextResponse.json({
      success: true,
      message: 'Lección de Kraft Singles enviada',
      data: {
        phone: targetPhone,
        topic: LESSON_DATA.topic,
        videoUrl: LESSON_DATA.videoUrl,
        quizUrl: LESSON_DATA.quizUrl,
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
 * Envía la lección usando valores por defecto (más fácil para probar)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone') || process.env.DEMO_TEST_PHONE;

  if (!phone) {
    return NextResponse.json(
      { success: false, error: 'No phone number configured. Set DEMO_TEST_PHONE in .env or pass ?phone=+52...' },
      { status: 400 }
    );
  }

  console.log(`[Demo Kraft] Enviando Demo Kraft a ${phone} con Video: ${LESSON_DATA.videoUrl}`);

  try {
    const result = await sendWhatsAppMessage({
      to: phone,
      body: LESSON_DATA.body,
      mediaUrl: LESSON_DATA.videoUrl,
    });

    if (!result.success) {
      console.error(`[Demo Kraft] Error al enviar:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`[Demo Kraft] ✅ Mensaje enviado exitosamente a ${phone}`);

    return NextResponse.json({
      success: true,
      message: 'Lección de Kraft Singles enviada',
      data: {
        phone,
        topic: LESSON_DATA.topic,
        videoUrl: LESSON_DATA.videoUrl,
        quizUrl: LESSON_DATA.quizUrl,
        lessonBody: LESSON_DATA.body,
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

