import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';

export async function GET(request: NextRequest) {
  try {
    // Número de prueba (puedes hardcodearlo o leerlo de env)
    const testPhone = process.env.DEMO_TEST_PHONE || '+521234567890'; // Cambia este número
    
    console.log(`[Test Demo] Sending test message to ${testPhone}`);
    console.log(`[Test Demo] Provider: ${process.env.WHATSAPP_PROVIDER || 'meta'}`);

    const message = `🧪 *Mensaje de Prueba - Lactalis Flow*

Este es un mensaje de prueba del sistema.

✅ Provider: ${process.env.WHATSAPP_PROVIDER || 'meta'}
✅ Timestamp: ${new Date().toISOString()}

Si recibes este mensaje, el sistema está funcionando correctamente.`;

    const result = await sendWhatsAppMessage({
      to: testPhone,
      body: message,
      previewUrl: false,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test message sent successfully',
        data: {
          to: testPhone,
          provider: process.env.WHATSAPP_PROVIDER || 'meta',
          messageId: result.messageId,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send test message',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Test Demo] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

