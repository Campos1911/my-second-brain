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

  // 1. Limpeza em cascata controlada para evitar conflitos de chaves estrangeiras
  await prisma.setLog.deleteMany();
  await prisma.workoutSession.deleteMany();
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

  // Receitas
  const catSalario = await prisma.category.create({
    data: { name: 'Salário', type: CategoryType.INCOME, userId },
  });
  const catInvestimentos = await prisma.category.create({
    data: { name: 'Investimentos', type: CategoryType.INCOME, userId },
  });

  // Despesas (Mapeadas de acordo com as transações comuns)
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

  // Categorias Fitness (Grupamentos Musculares)
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

  // 4. Criação de Transações Recorrentes (Contratos fixos / Assinaturas)
  console.log('🔄 Criando agendamentos recorrentes...');
  const hoje = new Date();

  // Netflix
  const recNetflix = await prisma.recurringTransaction.create({
    data: {
      amount: 55.9,
      description: 'Assinatura Streaming (Netflix)',
      frequency: RecurrenceFrequency.MONTHLY,
      startDate: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 10), // Iniciou há dois meses
      nextDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10),
      isActive: true,
      paymentMethod: PaymentMethod.CREDIT,
      userId,
      categoryId: catAssinatura.id,
    },
  });

  // Academia
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

  // 5. Histórico de Transações Manuais (Meses Corrente e Anterior)
  console.log('💰 Populando histórico de transações financeiras...');
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth(); // 0-indexed

  const transacoesMocks = [
    // --- MÊS ANTERIOR ---
    {
      description: 'Salário Mensal',
      amount: 5200.0,
      date: new Date(anoAtual, mesAtual - 1, 5),
      categoryId: catSalario.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Rendimentos Dividendos',
      amount: 145.2,
      date: new Date(anoAtual, mesAtual - 1, 15),
      categoryId: catInvestimentos.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Aluguel Apartamento',
      amount: 1800.0,
      date: new Date(anoAtual, mesAtual - 1, 10),
      categoryId: catAluguel.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Compras Semanais - Supermercado',
      amount: 420.5,
      date: new Date(anoAtual, mesAtual - 1, 6),
      categoryId: catSupermercado.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Jantar com Amigos',
      amount: 125.0,
      date: new Date(anoAtual, mesAtual - 1, 12),
      categoryId: catRestaurante.id,
      paymentMethod: PaymentMethod.CREDIT,
    },
    {
      description: 'Combustível Posto Ipiranga',
      amount: 180.0,
      date: new Date(anoAtual, mesAtual - 1, 18),
      categoryId: catTransporte.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Feira Orgânica e Hortifruti',
      amount: 98.4,
      date: new Date(anoAtual, mesAtual - 1, 22),
      categoryId: catSupermercado.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    // Transações geradas das recorrências criadas no mês anterior
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

    // --- MÊS ATUAL ---
    {
      description: 'Salário Mensal',
      amount: 5200.0,
      date: new Date(anoAtual, mesAtual, 5),
      categoryId: catSalario.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Rendimento de FIIs',
      amount: 162.8,
      date: new Date(anoAtual, mesAtual, 15),
      categoryId: catInvestimentos.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Aluguel Apartamento',
      amount: 1800.0,
      date: new Date(anoAtual, mesAtual, 10),
      categoryId: catAluguel.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Compras do Mês - Carrefour',
      amount: 550.2,
      date: new Date(anoAtual, mesAtual, 6),
      categoryId: catSupermercado.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Almoço Executivo Trabalho',
      amount: 45.9,
      date: new Date(anoAtual, mesAtual, 8),
      categoryId: catRestaurante.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Recarga Cartão Transporte',
      amount: 100.0,
      date: new Date(anoAtual, mesAtual, 14),
      categoryId: catTransporte.id,
      paymentMethod: PaymentMethod.DEBIT,
    },
    {
      description: 'Pizza de Fim de Semana',
      amount: 85.0,
      date: new Date(anoAtual, mesAtual, 20),
      categoryId: catRestaurante.id,
      paymentMethod: PaymentMethod.CREDIT,
    },
    // Transações geradas das recorrências criadas no mês atual
    {
      description: '[Recorrente] Assinatura Streaming (Netflix)',
      amount: 55.9,
      date: new Date(anoAtual, mesAtual, 10),
      categoryId: catAssinatura.id,
      paymentMethod: PaymentMethod.CREDIT,
      recurringTransactionId: recNetflix.id,
    },
    {
      description: '[Recorrente] Plano Mensal Academia',
      amount: 119.9,
      date: new Date(anoAtual, mesAtual, 5),
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

  // 7. Exercícios Atrelados às Fichas
  console.log('💪 Criando exercícios específicos...');

  // Treino A
  const exSupino = await prisma.exercise.create({
    data: {
      name: 'Supino Reto com Barra',
      categoryId: catPeito.id,
      workoutPlanId: planoA.id,
    },
  });
  const exCrossOver = await prisma.exercise.create({
    data: {
      name: 'Crossover Polia Média',
      categoryId: catPeito.id,
      workoutPlanId: planoA.id,
    },
  });
  const exTricepsPulley = await prisma.exercise.create({
    data: {
      name: 'Tríceps Pulley (Corda)',
      categoryId: catMembrosSuperiores.id,
      workoutPlanId: planoA.id,
    },
  });

  // Treino B
  const exPuxadaAlta = await prisma.exercise.create({
    data: {
      name: 'Puxada Alta Pronada',
      categoryId: catCostas.id,
      workoutPlanId: planoB.id,
    },
  });
  const exRemadaBaixa = await prisma.exercise.create({
    data: {
      name: 'Remada Baixa Triângulo',
      categoryId: catCostas.id,
      workoutPlanId: planoB.id,
    },
  });
  const exRoscaDireta = await prisma.exercise.create({
    data: {
      name: 'Rosca Direta com Barra W',
      categoryId: catMembrosSuperiores.id,
      workoutPlanId: planoB.id,
    },
  });

  console.log('✅ Exercícios inseridos.');

  // 8. Histórico de Sessões Concluídas (WorkoutSessions) + Histórico de Cargas (SetLogs)
  console.log('📈 Criando histórico de sessões e progressão de cargas...');

  // Sessão 1: Treino A realizado há 10 dias atrás (Cargas mais leves)
  const sessao1 = await prisma.workoutSession.create({
    data: {
      workoutPlanId: planoA.id,
      userId,
      startedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 10, 18, 0, 0),
      finishedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 10, 19, 5, 0),
    },
  });

  // Logs de Séries da Sessão 1
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
        toFailure: false,
      },
      {
        workoutSessionId: sessao1.id,
        exerciseId: exSupino.id,
        reps: 8,
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
      {
        workoutSessionId: sessao1.id,
        exerciseId: exTricepsPulley.id,
        reps: 12,
        weight: 25.0,
        toFailure: true,
      },
    ],
  });

  // Sessão 2: Treino B realizado há 7 dias atrás
  const sessao2 = await prisma.workoutSession.create({
    data: {
      workoutPlanId: planoB.id,
      userId,
      startedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 7, 19, 0, 0),
      finishedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 7, 20, 0, 0),
    },
  });

  await prisma.setLog.createMany({
    data: [
      {
        workoutSessionId: sessao2.id,
        exerciseId: exPuxadaAlta.id,
        reps: 12,
        weight: 40.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao2.id,
        exerciseId: exPuxadaAlta.id,
        reps: 10,
        weight: 45.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao2.id,
        exerciseId: exPuxadaAlta.id,
        reps: 8,
        weight: 50.0,
        toFailure: true,
      },

      {
        workoutSessionId: sessao2.id,
        exerciseId: exRemadaBaixa.id,
        reps: 12,
        weight: 35.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao2.id,
        exerciseId: exRemadaBaixa.id,
        reps: 10,
        weight: 40.0,
        toFailure: false,
      },

      {
        workoutSessionId: sessao2.id,
        exerciseId: exRoscaDireta.id,
        reps: 12,
        weight: 10.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao2.id,
        exerciseId: exRoscaDireta.id,
        reps: 10,
        weight: 12.0,
        toFailure: true,
      },
    ],
  });

  // Sessão 3: Treino A realizado há 3 dias atrás (Cargas progredidas!)
  const sessao3 = await prisma.workoutSession.create({
    data: {
      workoutPlanId: planoA.id,
      userId,
      startedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 3, 18, 15, 0),
      finishedAt: new Date(anoAtual, mesAtual, hoje.getDate() - 3, 19, 20, 0),
    },
  });

  await prisma.setLog.createMany({
    data: [
      // Supino Reto: aumento de carga de 60kg para 65kg
      {
        workoutSessionId: sessao3.id,
        exerciseId: exSupino.id,
        reps: 12,
        weight: 50.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao3.id,
        exerciseId: exSupino.id,
        reps: 10,
        weight: 65.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao3.id,
        exerciseId: exSupino.id,
        reps: 8,
        weight: 70.0,
        toFailure: true,
      },

      // Cross over mantido
      {
        workoutSessionId: sessao3.id,
        exerciseId: exCrossOver.id,
        reps: 12,
        weight: 15.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao3.id,
        exerciseId: exCrossOver.id,
        reps: 10,
        weight: 17.5,
        toFailure: false,
      },

      // Tríceps pulley: progressão de carga de 25kg para 30kg
      {
        workoutSessionId: sessao3.id,
        exerciseId: exTricepsPulley.id,
        reps: 12,
        weight: 25.0,
        toFailure: false,
      },
      {
        workoutSessionId: sessao3.id,
        exerciseId: exTricepsPulley.id,
        reps: 10,
        weight: 30.0,
        toFailure: true,
      },
    ],
  });

  console.log('✅ Histórico de treinos e logs de séries estruturados.');
  console.log('🚀 Seed completo. Sistema pronto para testes.');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o processo de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
