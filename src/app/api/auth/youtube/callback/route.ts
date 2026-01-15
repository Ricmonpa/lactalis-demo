import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('[YouTube OAuth Callback] Received callback');

    // Handle OAuth error
    if (error) {
      console.error('[YouTube OAuth Callback] OAuth error:', error);
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>YouTube OAuth - Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Error de Autorización</h1>
              <p class="text-gray-600">${error === 'access_denied' ? 'Denegaste el acceso a la aplicación' : `Error OAuth: ${error}`}</p>
            </div>
            <a href="/admin/youtube-setup" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors">
              Volver a configuración
            </a>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(errorHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Validate code parameter
    if (!code) {
      console.error('[YouTube OAuth Callback] Missing code parameter');
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>YouTube OAuth - Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Error</h1>
              <p class="text-gray-600">No se recibió el código de autorización de Google</p>
            </div>
            <a href="/admin/youtube-setup" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors">
              Volver a configuración
            </a>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(errorHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    console.log('[YouTube OAuth Callback] Authorization code received');

    // Validate required environment variables
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/youtube/callback`;

    if (!clientId || !clientSecret) {
      console.error('[YouTube OAuth Callback] Missing OAuth credentials');
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>YouTube OAuth - Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Error de Configuración</h1>
              <p class="text-gray-600">Faltan las credenciales de OAuth. Configura YOUTUBE_CLIENT_ID y YOUTUBE_CLIENT_SECRET en tu archivo .env</p>
            </div>
            <a href="/admin/youtube-setup" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors">
              Volver a configuración
            </a>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(errorHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Create OAuth2Client instance
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    console.log('[YouTube OAuth Callback] Exchanging code for tokens...');

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log('[YouTube OAuth Callback] Tokens received successfully');
    console.log('[YouTube OAuth Callback] Has refresh_token:', !!tokens.refresh_token);
    console.log('[YouTube OAuth Callback] Access token expires:', tokens.expiry_date);

    // Validate that we got a refresh token
    if (!tokens.refresh_token) {
      console.warn('[YouTube OAuth Callback] WARNING: No refresh_token received. This may happen if you already authorized the app before.');
      
      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>YouTube OAuth - Advertencia</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">No se recibió refresh_token</h1>
              <p class="text-gray-600">Google no proporcionó un refresh_token. Esto suele pasar si ya autorizaste la aplicación antes.</p>
            </div>

            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
              <p class="text-sm text-yellow-700 mb-2"><strong>Posibles soluciones:</strong></p>
              <ol class="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Revoca el acceso de la aplicación en <a href="https://myaccount.google.com/permissions" target="_blank" class="underline">Google Account Permissions</a></li>
                <li>Vuelve a intentar la autorización</li>
                <li>O usa el refresh_token existente si ya lo tienes</li>
              </ol>
            </div>

            <div class="flex gap-4">
              <a 
                href="/admin/youtube-setup"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
              >
                Volver a configuración
              </a>
            </div>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Return HTML page with tokens (more user-friendly)
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YouTube OAuth - Autorización Exitosa</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">¡Autorización Exitosa!</h1>
            <p class="text-gray-600">Copia el refresh_token y agrégalo a tu archivo .env</p>
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Refresh Token:</label>
              <div class="bg-gray-100 p-3 rounded font-mono text-xs break-all" id="refreshToken">${tokens.refresh_token}</div>
              <button 
                onclick="copyToClipboard('${tokens.refresh_token}')"
                class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                📋 Copiar al portapapeles
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Línea para .env:</label>
              <div class="bg-gray-100 p-3 rounded font-mono text-xs break-all" id="envLine">YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}</div>
              <button 
                onclick="copyToClipboard('YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}')"
                class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                📋 Copiar línea completa
              </button>
            </div>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
            <p class="text-sm text-yellow-700">
              <strong>⚠️ Importante:</strong> El refresh_token no caduca y puede usarse indefinidamente. 
              Guárdalo de forma segura y nunca lo subas a control de versiones.
            </p>
          </div>

          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
            <p class="text-sm font-medium text-blue-700 mb-2">Próximos pasos:</p>
            <ol class="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Agrega el refresh_token a tu archivo .env</li>
              <li>Reinicia tu servidor de desarrollo</li>
              <li>El sistema ahora puede subir videos a YouTube automáticamente</li>
            </ol>
          </div>

          <div class="flex gap-4">
            <a 
              href="/admin/youtube-setup"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
            >
              Volver a configuración
            </a>
            <button 
              onclick="window.close()"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        <script>
          function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
              alert('¡Copiado al portapapeles!');
            }).catch(err => {
              console.error('Error al copiar:', err);
              alert('Error al copiar. Por favor, copia manualmente.');
            });
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('[YouTube OAuth Callback] Error:', error);
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YouTube OAuth - Error</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p class="text-gray-600">${error.message || 'Ocurrió un error desconocido'}</p>
            ${error.response?.data ? `<pre class="mt-4 text-xs bg-gray-100 p-2 rounded text-left overflow-auto">${JSON.stringify(error.response.data, null, 2)}</pre>` : ''}
          </div>
          <a href="/admin/youtube-setup" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors">
            Volver a configuración
          </a>
        </div>
      </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

