# Configuración de Variables de Entorno

> 📖 **Para una guía completa y detallada, consulta [API_CREDENTIALS_GUIDE.md](./API_CREDENTIALS_GUIDE.md)**

## Variables Requeridas

### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lactalis_db?schema=public"
```
**Obtener:** PostgreSQL local, Vercel Postgres, Supabase, Neon, Railway

### Mux
```env
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```
**Obtener:** [Mux Dashboard](https://dashboard.mux.com) → Settings → API Access Tokens

### YouTube OAuth (para subir videos automáticamente)
```env
YOUTUBE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=tu_client_secret
YOUTUBE_REDIRECT_URI=${NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback
YOUTUBE_REFRESH_TOKEN=obtener_despues_del_flujo_oauth
```
**Obtener:** 
- Client ID/Secret: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- Refresh Token: Visita `/admin/youtube-setup` y sigue el flujo OAuth

### WhatsApp Business API
```env
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_QUIZ_FLOW_ID=your_whatsapp_quiz_flow_id
```
**Obtener:** [Meta for Developers](https://developers.facebook.com) → WhatsApp → API Setup

### App URL (para webhooks)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
**Configurar:** Tu dominio (localhost para desarrollo, tu dominio para producción)

## Checklist Rápido

- [ ] PostgreSQL configurado
- [ ] Mux tokens obtenidos
- [ ] Google Cloud proyecto + YouTube API habilitada
- [ ] OAuth credentials creadas
- [ ] Refresh token obtenido via `/admin/youtube-setup`
- [ ] WhatsApp Business API configurada
- [ ] Flow ID obtenido de Meta
- [ ] Gemini API Key obtenida de Google AI Studio

## Ver guía completa

Consulta [API_CREDENTIALS_GUIDE.md](./API_CREDENTIALS_GUIDE.md) para instrucciones detalladas paso a paso de cada API.

