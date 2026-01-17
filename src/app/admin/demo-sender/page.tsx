'use client';

import { useState } from 'react';

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export default function DemoSenderPage() {
  const [phone, setPhone] = useState('+521');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, type, message }, ...prev]);
  };

  const handleSendLesson = async () => {
    if (!phone || phone.length < 10) {
      addLog('error', 'Ingresa un número de teléfono válido');
      return;
    }

    setLoading(true);
    addLog('info', `Enviando lección a ${phone}...`);

    try {
      const response = await fetch('/api/demo/kraft-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        addLog('success', `✅ Lección enviada a ${phone}`);
        addLog('success', `Video: ${data.data?.videoSent ? 'Enviado' : 'No enviado'}`);
        addLog('success', `Quiz: ${data.data?.quizSent ? 'Enviado' : 'No enviado'}`);
      } else {
        addLog('error', `❌ Error: ${data.error || 'Error desconocido'}`);
      }
    } catch (error: any) {
      addLog('error', `❌ Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📤 Demo Sender
          </h1>
          <p className="text-slate-400">
            Envía lecciones de Kraft Singles a cualquier número de WhatsApp
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-900/50 border border-amber-600 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="text-amber-200 text-sm">
              <p className="font-semibold mb-1">Requisito para Twilio Sandbox:</p>
              <p>El usuario debe enviar primero el mensaje:</p>
              <code className="block bg-amber-950 px-3 py-2 rounded mt-2 text-amber-100">
                join exact-clock
              </code>
              <p className="mt-2 text-amber-300">al número <strong>+1 415 523 8886</strong> antes de poder recibir mensajes.</p>
            </div>
          </div>
        </div>

        {/* Send Form */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Número de WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+521234567890"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-lg font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          
          <button
            onClick={handleSendLesson}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
              loading
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar Lección Kraft
              </>
            )}
          </button>
        </div>

        {/* Logs */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-750 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300">📋 Logs</h2>
            <button
              onClick={clearLogs}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Limpiar
            </button>
          </div>
          
          <div className="p-4 max-h-80 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                Los logs aparecerán aquí...
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      'text-slate-400'
                    }`}
                  >
                    <span className="text-slate-500 flex-shrink-0">[{log.time}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex gap-4">
          <a
            href="/admin/demo"
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-center text-sm font-medium transition-colors border border-slate-700"
          >
            ← Panel Principal
          </a>
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-center text-sm font-medium transition-colors border border-slate-700"
          >
            WhatsApp Web →
          </a>
        </div>
      </div>
    </div>
  );
}

