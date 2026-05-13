Este plano descreve a criação de um sistema de ranking de vendas profissional com visual "Dark Mode".

### Funcionalidades Principais
1. **Gestão de Funcionários**: Cadastro completo com nome, código, telefone e valor de vendas.
2. **Dashboard de Ranking**: Visualização dos melhores vendedores em ordem decrescente.
3. **Visualizações Gráficas**: 
   - Gráfico de barras para o ranking principal.
   - Gráfico de pizza para distribuição percentual das vendas.
4. **Alternador de Unidade**: Opção de visualizar os valores em Reais (R$) ou em Porcentagem (%).
5. **Estética Profissional**: Tema dark com tons de cinza escuro, azul marinho e detalhes vibrantes para destacar o pódio.

### Detalhes Técnicos
- **Banco de Dados**: Supabase (PostgreSQL) para armazenamento persistente.
- **Tabela `employees`**: `id`, `name`, `code`, `phone`, `sales_value`.
- **Frontend**: 
  - React com TanStack Router e React Query.
  - Tailwind CSS para o estilo Dark Mode.
  - Recharts para os gráficos interativos.
  - Shadcn/UI para componentes como formulários, diálogos e tabelas.
- **Lógica de Ranking**: Cálculo em tempo real no frontend para alternar entre valores absolutos e percentuais.

### Estrutura de Arquivos Proposta
- `src/components/sales/EmployeeForm.tsx`: Formulário de cadastro.
- `src/components/sales/RankingTable.tsx`: Lista classificada de funcionários.
- `src/components/sales/RankingCharts.tsx`: Componentes de gráfico de barras e pizza.
- `src/components/sales/MetricCards.tsx`: Destaques como total de vendas e ticket médio.
- `src/routes/index.tsx`: Dashboard principal unificando todos os componentes.
