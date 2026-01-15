/**
 * Google Gemini API Client
 * 
 * Este módulo proporciona funciones para interactuar con Google Gemini API
 * para generar contenido educativo, preguntas, feedback personalizado, etc.
 */

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

/**
 * Inicializa el cliente de Gemini
 */
function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
  }
  return apiKey;
}

/**
 * Realiza una petición a la API de Gemini
 */
async function callGeminiAPI(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
  } = {}
): Promise<string> {
  try {
    const apiKey = getGeminiApiKey();
    const model = 'gemini-pro'; // o 'gemini-pro-vision' para imágenes
    
    const requestBody: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    };

    // Agregar system instruction si se proporciona
    if (options.systemInstruction) {
      (requestBody as any).systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;
    return text.trim();
  } catch (error: any) {
    console.error('[Gemini API] Error:', error);
    throw error;
  }
}

/**
 * Genera preguntas de quiz basadas en el contenido de un video
 */
export async function generateQuizQuestions(
  videoTitle: string,
  videoDescription: string,
  numberOfQuestions: number = 5
): Promise<Array<{ question: string; options: string[]; correctAnswer: number; explanation?: string }>> {
  const prompt = `Eres un experto en educación corporativa. Genera ${numberOfQuestions} preguntas de opción múltiple (4 opciones cada una) basadas en el siguiente contenido de video:

Título: ${videoTitle}
Descripción: ${videoDescription}

Requisitos:
- Las preguntas deben evaluar comprensión del contenido
- Cada pregunta debe tener exactamente 4 opciones
- Solo una opción debe ser correcta
- Las preguntas deben ser claras y directas
- El nivel de dificultad debe ser medio

Formato de respuesta (JSON array):
[
  {
    "question": "Texto de la pregunta",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctAnswer": 0,
    "explanation": "Breve explicación de por qué esta es la respuesta correcta"
  }
]

Responde SOLO con el JSON, sin texto adicional.`;

  const response = await callGeminiAPI(prompt, {
    temperature: 0.8,
    maxTokens: 2000,
    systemInstruction: 'Eres un asistente experto en crear contenido educativo. Siempre respondes en formato JSON válido.',
  });

  try {
    // Limpiar la respuesta por si tiene markdown code blocks
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleanedResponse);
    return questions;
  } catch (error) {
    console.error('[Gemini] Error parsing quiz questions:', error);
    throw new Error('Failed to parse quiz questions from Gemini response');
  }
}

/**
 * Genera feedback personalizado basado en el desempeño del usuario
 */
export async function generatePersonalizedFeedback(
  quizTitle: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  userAnswers: Array<{ question: string; userAnswer: string; correctAnswer: string }>
): Promise<string> {
  const percentage = Math.round((score / 100) * totalQuestions);
  
  const prompt = `Eres un tutor educativo motivador. Genera un mensaje de feedback personalizado en español para un usuario que completó un quiz.

Datos del quiz:
- Título: ${quizTitle}
- Puntuación: ${score}%
- Respuestas correctas: ${correctAnswers} de ${totalQuestions}
- Respuestas incorrectas: ${totalQuestions - correctAnswers}

${userAnswers.length > 0 ? `\nAlgunas respuestas del usuario:\n${userAnswers.slice(0, 3).map((a, i) => `${i + 1}. ${a.question}\n   Usuario: ${a.userAnswer}\n   Correcta: ${a.correctAnswer}`).join('\n\n')}` : ''}

Genera un mensaje de feedback que:
- Sea motivador y positivo
- Reconozca el esfuerzo
- Proporcione sugerencias de mejora si es necesario
- Sea conciso (máximo 150 palabras)
- Use emojis apropiados
- Esté en español

Responde solo con el mensaje de feedback, sin formato adicional.`;

  const feedback = await callGeminiAPI(prompt, {
    temperature: 0.9,
    maxTokens: 300,
  });

  return feedback;
}

/**
 * Genera una descripción de video basada en el título
 */
export async function generateVideoDescription(
  videoTitle: string,
  context?: string
): Promise<string> {
  const prompt = `Genera una descripción atractiva y profesional para un video educativo corporativo.

Título: ${videoTitle}
${context ? `Contexto: ${context}` : ''}

La descripción debe:
- Ser clara y concisa (2-3 oraciones)
- Ser atractiva para empleados
- Mencionar los beneficios de ver el video
- Estar en español
- Tener un tono profesional pero amigable

Responde solo con la descripción, sin formato adicional.`;

  const description = await callGeminiAPI(prompt, {
    temperature: 0.7,
    maxTokens: 200,
  });

  return description;
}

/**
 * Analiza el contenido de un video y genera un resumen educativo
 */
export async function generateContentSummary(
  videoTitle: string,
  videoDescription: string
): Promise<{ summary: string; keyPoints: string[] }> {
  const prompt = `Analiza el siguiente contenido educativo y genera un resumen con puntos clave.

Título: ${videoTitle}
Descripción: ${videoDescription}

Genera:
1. Un resumen breve (2-3 oraciones)
2. Una lista de 3-5 puntos clave que los estudiantes deben recordar

Formato de respuesta (JSON):
{
  "summary": "Resumen del contenido",
  "keyPoints": ["Punto clave 1", "Punto clave 2", ...]
}

Responde SOLO con el JSON, sin texto adicional.`;

  const response = await callGeminiAPI(prompt, {
    temperature: 0.6,
    maxTokens: 500,
  });

  try {
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const summary = JSON.parse(cleanedResponse);
    return summary;
  } catch (error) {
    console.error('[Gemini] Error parsing summary:', error);
    throw new Error('Failed to parse summary from Gemini response');
  }
}

/**
 * Genera sugerencias de mejora basadas en respuestas incorrectas
 */
export async function generateImprovementSuggestions(
  incorrectAnswers: Array<{ question: string; userAnswer: string; correctAnswer: string; explanation?: string }>
): Promise<string[]> {
  if (incorrectAnswers.length === 0) {
    return [];
  }

  const prompt = `Basándote en las siguientes respuestas incorrectas de un quiz, genera sugerencias de mejora para el estudiante.

Respuestas incorrectas:
${incorrectAnswers.map((a, i) => 
  `${i + 1}. Pregunta: ${a.question}\n   Respuesta del usuario: ${a.userAnswer}\n   Respuesta correcta: ${a.correctAnswer}${a.explanation ? `\n   Explicación: ${a.explanation}` : ''}`
).join('\n\n')}

Genera 3-5 sugerencias específicas y accionables para mejorar el aprendizaje. Cada sugerencia debe ser:
- Específica y relacionada con el contenido
- Accionable (qué puede hacer el estudiante)
- Motivadora
- En español

Formato de respuesta (JSON array):
["Sugerencia 1", "Sugerencia 2", ...]

Responde SOLO con el JSON, sin texto adicional.`;

  const response = await callGeminiAPI(prompt, {
    temperature: 0.8,
    maxTokens: 400,
  });

  try {
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const suggestions = JSON.parse(cleanedResponse);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('[Gemini] Error parsing suggestions:', error);
    return [];
  }
}

export default {
  generateQuizQuestions,
  generatePersonalizedFeedback,
  generateVideoDescription,
  generateContentSummary,
  generateImprovementSuggestions,
};

