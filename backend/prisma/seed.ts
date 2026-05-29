import { PrismaPg } from '@prisma/adapter-pg';

import {
  PrismaClient,
  CategoryType,
  PaymentMethod,
  RecurrenceFrequency,
} from '../src/generated/prisma/client';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('🔄 Iniciando limpeza do banco de dados...');

  // 1. Limpeza em cascata controlada
  await prisma.setLog.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workoutPlanExercise.deleteMany(); // <-- Novo: Limpa tabela intermediária
  await prisma.exercise.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Banco de dados limpo com sucesso.');

  // 2. Criação do Usuário de Demonstração
  console.log('👤 Criando usuário de demonstração...');
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash('senhaSegura123', saltRounds);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@secondbrain.com',
      passwordHash,
    },
  });

  const userId = demoUser.id;
  console.log(
    `👤 Usuário criado com ID: ${userId} (Login: demo@secondbrain.com / Senha: senhaSegura123)`,
  );

  // 3. Criação de Categorias Financeiras e Fitness
  console.log('📂 Criando categorias padronizadas...');

  const catSalario = await prisma.category.create({
    data: { name: 'Salário', type: CategoryType.INCOME, userId },
  });
  const catInvestimentos = await prisma.category.create({
    data: { name: 'Investimentos', type: CategoryType.INCOME, userId },
  });
  const catAluguel = await prisma.category.create({
    data: { name: 'Aluguel & Moradia', type: CategoryType.EXPENSE, userId },
  });
  const catSupermercado = await prisma.category.create({
    data: { name: 'Supermercado', type: CategoryType.EXPENSE, userId },
  });
  const catRestaurante = await prisma.category.create({
    data: {
      name: 'Restaurantes & Delivery',
      type: CategoryType.EXPENSE,
      userId,
    },
  });
  const catTransporte = await prisma.category.create({
    data: {
      name: 'Transporte & Combustível',
      type: CategoryType.EXPENSE,
      userId,
    },
  });
  const catAssinatura = await prisma.category.create({
    data: {
      name: 'Assinaturas & Serviços',
      type: CategoryType.EXPENSE,
      userId,
    },
  });

  // Categorias Fitness
  const catPeito = await prisma.category.create({
    data: { name: 'Peito', type: CategoryType.FITNESS, userId },
  });
  const catCostas = await prisma.category.create({
    data: { name: 'Costas', type: CategoryType.FITNESS, userId },
  });
  const catPernas = await prisma.category.create({
    data: { name: 'Pernas', type: CategoryType.FITNESS, userId },
  });
  const catMembrosSuperiores = await prisma.category.create({
    data: { name: 'Braços & Ombros', type: CategoryType.FITNESS, userId },
  });

  console.log('✅ Categorias criadas.');

  // 4. Criação de Transações Recorrentes
  console.log('🔄 Criando agendamentos recorrentes...');
  const hoje = new Date();

  const recNetflix = await prisma.recurringTransaction.create({
    data: {
      amount: 55.9,
      description: 'Assinatura Streaming (Netflix)',
      frequency: RecurrenceFrequency.MONTHLY,
      startDate: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 10),
      nextDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10),
      isActive: true,
      paymentMethod: PaymentMethod.CREDIT,
      userId,
      categoryId: catAssinatura.id,
    },
  });

  const recAcademia = await prisma.recurringTransaction.create({
    data: {
      amount: 119.9,
      description: 'Plano Mensal Academia',
      frequency: RecurrenceFrequency.MONTHLY,
      startDate: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 5),
      nextDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5),
      isActive: true,
      paymentMethod: PaymentMethod.DEBIT,
      userId,
      categoryId: catAssinatura.id,
    },
  });

  console.log('✅ Recorrências salvas.');

  // 5. Histórico de Transações Manuais
  console.log('💰 Populando histórico de transações financeiras...');
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const transacoesMocks = [
    {
      description: 'Salário Mensal',
      amount: 5200.0,
      date: new Date(anoAtual, mesAtual - 1, 5),
      categoryId: catSalario.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Aluguel Apartamento',
      amount: 1800.0,
      date: new Date(anoAtual, mesAtual - 1, 10),
      categoryId: catAluguel.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    // Transações geradas das recorrências
    {
      description: '[Recorrente] Assinatura Streaming (Netflix)',
      amount: 55.9,
      date: new Date(anoAtual, mesAtual - 1, 10),
      categoryId: catAssinatura.id,
      paymentMethod: PaymentMethod.CREDIT,
      recurringTransactionId: recNetflix.id,
    },
    {
      description: '[Recorrente] Plano Mensal Academia',
      amount: 119.9,
      date: new Date(anoAtual, mesAtual - 1, 5),
      categoryId: catAssinatura.id,
      paymentMethod: PaymentMethod.DEBIT,
      recurringTransactionId: recAcademia.id,
    },
  ];

  for (const t of transacoesMocks) {
    await prisma.transaction.create({
      data: {
        description: t.description,
        amount: t.amount,
        date: t.date,
        userId,
        categoryId: t.categoryId,
        paymentMethod: t.paymentMethod,
        recurringTransactionId: t.recurringTransactionId || null,
      },
    });
  }

  console.log('✅ Histórico financeiro populado.');

  // 6. Fichas de Treino (Workout Plans)
  console.log('🏋️ Criando fichas de treino...');

  const planoA = await prisma.workoutPlan.create({
    data: {
      name: 'Treino A - Peito & Tríceps',
      userId,
    },
  });

  const planoB = await prisma.workoutPlan.create({
    data: {
      name: 'Treino B - Costas & Bíceps',
      userId,
    },
  });

  console.log('✅ Fichas criadas.');

  // 7. Exercícios Cadastrados de Forma Independente na Biblioteca
  console.log('💪 Cadastrando biblioteca de exercícios...');

  // Exercícios criados na biblioteca do usuário
  const exSupino = await prisma.exercise.create({
    data: { name: 'Supino Reto com Barra', categoryId: catPeito.id, userId },
  });
  const exCrossOver = await prisma.exercise.create({
    data: { name: 'Crossover Polia Média', categoryId: catPeito.id, userId },
  });
  const exTricepsPulley = await prisma.exercise.create({
    data: {
      name: 'Tríceps Pulley (Corda)',
      categoryId: catMembrosSuperiores.id,
      userId,
    },
  });

  const exPuxadaAlta = await prisma.exercise.create({
    data: { name: 'Puxada Alta Pronada', categoryId: catCostas.id, userId },
  });
  const exRemadaBaixa = await prisma.exercise.create({
    data: { name: 'Remada Baixa Triângulo', categoryId: catCostas.id, userId },
  });
  const exRoscaDireta = await prisma.exercise.create({
    data: {
      name: 'Rosca Direta com Barra W',
      categoryId: catMembrosSuperiores.id,
      userId,
    },
  });

  console.log('🔗 Criando vínculos Many-to-Many entre planos e exercícios...');
  await prisma.workoutPlanExercise.createMany({
    data: [
      { workoutPlanId: planoA.id, exerciseId: exSupino.id },
      { workoutPlanId: planoA.id, exerciseId: exCrossOver.id },
      { workoutPlanId: planoA.id, exerciseId: exTricepsPulley.id },
      { workoutPlanId: planoB.id, exerciseId: exPuxadaAlta.id },
      { workoutPlanId: planoB.id, exerciseId: exRemadaBaixa.id },
      { workoutPlanId: planoB.id, exerciseId: exRoscaDireta.id },
    ],
  });

  console.log('✅ Exercícios inseridos e vinculados aos planos.');

  // 8. Histórico de Sessões Concluídas + Histórico de Cargas (SetLogs)
  console.log('📈 Criando histórico de sessões e progressão de cargas...');

  const sessao1 = await prisma.workoutSession.create({
    data: {
      workoutPlanId: planoA.id,
      userId,
      startedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 10, 18, 0, 0),
      finishedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 10, 19, 5, 0),
    },
  });

  await prisma.setLog.createMany({
    data: [
      {
        workoutSessionId: sessao1.id,
        exerciseId: exSupino.id,
        reps: 12,
        weight: 50.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao1.id,
        exerciseId: exSupino.id,
        reps: 10,
        weight: 60.0,
        toFailure: true,
      },
      {
        workoutSessionId: sessao1.id,
        exerciseId: exCrossOver.id,
        reps: 12,
        weight: 15.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao1.id,
        exerciseId: exTricepsPulley.id,
        reps: 15,
        weight: 20.0,
        toFailure: false,
      },
    ],
  });

  console.log('✅ Histórico de treinos e logs de séries estruturados.');
  console.log('🚀 Seed completo. Sistema pronto para uso.');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o processo de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
