import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeForm } from "@/components/sales/EmployeeForm";
import { Trash2, Users, Receipt, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchEmployees();
        fetchSales();
      } else setLoading(false);
    });
  }, []);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");
      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSales() {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*, employees(name)")
        .order("sale_date", { ascending: false });
      if (error) throw error;
      setSales(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      toast.success("Funcionário excluído!");
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleDeleteSale(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return;
    try {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
      toast.success("Venda excluída!");
      fetchSales();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">
                PAINEL ADMINISTRATIVO
              </h1>
              <p className="text-slate-400 text-sm font-medium">Gestão de Funcionários e Vendas</p>
            </div>
          </div>
          <div className="flex gap-2">
            <EmployeeForm onSuccess={() => { fetchEmployees(); fetchSales(); }} />
          </div>
        </header>

        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl">
            <TabsTrigger value="employees" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Users className="h-4 w-4 mr-2" /> Funcionários
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Receipt className="h-4 w-4 mr-2" /> Vendas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Nome</TableHead>
                    <TableHead className="text-slate-400">Código</TableHead>
                    <TableHead className="text-slate-400">Telefone</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{emp.name}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">{emp.code}</TableCell>
                      <TableCell className="text-slate-400 text-xs">{emp.phone || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <EmployeeForm employee={emp} onSuccess={fetchEmployees} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            onClick={() => handleDeleteEmployee(emp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Data</TableHead>
                    <TableHead className="text-slate-400">Funcionário</TableHead>
                    <TableHead className="text-slate-400">Valor</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="border-slate-800">
                      <TableCell className="text-slate-300">
                        {format(new Date(sale.sale_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {sale.employees?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-emerald-400 font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(sale.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          onClick={() => handleDeleteSale(sale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
