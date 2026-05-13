import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface RankingChartsProps {
  employees: any[];
  displayUnit: "BRL" | "PERCENT";
  totalSales: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function RankingCharts({ employees, displayUnit, totalSales }: RankingChartsProps) {
  const chartData = employees.map((emp) => ({
    name: emp.name,
    value: displayUnit === "PERCENT" 
      ? (totalSales > 0 ? (emp.sales_value / totalSales) * 100 : 0)
      : emp.sales_value,
    originalValue: emp.sales_value,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-blue-400 text-sm">
            {displayUnit === "BRL" 
              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payload[0].value)
              : `${payload[0].value.toFixed(1)}%`}
          </p>
          {displayUnit === "PERCENT" && (
            <p className="text-slate-400 text-xs">
              Valor: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payload[0].payload.originalValue)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Ranking */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-white mb-6">Ranking de Vendas</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={12} 
                angle={-45} 
                textAnchor="end" 
                interval={0}
                height={60}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickFormatter={(val) => displayUnit === "PERCENT" ? `${val}%` : `R$ ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Distribution */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-white mb-6">Distribuição de Vendas</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
