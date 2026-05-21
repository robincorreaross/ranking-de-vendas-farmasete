import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RankingTableProps {
  employees: any[];
  onUpdate: () => void;
  displayUnit: "BRL" | "PERCENT";
  totalSales: number;
  showValues?: boolean;
}

export function RankingTable({ employees, onUpdate, displayUnit, totalSales, showValues = true }: RankingTableProps) {
  const formatValue = (value: number) => {
    if (!showValues && displayUnit === "BRL") return "••••••";
    if (displayUnit === "PERCENT") {
      const percent = totalSales > 0 ? (value / totalSales) * 100 : 0;
      return `${percent.toFixed(1)}%`;
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800/50">
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400 font-medium">Pos.</TableHead>
            <TableHead className="text-slate-400 font-medium">Funcionário</TableHead>
            <TableHead className="text-slate-400 font-medium">Código</TableHead>
            <TableHead className="text-slate-400 font-medium">Telefone</TableHead>
            <TableHead className="text-slate-400 font-medium text-right">Vendas</TableHead>
            <TableHead className="text-slate-400 font-medium text-right">Participação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee, index) => (
            <TableRow key={employee.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
              <TableCell className="font-bold text-slate-300">
                {index + 1}º
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{employee.name}</span>
                  {index === 0 && <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/20 uppercase font-bold">Líder</span>}
                </div>
              </TableCell>
              <TableCell className="text-slate-400 font-mono text-xs">{employee.code}</TableCell>
              <TableCell className="text-slate-400 text-xs">{employee.phone || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-white font-bold">{formatValue(employee.sales_value)}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    {index < employees.length / 2 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-rose-500" />
                    )}
                    <span>{showValues ? `${((employee.sales_value / (totalSales || 1)) * 100).toFixed(1)}% do total` : "••%"}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500">
                  {((employee.sales_value / (totalSales || 1)) * 100).toFixed(1)}%
                </div>
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                Nenhum vendedor com vendas registradas neste período.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
