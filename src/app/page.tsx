'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// Datos de la trivia (Hardcoded para el MVP)
const QUIZ_DATA = [
  {
    question: "¿Cuál es el ingrediente principal de Kraft Singles?",
    options: ["Grasa Vegetal", "Leche de Vaca y Calcio", "Saborizante Artificial"],
    correct: 1 // Índice de la respuesta correcta
  },
  {
    question: "¿Qué diferencia a Kraft Singles de las imitaciones?",
    options: ["Es más barato", "El color naranja", "Es queso de verdad"],
    correct: 2
  }
];

export default function DemoPage() {
  // Estados de la interfaz
  const [phase, setPhase] = useState<'video' | 'quiz' | 'reward'>('video');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lCoins, setLCoins] = useState(0); // Puntos acumulados visuales
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Efecto cuando ganas para animar los L-Coins
  useEffect(() => {
    if (phase === 'reward') {
      const interval = setInterval(() => {
        setLCoins(prev => {
          if (prev < 150) return prev + 5; // Cuenta hasta 150
          clearInterval(interval);
          return 150;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleVideoEnd = () => {
    setPhase('quiz');
  };

  const handleAnswer = (optionIndex: number) => {
    if (optionIndex === QUIZ_DATA[currentQuestion].correct) {
      // Respuesta correcta
      setScore(score + 1);
    }

    if (currentQuestion < QUIZ_DATA.length - 1) {
      // Siguiente pregunta
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Fin del quiz
      setPhase('reward');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* --- FASE 1: VIDEO --- */}
      {phase === 'video' && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-blue-900 p-4 text-white text-center">
            <h1 className="font-bold text-lg">Lección del Día</h1>
            <p className="text-xs text-blue-200">Kraft Singles vs Imitaciones</p>
          </div>
          
          <div className="relative bg-black flex items-center justify-center min-h-[400px] max-h-[80vh]">
            <video 
              ref={videoRef}
              className="w-full h-auto max-w-full max-h-[80vh] object-contain"
              controls
              playsInline
              preload="metadata"
              // Video de Kraft Singles - Se adapta a cualquier aspect ratio
              src="/videos/Kraft_Singles_Commercial_Script.mp4"
              poster="/videos/poster2.png"
              onEnded={handleVideoEnd}
              onError={(e) => {
                console.error('Error loading video:', e);
                alert('Error al cargar el video. Por favor, recarga la página.');
              }}
            >
              Tu navegador no soporta la reproducción de video.
            </video>
            {/* Botón trampa para saltar el video en la demo si es muy largo */}
            <button 
              onClick={handleVideoEnd}
              className="absolute bottom-16 right-4 bg-white/20 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-50 hover:opacity-100"
            >
              Skip (Demo) ⏭️
            </button>
          </div>

          <div className="p-4 bg-white">
            <p className="text-sm text-gray-500 text-center">
              Mira el video completo para desbloquear la trivia y ganar L-Coins.
            </p>
          </div>
        </div>
      )}

      {/* --- FASE 2: TRIVIA --- */}
      {phase === 'quiz' && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-800 px-2 py-1 rounded">Trivia Rápida</span>
              <span className="text-sm font-mono">{currentQuestion + 1}/{QUIZ_DATA.length}</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">
              {QUIZ_DATA[currentQuestion].question}
            </h2>
          </div>

          <div className="p-6 space-y-3 bg-gray-50">
            {QUIZ_DATA[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-95 shadow-sm"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- FASE 3: RECOMPENSA (L-COINS) --- */}
      {phase === 'reward' && (
        <div className="w-full max-w-md text-center animate-in zoom-in duration-500">
          
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
            <span className="text-8xl relative z-10 block animate-bounce">🪙</span>
          </div>

          <h2 className="text-3xl font-black text-blue-900 mb-2">
            ¡Felicidades!
          </h2>
          
          <p className="text-gray-500 mb-8">
            Has completado el módulo de hoy.
          </p>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 mx-4">
            <p className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">Ganaste</p>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              +{lCoins}
            </div>
            <p className="text-sm font-bold text-gray-600 mt-1">L-Coins</p>
          </div>

          <Link 
            href="https://wa.me/" 
            className="inline-block w-full max-w-xs bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-500 transition-colors transform hover:-translate-y-1"
          >
            Volver a WhatsApp
          </Link>
          
          <p className="mt-6 text-xs text-gray-400">
            Lactalis Flow System v1.0
          </p>
        </div>
      )}

    </main>
  );
}