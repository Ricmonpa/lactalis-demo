# Guía Completa de APIs y Credenciales para .env

Esta guía detalla todas las APIs y credenciales que necesitas configurar en tu archivo `.env` para que Lactalis Flow funcione correctamente.

---

## 📋 Resumen de APIs Necesarias

1. **PostgreSQL Database** - Base de datos principal
2. **Mux** - Hosting y streaming de videos
3. **Google YouTube API** - Subida automática de videos a YouTube
4. **WhatsApp Business API (Meta)** - Envío de mensajes y Flows
5. **Google Gemini API** - IA para generación de contenido, preguntas y personalización

---

## 1. 🗄️ PostgreSQL Database

### Variables Requeridas:
```env
DATABASE_URL="postgresql://user:password@host:5432/database_name?schema=public"
```

### Dónde obtener:
- **Opción 1: Local**
  - Instala PostgreSQL localmente
  - Crea una base de datos: `createdb lactalis_db`
  - Formato: `postgresql://postgres:password@localhost:5432/lactalis_db?schema=public`

- **Opción 2: Vercel Postgres** (Recomendado para producción)
  - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
  - Storage → Create Database → Postgres
  - Copia la `DATABASE_URL` que te proporciona

- **Opción 3: Otros proveedores**
  - [Supabase](https://supabase.com) (Postgres gratuito)
  - [Neon](https://neon.tech) (Postgres serverless)
  - [Railway](https://railway.app) (Postgres fácil de configurar)

### Pasos después de configurar:
```bash
npx prisma migrate dev
npx prisma generate
```

---

## 2. 🎬 Mux (Video Hosting)

### Variables Requeridas:
```env
MUX_TOKEN_ID=tu_mux_token_id
MUX_TOKEN_SECRET=tu_mux_token_secret
```

### Dónde obtener:
1. Ve a [Mux Dashboard](https://dashboard.mux.com)
2. Inicia sesión o crea una cuenta
3. Ve a **Settings → API Access Tokens**
4. Crea un nuevo token o usa el token existente
5. Copia el **Token ID** y **Token Secret**

### Documentación:
- [Mux API Documentation](https://docs.mux.com)
- [Getting Started with Mux](https://docs.mux.com/guides/video/get-started)

### Nota:
- Mux tiene un plan gratuito con límites generosos
- Los videos se almacenan en Mux y se replican a YouTube

---

## 3. 📺 Google YouTube API

### Variables Requeridas:
```env
YOUTUBE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=tu_client_secret
YOUTUBE_REDIRECT_URI=${NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback
YOUTUBE_REFRESH_TOKEN=obtener_despues_del_flujo_oauth
```

### Dónde obtener:

#### Paso 1: Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **YouTube Data API v3**:
   - Ve a **APIs & Services → Library**
   - Busca "YouTube Data API v3"
   - Haz clic en **Enable**

#### Paso 2: Configurar OAuth Consent Screen
1. Ve a **APIs & Services → OAuth consent screen**
2. Selecciona **External** (para desarrollo)
3. Completa la información:
   - App name: "Lactalis Flow"
   - User support email: tu email
   - Developer contact: tu email
4. Agrega los scopes:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube.readonly`

#### Paso 3: Crear Credenciales OAuth 2.0
1. Ve a **APIs & Services → Credentials**
2. Haz clic en **Create Credentials → OAuth client ID**
3. Tipo: **Web application**
4. Nombre: "Lactalis Flow Web Client"
5. **Authorized redirect URIs**: 
   - Desarrollo: `http://localhost:3000/api/auth/youtube/callback`
   - Producción: `https://tu-dominio.com/api/auth/youtube/callback`
6. Copia el **Client ID** y **Client Secret**

#### Paso 4: Obtener Refresh Token
1. Visita `/admin/youtube-setup` en tu aplicación
2. Haz clic en **"Autorizar YouTube"**
3. Completa el flujo OAuth de Google
4. Copia el `refresh_token` que aparece
5. Agrégalo a tu `.env` como `YOUTUBE_REFRESH_TOKEN`

### Documentación:
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [OAuth 2.0 Setup](https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps)

---

## 4. 💬 WhatsApp Business API (Meta)

### Variables Requeridas:
```env
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_ACCESS_TOKEN=tu_access_token
WHATSAPP_QUIZ_FLOW_ID=tu_flow_id
```

### Dónde obtener:

#### Opción 1: Meta Business Suite (Recomendado para producción)
1. Ve a [Meta for Developers](https://developers.facebook.com)
2. Crea una aplicación o usa una existente
3. Agrega el producto **WhatsApp**
4. Configura WhatsApp Business API:
   - Ve a **WhatsApp → API Setup**
   - Sigue el proceso de verificación
   - Obtén tu **Phone Number ID** y **Access Token**

#### Opción 2: WhatsApp Business Platform (Cloud API)
1. Ve a [Meta Business Suite](https://business.facebook.com)
2. Configura WhatsApp Business Account
3. Obtén las credenciales desde el dashboard

#### Paso 3: Crear Flow para Quiz
1. Ve a [Meta Flow Builder](https://developers.facebook.com/docs/whatsapp/flows)
2. Crea un nuevo Flow
3. Configura el Flow para recibir datos dinámicos
4. Copia el **Flow ID** y agrégalo como `WHATSAPP_QUIZ_FLOW_ID`

**Nota:** El Flow se genera dinámicamente en `/api/flows/quiz/[quizId]`, pero necesitas crear el Flow base en Meta.

### Documentación:
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Flows](https://developers.facebook.com/docs/whatsapp/flows)
- [Getting Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

---

## 5. 🌐 App URL (Para Webhooks)

### Variable Requerida:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configuración:
- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://tu-dominio.com` (tu dominio de Vercel o hosting)

---

## 📝 Archivo .env Completo

Crea un archivo `.env` en la raíz del proyecto con todas las variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/lactalis_db?schema=public"

# Mux
MUX_TOKEN_ID=tu_mux_token_id
MUX_TOKEN_SECRET=tu_mux_token_secret

# YouTube OAuth
YOUTUBE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=tu_client_secret
YOUTUBE_REDIRECT_URI=${NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback
YOUTUBE_REFRESH_TOKEN=obtener_despues_del_flujo_oauth

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_ACCESS_TOKEN=tu_access_token
WHATSAPP_QUIZ_FLOW_ID=tu_flow_id

# Google Gemini API (IA)
GEMINI_API_KEY=tu_gemini_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Checklist de Configuración

- [ ] PostgreSQL configurado y `DATABASE_URL` agregada
- [ ] Mux cuenta creada y tokens obtenidos
- [ ] Google Cloud proyecto creado
- [ ] YouTube Data API v3 habilitada
- [ ] OAuth Consent Screen configurado
- [ ] Credenciales OAuth 2.0 creadas
- [ ] Refresh token obtenido via `/admin/youtube-setup`
- [ ] WhatsApp Business API configurada
- [ ] Phone Number ID y Access Token obtenidos
- [ ] Flow creado en Meta y Flow ID obtenido
- [ ] Gemini API Key obtenida de Google AI Studio
- [ ] `NEXT_PUBLIC_APP_URL` configurada
- [ ] Migraciones de Prisma ejecutadas (`npx prisma migrate dev`)

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- Nunca subas tu archivo `.env` a control de versiones
- El archivo `.env` ya está en `.gitignore`
- En producción (Vercel), agrega las variables en **Settings → Environment Variables**
- Usa diferentes credenciales para desarrollo y producción
- Rota los tokens periódicamente si es posible

---

## 🆘 Troubleshooting

### Error: "Missing YouTube OAuth credentials"
- Verifica que `YOUTUBE_CLIENT_ID` y `YOUTUBE_CLIENT_SECRET` estén en `.env`
- Reinicia el servidor de desarrollo después de agregar variables

### Error: "No refresh_token received"
- Revoca el acceso en [Google Account Permissions](https://myaccount.google.com/permissions)
- Vuelve a autorizar usando `/admin/youtube-setup`

### Error: "WhatsApp API error"
- Verifica que el `WHATSAPP_ACCESS_TOKEN` no haya expirado
- Revisa que el `WHATSAPP_PHONE_NUMBER_ID` sea correcto

### Error: "Database connection failed"
- Verifica que PostgreSQL esté corriendo
- Revisa que la `DATABASE_URL` tenga el formato correcto
- Asegúrate de que la base de datos exista

---

## 📚 Recursos Adicionales

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

