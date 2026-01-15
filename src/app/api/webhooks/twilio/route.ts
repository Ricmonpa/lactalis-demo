import { NextRequest, NextResponse } from 'next/server';
import { processQuizAnswer } from '@/lib/whatsapp/send-conversational-quiz';

export async function POST(request: NextRequest) {
  try {
    // Twilio envía datos como x-www-form-urlencoded
    const formData = await request.formData();
    
    // Parsear los datos del webhook de Twilio
    const body = formData.get('Body') as string | null;
    const from = formData.get('From') as string | null;
    const to = formData.get('To') as string | null;
    const messageSid = formData.get('MessageSid') as string | null;
    const accountSid = formData.get('AccountSid') as string | null;
    const numMedia = formData.get('NumMedia') as string | null;

    console.log('[Twilio Webhook] Received message:');
    console.log('  From:', from);
    console.log('  To:', to);
    console.log('  Body:', body);
    console.log('  MessageSid:', messageSid);
    console.log('  AccountSid:', accountSid);
    console.log('  NumMedia:', numMedia);

    // Limpiar el número de teléfono (remover prefijo whatsapp:)
    const cleanPhone = from?.replace('whatsapp:', '') || from;

    if (!cleanPhone || !body) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing from or body'
      }, { status: 400 });
    }

    // Registrar en consola
    console.log(`[Twilio Webhook] User ${cleanPhone} sent: "${body}"`);

    // Verificar si hay una sesión de quiz activa
    const { prisma } = await import('@/lib/prisma');
    
    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (user) {
      const activeSession = await prisma.quizSession.findFirst({
        where: {
          userId: user.id,
          status: 'active',
        },
        orderBy: {
          startedAt: 'desc',
        },
      });

      if (activeSession) {
        // Hay una sesión activa - procesar respuesta del quiz
        console.log(`[Twilio Webhook] Processing quiz answer for session ${activeSession.id}`);
        
        const result = await processQuizAnswer({
          userPhone: cleanPhone,
          answer: body,
        });

        if (result.completed) {
          console.log(`[Twilio Webhook] Quiz completed for ${cleanPhone}`);
        }

        return NextResponse.json({ 
          success: true,
          message: 'Quiz answer processed',
          completed: result.completed,
        });
      }
    }

    // No hay sesión activa - mensaje genérico o ignorar
    console.log(`[Twilio Webhook] No active quiz session for ${cleanPhone}, ignoring message`);
    
    // Opcional: Enviar mensaje de ayuda si el usuario envía comandos específicos
    const upperBody = body.toUpperCase().trim();
    if (upperBody === 'HELP' || upperBody === 'AYUDA') {
      const { sendWhatsAppMessage } = await import('@/lib/whatsapp/provider');
      await sendWhatsAppMessage({
        to: cleanPhone,
        body: '👋 Hola! Para comenzar un quiz, primero debes ver un video de capacitación. Espera a recibir el enlace del video.',
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook received (no active quiz session)',
    });
  } catch (error: any) {
    console.error('[Twilio Webhook] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Twilio también puede hacer GET para verificar el webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Twilio webhook endpoint is active'
  });
}

