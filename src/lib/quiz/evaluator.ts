import { Quiz, Question } from '@prisma/client';

interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

interface UserAnswer {
  questionId: string;
  answer: number; // Index of selected answer
}

interface EvaluationResult {
  score: number; // Percentage score (0-100)
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
}

export function evaluateQuiz(
  quiz: QuizWithQuestions,
  answers: UserAnswer[]
): EvaluationResult {
  const totalQuestions = quiz.questions.length;
  let correctAnswers = 0;

  // Evaluate each answer
  for (const userAnswer of answers) {
    const question = quiz.questions.find((q) => q.id === userAnswer.questionId);
    
    if (!question) {
      console.warn(`[Quiz Evaluator] Question not found: ${userAnswer.questionId}`);
      continue;
    }

    // Compare user's answer with correct answer
    if (userAnswer.answer === question.correctAnswer) {
      correctAnswers++;
    }
  }

  // Calculate percentage score
  const score = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  // Check if passed (score >= passingScore)
  const passed = score >= quiz.passingScore;

  console.log(`[Quiz Evaluator] Score: ${score}%, Correct: ${correctAnswers}/${totalQuestions}, Passed: ${passed}`);

  return {
    score,
    passed,
    correctAnswers,
    totalQuestions,
  };
}

