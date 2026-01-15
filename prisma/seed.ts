import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Crear o obtener usuario de prueba
  const testUser = await prisma.user.upsert({
    where: { phone: '+5214774046609' },
    update: {},
    create: {
      phone: '+5214774046609',
      name: 'Usuario Demo',
      email: 'demo@lactalis.com',
      lCoins: 0,
    },
  });
  console.log('✅ User created/updated:', testUser.phone);

  // 2. Crear contenido de video
  const content = await prisma.content.upsert({
    where: { id: 'demo-content-1' },
    update: {},
    create: {
      id: 'demo-content-1',
      title: 'Introducción a Kraft Singles',
      description: 'Aprende sobre los ingredientes y beneficios de Kraft Singles',
      type: 'video',
      order: 1,
      isActive: true,
    },
  });
  console.log('✅ Content created:', content.title);

  // 3. Crear VideoAsset (con YouTube URL de ejemplo)
  const videoAsset = await prisma.videoAsset.upsert({
    where: { contentId: content.id },
    update: {},
    create: {
      contentId: content.id,
      muxStatus: 'ready',
      youtubeStatus: 'uploaded',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Reemplaza con tu video real
      youtubeVideoId: 'dQw4w9WgXcQ', // Reemplaza con tu video ID real
      youtubeViewCount: 0,
    },
  });
  console.log('✅ VideoAsset created:', videoAsset.youtubeUrl);

  // 4. Crear Quiz
  const quiz = await prisma.quiz.upsert({
    where: { contentId: content.id },
    update: {},
    create: {
      contentId: content.id,
      title: 'Quiz: Kraft Singles',
      description: 'Pon a prueba tus conocimientos sobre Kraft Singles',
      passingScore: 70,
      rewardCoins: 50,
      isActive: true,
    },
  });
  console.log('✅ Quiz created:', quiz.title);

  // 5. Crear preguntas del quiz
  const questions = [
    {
      quizId: quiz.id,
      questionText: '¿Cuál es el ingrediente principal de Kraft Singles?',
      type: 'MULTIPLE_CHOICE',
      options: ['Grasa Vegetal', 'Leche de Vaca y Calcio', 'Saborizante Artificial', 'Agua'],
      correctAnswer: 1, // "Leche de Vaca y Calcio"
      order: 0,
    },
    {
      quizId: quiz.id,
      questionText: '¿Qué diferencia a Kraft Singles de las imitaciones?',
      type: 'MULTIPLE_CHOICE',
      options: ['Es más barato', 'El color naranja', 'Es queso de verdad', 'Tiene más grasa'],
      correctAnswer: 2, // "Es queso de verdad"
      order: 1,
    },
    {
      quizId: quiz.id,
      questionText: '¿Cuántos gramos de proteína tiene una rebanada de Kraft Singles?',
      type: 'MULTIPLE_CHOICE',
      options: ['2g', '4g', '6g', '8g'],
      correctAnswer: 2, // "6g"
      order: 2,
    },
    {
      quizId: quiz.id,
      questionText: '¿Kraft Singles contiene lácteos reales?',
      type: 'MULTIPLE_CHOICE',
      options: ['No, es completamente artificial', 'Sí, contiene leche y calcio', 'Solo contiene calcio', 'Depende del sabor'],
      correctAnswer: 1, // "Sí, contiene leche y calcio"
      order: 3,
    },
    {
      quizId: quiz.id,
      questionText: '¿Cuál es el beneficio principal de Kraft Singles?',
      type: 'MULTIPLE_CHOICE',
      options: ['Es más económico', 'Es queso real con calcio', 'No necesita refrigeración', 'Tiene más sabor'],
      correctAnswer: 1, // "Es queso real con calcio"
      order: 4,
    },
  ];

  // Eliminar preguntas existentes y crear nuevas
  await prisma.question.deleteMany({
    where: { quizId: quiz.id },
  });

  for (const questionData of questions) {
    const question = await prisma.question.create({
      data: questionData,
    });
    console.log(`✅ Question created: ${question.questionText.substring(0, 50)}...`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - User: ${testUser.phone}`);
  console.log(`   - Content: ${content.title}`);
  console.log(`   - Video URL: ${videoAsset.youtubeUrl}`);
  console.log(`   - Quiz: ${quiz.title} (${questions.length} questions)`);
  console.log(`   - Passing Score: ${quiz.passingScore}%`);
  console.log(`   - Reward: ${quiz.rewardCoins} L-Coins`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

