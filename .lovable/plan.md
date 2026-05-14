Vou transformar o sistema em uma plataforma profissional de ranking de vendas com suporte a datas e filtros temporais.

### Alterações Estruturais (Banco de Dados)
- Criar uma nova tabela `sales` vinculada a `employees`.
- A tabela `sales` terá: `id`, `employee_id`, `amount`, `sale_date`, `created_at`.
- Isso permite que um vendedor tenha múltiplas vendas em dias diferentes.

### Novas Funcionalidades
1. **Filtro de Período**: Adicionar um seletor de data no cabeçalho (Hoje, Esta Semana, Este Mês, Personalizado).
2. **Cadastro de Venda**: O formulário será atualizado para permitir cadastrar uma venda específica vinculada a um funcionário e uma data.
3. **Ranking Dinâmico**: O ranking será calculado somando as vendas de cada funcionário dentro do período selecionado.
4. **Gráfico de Evolução**: Adicionar um gráfico de linha mostrando a evolução das vendas ao longo do tempo no período filtrado.

### Componentes Impactados
- `src/components/sales/DateFilter.tsx`: Novo componente para seleção de período.
- `src/components/sales/EmployeeForm.tsx`: Atualizado para cadastrar vendas ou funcionários.
- `src/routes/index.tsx`: Lógica principal de filtragem e soma de valores.
- `src/components/sales/RankingTable.tsx`: Mostrar a data da última venda ou o total no período.

Deseja que eu prossiga com a criação da tabela de vendas e a migração da lógica?
