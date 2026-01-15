'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Componente que usa useSearchParams (debe estar envuelto en Suspense)
function YouTubeSetupContent() {
  const searchParams = useSearchParams();
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(tokenParam));
        setTokenData(decoded);
      } catch (e) {
        setError('Error al parsear datos del token');
      }
    }
  }, [searchParams]);

  const handleAuthorize = () => {
    window.location.href = '/api/auth/youtube';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración de YouTube OAuth
          </h1>
          <p className="text-gray-600">
            Configura el acceso a YouTube API para subir videos automáticamente
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Solo necesitas hacer esto UNA VEZ. Guarda el refresh_token en tu .env.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Instrucciones paso a paso
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold mr-3">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  Ve a Google Cloud Console
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Visita{' '}
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    console.cloud.google.com
                  </a>{' '}
                  e inicia sesión con tu cuenta de Google
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold mr-3">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  Crea proyecto y activa YouTube Data API v3
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Crea un nuevo proyecto (o selecciona uno existente) y habilita la{' '}
                  <a
                    href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    YouTube Data API v3
                  </a>
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold mr-3">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  Configura OAuth Consent Screen
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Ve a{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    APIs & Services → OAuth consent screen
                  </a>
                  . Selecciona &quot;External&quot; y completa la información básica
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold mr-3">
                4
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  Crea credenciales OAuth 2.0
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Ve a{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    APIs & Services → Credentials
                  </a>
                  . Crea credenciales OAuth 2.0 Client ID. Tipo: &quot;Web application&quot;. 
                  Agrega URI de redirección: <code className="bg-gray-100 px-1 rounded text-xs">{process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback</code>
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold mr-3">
                5
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  Copia CLIENT_ID y CLIENT_SECRET a .env
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Copia el Client ID y Client Secret a tu archivo .env:
                </p>
                <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-xs">
                  <div>YOUTUBE_CLIENT_ID=tu_client_id.apps.googleusercontent.com</div>
                  <div>YOUTUBE_CLIENT_SECRET=tu_client_secret</div>
                  <div>YOUTUBE_REDIRECT_URI={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback</div>
                </div>
              </div>
            </li>
          </ol>
        </div>

        {/* Authorize Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Autorizar aplicación
          </h2>
          <p className="text-gray-600 mb-4">
            Una vez que hayas configurado las credenciales en Google Cloud Console y 
            las hayas agregado a tu .env, haz clic en el botón para autorizar la aplicación.
          </p>
          <button
            onClick={handleAuthorize}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Autorizar YouTube
          </button>
        </div>

        {/* Token Display Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Refresh Token obtenido
          </h2>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {tokenData?.tokens?.refresh_token ? (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <p className="text-sm text-green-700 font-medium mb-2">
                  ✅ ¡Autorización exitosa!
                </p>
                <p className="text-sm text-green-700">
                  Copia el refresh_token y agrégalo a tu .env
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Token:
                </label>
                <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                  {tokenData.tokens.refresh_token}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tokenData.tokens.refresh_token);
                    alert('¡Copiado al portapapeles!');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Copiar al portapapeles
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar a .env:
                </label>
                <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                  YOUTUBE_REFRESH_TOKEN={tokenData.tokens.refresh_token}
                </div>
                <button
                  onClick={() => {
                    const envLine = `YOUTUBE_REFRESH_TOKEN=${tokenData.tokens.refresh_token}`;
                    navigator.clipboard.writeText(envLine);
                    alert('¡Línea completa copiada al portapapeles!');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Copiar línea completa
                </button>
              </div>

              {tokenData.instructions && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm font-medium text-blue-700 mb-2">Instrucciones:</p>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    {tokenData.instructions.map((instruction: string, idx: number) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-700">
                  <strong>⚠️ Importante:</strong> El refresh_token no caduca y puede usarse indefinidamente. 
                  Guárdalo de forma segura y nunca lo subas a control de versiones.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Si ya completaste la autorización, el refresh_token aparecerá aquí. 
                Cópialo y agrégalo a tu .env como:
              </p>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-4">
                YOUTUBE_REFRESH_TOKEN=tu_refresh_token_aqui
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-700">
                  <strong>Importante:</strong> El refresh_token no caduca y puede usarse indefinidamente. 
                  Guárdalo de forma segura y nunca lo subas a control de versiones.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back to Admin */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando configuración...</p>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function YouTubeSetupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <YouTubeSetupContent />
    </Suspense>
  );
}
