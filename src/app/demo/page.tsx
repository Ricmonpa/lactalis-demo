'use client';

import { useState, useRef } from 'react';
import { Play, CheckCircle, XCircle } from 'lucide-react';

export default function LactalisDemo() {
  const [videoEnded, setVideoEnded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cuando el video termina, mostramos el Quiz
  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => setShowQuiz(true), 500); // Pequeña pausa dramática
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(50); // ¡Puntos ganados!
    } else {
      setScore(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* HEADER TIPO APP */}
      <div className="w-full max-w-md bg-blue-900 text-white p-4 rounded-t-xl flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-lg">Lactalis Academy</h1>
        <div className="bg-blue-800 px-3 py-1 rounded-full text-sm font-mono">
          {score !== null ? score : 0} pts 🪙
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-4 rounded-b-xl shadow-xl border border-gray-200">
        
        {/* ZONA DE VIDEO */}
        {!showQuiz ? (
          <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden group">
            <video 
              ref={videoRef}
              src="/videos/bienvenida.mp4" 
              className="w-full h-full object-cover"
              controls
              playsInline
              onEnded={handleVideoEnd}
            />
            {/* Overlay inicial si no se ha dado play (opcional, el navegador a veces pide click) */}
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Video 1: Bienvenida
            </div>
          </div>
        ) : (
          /* ZONA DE QUIZ (Aparece solo al terminar el video) */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">¡Trivia Rápida!</h2>
              <p className="text-gray-600">Demuestra lo que aprendiste para ganar +50 puntos.</p>
            </div>

            {score === null ? (
              <div className="space-y-3">
                <p className="font-semibold text-lg mb-4 text-gray-800">
                  Según el video, ¿Qué posición mundial ocupa Lactalis?
                </p>
                
                <button 
                  onClick={() => handleAnswer(false)}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center"
                >
                  <div className="w-6 h-6 rounded-full border border-gray-300 mr-3"></div>
                  Somos el #3 del mundo
                </button>

                <button 
                  onClick={() => handleAnswer(true)}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center"
                >
                  <div className="w-6 h-6 rounded-full border border-gray-300 mr-3"></div>
                  Somos el Grupo Lácteo #1 ✅
                </button>

                <button 
                  onClick={() => handleAnswer(false)}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center"
                >
                  <div className="w-6 h-6 rounded-full border border-gray-300 mr-3"></div>
                  Somos el #5 en ventas
                </button>
              </div>
            ) : (
              /* PANTALLA DE RESULTADO */
              <div className="text-center py-8">
                {score > 0 ? (
                  <>
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-600 mb-2">¡Correcto!</h3>
                    <p className="text-gray-600 mb-6">Se han abonado 50 Lactalises a tu cuenta.</p>
                    <button className="bg-blue-900 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-800 transform hover:scale-105 transition-all">
                      Continuar Aprendiendo
                    </button>
                  </>
                ) : (
                  <>
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-600 mb-2">Casi...</h3>
                    <p className="text-gray-600 mb-6">La respuesta correcta era la #1. ¡Intenta de nuevo mañana!</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}