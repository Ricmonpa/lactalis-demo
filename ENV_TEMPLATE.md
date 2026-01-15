# Template completo de .env.local

Copia esto a tu archivo `.env.local` y completa las variables que faltan:

```env
# ============================================
# DATABASE (Supabase/PostgreSQL) ✅ CONFIGURADO
# ============================================
DATABASE_URL="postgres://postgres.khvzjkvokodyokmmybsa:3UvO7GFEvILY9T08@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Opcional: Si quieres usar el cliente de Supabase directamente
NEXT_PUBLIC_SUPABASE_URL="https://khvzjkvokodyokmmybsa.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtodnpqa3Zva29keW9rbW15YnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Mjk5MDAsImV4cCI6MjA4NDAwNTkwMH0.dtxPBG1VgEcsOKr6HcSFoCv-JcnPUx3gd2YDBfZUy-c"

# ============================================
# MUX (Video Hosting) ⚠️ PENDIENTE
# ============================================
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# ============================================
# YOUTUBE OAUTH ⚠️ PENDIENTE
# ============================================
YOUTUBE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=tu_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
YOUTUBE_REFRESH_TOKEN=obtener_despues_del_flujo_oauth

# ============================================
# WHATSAPP BUSINESS API ⚠️ PENDIENTE
# ============================================
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_QUIZ_FLOW_ID=your_whatsapp_quiz_flow_id

# ============================================
# GOOGLE GEMINI API (IA) ⚠️ PENDIENTE
# ============================================
GEMINI_API_KEY=your_gemini_api_key

# ============================================
# APP URL ✅ CONFIGURADO (default)
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Estado actual:

✅ **Configurado:**
- `DATABASE_URL` - Base de datos Supabase lista

⚠️ **Pendiente de configurar:**
- Mux (para videos)
- YouTube OAuth (para subir videos)
- WhatsApp Business API (para mensajes)
- Gemini API (para IA)

## Próximos pasos:

1. **Mux**: Ve a [Mux Dashboard](https://dashboard.mux.com) → Settings → API Access Tokens
2. **YouTube**: Visita `/admin/youtube-setup` en tu app para configurar OAuth
3. **WhatsApp**: Ve a [Meta for Developers](https://developers.facebook.com)
4. **Gemini**: Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)

