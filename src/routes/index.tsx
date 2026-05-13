import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { EmployeeForm } from "@/components/sales/EmployeeForm";
import { RankingTable } from "@/components/sales/RankingTable";
import { RankingCharts } from "@/components/sales/RankingCharts";
import { MetricCards } from "@/components/sales/MetricCards";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, BarChart3, ListOrdered, LayoutDashboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayUnit, setDisplayUnit] = useState<"BRL" | "PERCENT">("BRL");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchEmployees();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchEmployees();
      else {
        setEmployees([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("sales_value", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const totalSales = employees.reduce((acc, curr) => acc + (curr.sales_value || 0), 0);

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sales Ranking</h1>
              <p className="text-slate-400 text-sm">Gerencie e visualize o desempenho da sua equipe</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
              <Label htmlFor="unit-toggle" className="text-sm font-medium text-slate-400">R$</Label>
              <Switch
                id="unit-toggle"
                checked={displayUnit === "PERCENT"}
                onCheckedChange={(checked) => setDisplayUnit(checked ? "PERCENT" : "BRL")}
              />
              <Label htmlFor="unit-toggle" className="text-sm font-medium text-slate-400">%</Label>
            </div>
            <EmployeeForm onSuccess={fetchEmployees} />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-slate-800">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Metrics */}
        <MetricCards employees={employees} />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              <LayoutDashboard className="h-4 w-4 mr-2" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              <ListOrdered className="h-4 w-4 mr-2" /> Ranking Detalhado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <RankingCharts employees={employees} displayUnit={displayUnit} totalSales={totalSales} />
          </TabsContent>

          <TabsContent value="table" className="outline-none">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Classificação de Vendedores</h3>
                <span className="text-xs text-slate-500">Total de {employees.length} registros</span>
              </div>
              <RankingTable 
                employees={employees} 
                onUpdate={fetchEmployees} 
                displayUnit={displayUnit} 
                totalSales={totalSales} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
