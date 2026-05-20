Parte do backend

async findAll(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Promise.all para performance: busca total e dados em paralelo
  const [total, data] = await Promise.all([
    this.prisma.transaction.count({ where: { userId, deletedAt: null } }),
    this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      take: limit,
      skip,
      select: this.transactionSelect,
      orderBy: { date: 'desc' },
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}

@Get()
async findAll(
  @GetCurrentUserId() userId: string,
  @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
) {
  return this.transactionsService.findAll(userId, page, limit);
}

---

Parte do frontend

export function useTransactions() {
return useQuery({
  queryKey: ["transactions"],
  queryFn: async () => {
    const response = await financeService.getTransactions();
    return Array.isArray(response.data) ? response.data : [];
  },
});
}

async getTransactions(): Promise<ApiResponse<Transaction[]>> {
  const response = await api.get<ApiResponse<Transaction[]>>("/transactions");
  return response.data;
},