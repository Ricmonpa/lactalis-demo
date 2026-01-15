import twilio from 'twilio';

export type WhatsAppProvider = 'twilio' | 'meta';

interface SendWhatsAppMessageParams {
  to: string;
  body: string;
  mediaUrl?: string;
  previewUrl?: boolean;
}

interface SendWhatsAppInteractiveParams {
  to: string;
  flowId?: string;
  flowToken?: string;
  header?: string;
  body?: string;
}

/**
 * Formatea el número de teléfono para Twilio (agrega prefijo whatsapp:)
 */
function formatTwilioNumber(phone: string): string {
  // Si ya tiene el prefijo, retornarlo tal cual
  if (phone.startsWith('whatsapp:')) {
    return phone;
  }
  
  // Si no tiene prefijo, agregarlo
  // Asegurar que tenga el formato correcto con +
  const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;
  return `whatsapp:${cleanPhone}`;
}

/**
 * Envía un mensaje de texto usando el provider configurado
 */
export async function sendWhatsAppMessage({
  to,
  body,
  mediaUrl,
  previewUrl = false,
}: SendWhatsAppMessageParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const provider = (process.env.WHATSAPP_PROVIDER || 'meta') as WhatsAppProvider;
  
  console.log(`[WhatsApp Provider] Sending message via ${provider} to ${to}`);

  try {
    if (provider === 'twilio') {
      return await sendViaTwilio({ to, body, mediaUrl });
    } else {
      return await sendViaMeta({ to, body, mediaUrl, previewUrl });
    }
  } catch (error: any) {
    console.error(`[WhatsApp Provider] Error sending message:`, error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    };
  }
}

/**
 * Envía un mensaje interactivo (Flow) usando el provider configurado
 */
export async function sendWhatsAppInteractive({
  to,
  flowId,
  flowToken,
  header = '📝 Quiz disponible',
  body: bodyText = '¡Es hora de poner a prueba lo que aprendiste! Completa el quiz y gana 50 L-Coins 🪙',
}: SendWhatsAppInteractiveParams): Promise<{ success: boolean; error?: string }> {
  const provider = (process.env.WHATSAPP_PROVIDER || 'meta') as WhatsAppProvider;
  
  console.log(`[WhatsApp Provider] Sending interactive message via ${provider} to ${to}`);

  try {
    if (provider === 'twilio') {
      // Twilio no soporta Flows nativos, enviar mensaje de texto alternativo
      const message = `${header}\n\n${bodyText}\n\nPor favor, responde con "QUIZ" para comenzar.`;
      return await sendViaTwilio({ to, body: message });
    } else {
      return await sendViaMetaInteractive({ to, flowId, flowToken, header, body: bodyText });
    }
  } catch (error: any) {
    console.error(`[WhatsApp Provider] Error sending interactive message:`, error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp interactive message',
    };
  }
}

/**
 * Implementación para Twilio
 */
async function sendViaTwilio({
  to,
  body,
  mediaUrl,
}: {
  to: string;
  body: string;
  mediaUrl?: string;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox default

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be configured');
  }

  const client = twilio(accountSid, authToken);
  const formattedTo = formatTwilioNumber(to);

  console.log(`[Twilio] Sending message from ${twilioWhatsAppNumber} to ${formattedTo}`);

  try {
    const message = await client.messages.create({
      from: twilioWhatsAppNumber,
      to: formattedTo,
      body,
      ...(mediaUrl && { mediaUrl: [mediaUrl] }),
    });

    console.log(`[Twilio] Message sent successfully. SID: ${message.sid}`);
    
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error(`[Twilio] Error:`, error);
    throw new Error(`Twilio API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Implementación para Meta (Facebook Graph API)
 */
async function sendViaMeta({
  to,
  body,
  mediaUrl,
  previewUrl = false,
}: {
  to: string;
  body: string;
  mediaUrl?: string;
  previewUrl?: boolean;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be configured');
  }

  const whatsappApiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: mediaUrl ? 'image' : 'text',
  };

  if (mediaUrl) {
    payload.image = { link: mediaUrl };
  } else {
    payload.text = {
      body,
      preview_url: previewUrl,
    };
  }

  console.log(`[Meta] Sending message to ${to}`);

  try {
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Meta WhatsApp API error');
    }

    console.log(`[Meta] Message sent successfully. ID: ${data.messages?.[0]?.id}`);
    
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error(`[Meta] Error:`, error);
    throw new Error(`Meta API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Implementación para Meta Interactive Messages (Flows)
 */
async function sendViaMetaInteractive({
  to,
  flowId,
  flowToken,
  header,
  body: bodyText,
}: {
  to: string;
  flowId?: string;
  flowToken?: string;
  header?: string;
  body?: string;
}): Promise<{ success: boolean; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be configured');
  }

  if (!flowId || !flowToken) {
    throw new Error('flowId and flowToken are required for Meta interactive messages');
  }

  const whatsappApiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'flow',
      header: {
        type: 'text',
        text: header || '📝 Quiz disponible',
      },
      body: {
        text: bodyText || '¡Es hora de poner a prueba lo que aprendiste! Completa el quiz y gana 50 L-Coins 🪙',
      },
      action: {
        name: 'flow',
        parameters: {
          flow_message_version: '3',
          flow_token: flowToken,
          flow_id: flowId,
          flow_cta: 'Comenzar Quiz',
          flow_action_payload: {
            screen: 'QUIZ_INTRO',
          },
        },
      },
    },
  };

  console.log(`[Meta] Sending interactive message to ${to}`);

  try {
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Meta WhatsApp API error');
    }

    console.log(`[Meta] Interactive message sent successfully`);
    
    return { success: true };
  } catch (error: any) {
    console.error(`[Meta] Error:`, error);
    throw new Error(`Meta API error: ${error.message || 'Unknown error'}`);
  }
}

