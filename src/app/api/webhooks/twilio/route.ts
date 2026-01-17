import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';

/**
 * Feedback para el Quiz de Kraft Singles (nativo en WhatsApp)
 */
const KRAFT_QUIZ_FEEDBACK = {
  correct: `✅ *¡Exacto!*

Eso vende nutrición y calidad. Cuando hablas de beneficios reales, las mamás confían más.

🎉 *¡Ganaste +50 Lactalises!*

Sigue aprendiendo para ganar más puntos. 💪`,

  incorrect: `❌ Estuviste cerca, pero el precio atrae y la nutrición convence.

💡 La respuesta correcta es B: Hablar de los beneficios reales (calcio, proteína, leche de vaca) es más convincente que solo mencionar el sabor.

Escribe *B* para continuar.`,

  invalid: `⚠️ Opción no válida.

Por favor, escribe *A* o *B* para responder.`,
};

/**
 * POST /api/webhooks/twilio
 * Recibe mensajes de WhatsApp via Twilio y responde al quiz
 */
export async function POST(request: NextRequest) {
  try {
    // Twilio envía datos como x-www-form-urlencoded
    const formData = await request.formData();
    
    const body = formData.get('Body') as string | null;
    const from = formData.get('From') as string | null;

    console.log('[Twilio Webhook] Mensaje recibido:');
    console.log('  From:', from);
    console.log('  Body:', body);

    // Limpiar el número de teléfono (remover prefijo whatsapp:)
    const cleanPhone = from?.replace('whatsapp:', '') || '';

    if (!cleanPhone || !body) {
      console.log('[Twilio Webhook] Mensaje vacío o sin remitente');
      return NextResponse.json({ success: true });
    }

    // Normalizar el texto (lowercase, trim)
    const normalizedBody = body.toLowerCase().trim();

    console.log(`[Twilio Webhook] Usuario ${cleanPhone} envió: "${normalizedBody}"`);

    let responseMessage: string;

    // Lógica del Quiz Kraft Singles
    if (normalizedBody === 'b') {
      // Respuesta CORRECTA
      console.log(`[Twilio Webhook] ✅ Respuesta correcta de ${cleanPhone}`);
      responseMessage = KRAFT_QUIZ_FEEDBACK.correct;
    } else if (normalizedBody === 'a') {
      // Respuesta INCORRECTA
      console.log(`[Twilio Webhook] ❌ Respuesta incorrecta de ${cleanPhone}`);
      responseMessage = KRAFT_QUIZ_FEEDBACK.incorrect;
    } else if (normalizedBody === 'quiz' || normalizedBody === 'demo') {
      // Comando para iniciar el demo
      console.log(`[Twilio Webhook] Usuario solicitó demo`);
      responseMessage = `👋 ¡Hola! Para recibir la lección de Kraft Singles, visita:

https://lactalis-demo.vercel.app/admin/demo

O pide al administrador que te envíe la lección.`;
    } else if (normalizedBody === 'ayuda' || normalizedBody === 'help') {
      // Comando de ayuda
      responseMessage = `👋 *Lactalis Flow - Ayuda*

Comandos disponibles:
• *A* o *B* - Responder al quiz
• *QUIZ* - Solicitar un quiz
• *AYUDA* - Ver este mensaje

Si tienes un quiz activo, responde con A o B.`;
    } else {
      // Cualquier otra cosa
      console.log(`[Twilio Webhook] Respuesta no válida de ${cleanPhone}: "${normalizedBody}"`);
      responseMessage = KRAFT_QUIZ_FEEDBACK.invalid;
    }

    // Enviar respuesta
    console.log(`[Twilio Webhook] Enviando respuesta a ${cleanPhone}`);
    
    const result = await sendWhatsAppMessage({
      to: cleanPhone,
      body: responseMessage,
    });

    if (!result.success) {
      console.error(`[Twilio Webhook] Error al enviar respuesta:`, result.error);
    } else {
      console.log(`[Twilio Webhook] ✅ Respuesta enviada a ${cleanPhone}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed',
    });
  } catch (error: any) {
    console.error('[Twilio Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/twilio
 * Verificación del webhook
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Twilio webhook endpoint is active',
    quiz: 'Kraft Singles Quiz - Responde A o B',
  });
}
