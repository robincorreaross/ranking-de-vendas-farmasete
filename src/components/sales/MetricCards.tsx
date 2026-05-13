import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Target, TrendingUp } from "lucide-react";

interface MetricCardsProps {
  employees: any[];
}

export function MetricCards({ employees }: MetricCardsProps) {
  const totalSales = employees.reduce((acc, curr) => acc + (curr.sales_value || 0), 0);
  const averageSales = employees.length > 0 ? totalSales / employees.length : 0;
  const topSales = employees.length > 0 ? Math.max(...employees.map(e => e.sales_value)) : 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const metrics = [
    {
      title: "Vendas Totais",
      value: formatCurrency(totalSales),
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Média por Vendedor",
      value: formatCurrency(averageSales),
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Maior Venda",
      value: formatCurrency(topSales),
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Total Vendedores",
      value: employees.length.toString(),
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-slate-900 border-slate-800 shadow-lg group hover:border-slate-700 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bg}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
              {metric.value}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-bold">↑ 12%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
