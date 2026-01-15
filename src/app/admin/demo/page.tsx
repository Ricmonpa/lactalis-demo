'use client';

import { useState } from 'react';

export default function DemoAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendLesson = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/test-send-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Error al enviar la lección');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎬 Lactalis Flow
          </h1>
          <p className="text-blue-300">Panel de Control - Demo</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Enviar Lección de Capacitación
            </h2>
            <p className="text-blue-200 text-sm">
              Envía el video + quiz automático al usuario de prueba
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-3 text-blue-200 text-sm">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium text-white">Número de prueba:</p>
                <p>+52 1 477 404 6609</p>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendLesson}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/30 active:scale-[0.98]'
            } text-white`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar Lección
              </>
            )}
          </button>

          {/* Result */}
          {result && (
            <div className="mt-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div className="text-green-200">
                  <p className="font-semibold text-white mb-1">¡Lección enviada!</p>
                  <p className="text-sm">{result.message}</p>
                  <div className="mt-3 text-xs space-y-1 text-green-300">
                    <p>📹 Video: {result.data?.content?.title}</p>
                    <p>📝 Quiz: {result.data?.quiz?.questionsCount} preguntas</p>
                    <p>🪙 Recompensa: {result.data?.quiz?.rewardCoins} L-Coins</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div className="text-red-200">
                  <p className="font-semibold text-white mb-1">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Info */}
        <div className="mt-8 bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">📋 Flujo del Demo</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-blue-200">
              <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <p>Clic en "Enviar Lección" → Video llega a WhatsApp</p>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <p>Esperar 30 segundos → Quiz inicia automáticamente</p>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <p>Responder con 1, 2, 3 o 4 → Feedback inmediato</p>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <p>Al finalizar → Resumen con score y L-Coins</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white text-center text-sm font-medium transition-colors border border-white/10"
          >
            Abrir WhatsApp Web
          </a>
          <a
            href="/"
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white text-center text-sm font-medium transition-colors border border-white/10"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

