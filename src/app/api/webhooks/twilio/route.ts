import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';
import { prisma } from '@/lib/prisma';

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
 * Upsert de usuario - Crea el usuario si no existe, o lo retorna si ya existe
 */
async function upsertUser(phone: string) {
  try {
    // Intentar encontrar el usuario
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // Si no existe, crearlo
    if (!user) {
      console.log(`[Twilio Webhook] Creando nuevo usuario: ${phone}`);
      user = await prisma.user.create({
        data: {
          phone,
          lCoins: 0,
        },
      });
      console.log(`[Twilio Webhook] ✅ Usuario creado: ${user.id}`);
    } else {
      console.log(`[Twilio Webhook] Usuario existente: ${user.id}`);
    }

    return user;
  } catch (error: any) {
    console.error(`[Twilio Webhook] Error en upsert de usuario:`, error);
    // Si falla el upsert, continuar sin usuario (no bloquear el flujo)
    return null;
  }
}

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

    // BLINDAJE: Upsert del usuario antes de cualquier operación
    const user = await upsertUser(cleanPhone);
    console.log(`[Twilio Webhook] Usuario procesado: ${user?.id || 'sin persistencia'}`);

    // Normalizar el texto (lowercase, trim)
    const normalizedBody = body.toLowerCase().trim();

    console.log(`[Twilio Webhook] Usuario ${cleanPhone} envió: "${normalizedBody}"`);

    let responseMessage: string;
    let shouldAddPoints = false;

    // Lógica del Quiz Kraft Singles
    if (normalizedBody === 'b') {
      // Respuesta CORRECTA
      console.log(`[Twilio Webhook] ✅ Respuesta correcta de ${cleanPhone}`);
      responseMessage = KRAFT_QUIZ_FEEDBACK.correct;
      shouldAddPoints = true;
    } else if (normalizedBody === 'a') {
      // Respuesta INCORRECTA
      console.log(`[Twilio Webhook] ❌ Respuesta incorrecta de ${cleanPhone}`);
      responseMessage = KRAFT_QUIZ_FEEDBACK.incorrect;
    } else if (normalizedBody === 'quiz' || normalizedBody === 'demo') {
      // Comando para iniciar el demo
      console.log(`[Twilio Webhook] Usuario solicitó demo`);
      responseMessage = `👋 ¡Hola! Para recibir la lección de Kraft Singles, visita:

https://lactalis-demo.vercel.app/admin/demo-sender

O pide al administrador que te envíe la lección.`;
    } else if (normalizedBody === 'ayuda' || normalizedBody === 'help') {
      // Comando de ayuda
      responseMessage = `👋 *Lactalis Flow - Ayuda*

Comandos disponibles:
• *A* o *B* - Responder al quiz
• *QUIZ* - Solicitar un quiz
• *AYUDA* - Ver este mensaje
• *PUNTOS* - Ver tus L-Coins

Si tienes un quiz activo, responde con A o B.`;
    } else if (normalizedBody === 'puntos' || normalizedBody === 'coins' || normalizedBody === 'saldo') {
      // Ver puntos
      const currentCoins = user?.lCoins || 0;
      responseMessage = `🪙 *Tus L-Coins*

Saldo actual: *${currentCoins} Lactalises*

Sigue completando quizzes para ganar más puntos. 💪`;
    } else {
      // Cualquier otra cosa
      console.log(`[Twilio Webhook] Respuesta no válida de ${cleanPhone}: "${normalizedBody}"`);
      responseMessage = KRAFT_QUIZ_FEEDBACK.invalid;
    }

    // Sumar puntos si la respuesta fue correcta
    if (shouldAddPoints && user) {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { lCoins: { increment: 50 } },
        });
        console.log(`[Twilio Webhook] +50 L-Coins para ${cleanPhone}. Total: ${updatedUser.lCoins}`);
      } catch (error) {
        console.error(`[Twilio Webhook] Error al sumar puntos:`, error);
      }
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
      userId: user?.id,
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
    features: [
      'Upsert automático de usuarios',
      'Quiz A/B con feedback',
      'Sistema de puntos (L-Coins)',
      'Comandos: AYUDA, PUNTOS, QUIZ',
    ],
  });
}
