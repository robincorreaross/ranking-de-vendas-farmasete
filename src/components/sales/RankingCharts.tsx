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
  AreaChart,
  Area,
} from "recharts";

interface RankingChartsProps {
  employees: any[];
  displayUnit: "BRL" | "PERCENT";
  totalSales: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function RankingCharts({ employees, displayUnit, totalSales }: RankingChartsProps) {
  const chartData = employees
    .filter(emp => emp.sales_value > 0)
    .map((emp) => ({
      name: emp.name,
      value: displayUnit === "PERCENT" ? (totalSales > 0 ? (emp.sales_value / totalSales) * 100 : 0) : emp.sales_value,
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Ranking */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Performance</h3>
            <div className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded">RANKING</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employees.map(emp => ({ 
                name: emp.name, 
                value: displayUnit === "PERCENT" ? (totalSales > 0 ? (emp.sales_value / totalSales) * 100 : 0) : emp.sales_value,
                originalValue: emp.sales_value 
              }))} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold"
                  angle={-45} 
                  textAnchor="end" 
                  interval={0}
                  height={60}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickFormatter={(val) => displayUnit === "PERCENT" ? `${val}%` : `R$ ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Distribution */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Market Share</h3>
            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">DISTRIBUIÇÃO</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={0}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
