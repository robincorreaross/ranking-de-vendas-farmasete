import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award } from "lucide-react";

interface ChampionRankingTableProps {
  data: any[];
}

export function ChampionRankingTable({ data }: ChampionRankingTableProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 1:
        return <Medal className="h-5 w-5 text-slate-300" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-slate-500 font-bold ml-1.5">{index + 1}º</span>;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-medium">
        Nenhum registro encontrado no período.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="w-[80px] text-slate-400 font-bold uppercase text-[10px] tracking-widest">Posição</TableHead>
            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Vendedor</TableHead>
            <TableHead className="text-right text-slate-400 font-bold uppercase text-[10px] tracking-widest">Vitórias (Dias)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50">
                  {getRankIcon(index)}
                </div>
              </TableCell>
              <TableCell className="font-bold text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs border border-blue-500/20">
                    {item.code || item.name.substring(0, 2).toUpperCase()}
                  </div>
                  {item.name}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="text-blue-400 font-black text-lg mr-1">{item.wins}</span>
                  <span className="text-blue-500/60 text-[10px] font-bold uppercase tracking-tighter">Dias</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
