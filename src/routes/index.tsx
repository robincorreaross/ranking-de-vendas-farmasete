import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";

import { RankingTable } from "@/components/sales/RankingTable";
import { RankingCharts } from "@/components/sales/RankingCharts";
import { MetricCards } from "@/components/sales/MetricCards";
import { DateFilter, DateRange } from "@/components/sales/DateFilter";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, BarChart3, ListOrdered, LayoutDashboard, Settings, Globe } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfMonth, endOfMonth, format, subYears, startOfDay } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [generalEmployees, setGeneralEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayUnit, setDisplayUnit] = useState<"BRL" | "PERCENT">("PERCENT");
  const [showValues, setShowValues] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: "Este Mês"
  });

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          if (currentSession) {
            await fetchData();
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Session init error:", err);
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      
      console.log("Auth event:", event);
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setEmployees([]);
        setLoading(false);
        return;
      }

      if (newSession?.access_token !== session?.access_token) {
        setSession(newSession);
        if (newSession) {
          fetchData().catch(console.error);
        } else {
          setEmployees([]);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [dateRange]);

  async function fetchData() {
    try {
      setLoading(true);
      
      const threeYearsAgo = subYears(new Date(), 3);
      const today = new Date();

      const [empRes, salesRes, generalSalesRes] = await Promise.all([
        supabase.from("employees").select("*").order("name"),
        supabase.from("sales")
          .select("*")
          .gte("sale_date", format(dateRange.from, 'yyyy-MM-dd'))
          .lte("sale_date", format(dateRange.to, 'yyyy-MM-dd')),
        supabase.from("sales")
          .select("*")
          .gte("sale_date", format(threeYearsAgo, 'yyyy-MM-dd'))
          .lte("sale_date", format(today, 'yyyy-MM-dd'))
      ]);

      if (empRes.error) throw empRes.error;
      if (salesRes.error) throw salesRes.error;
      if (generalSalesRes.error) throw generalSalesRes.error;

      const allEmployees = empRes.data || [];

      // Calculate current period ranking
      const employeesWithSales = allEmployees.map(emp => {
        const empSales = (salesRes.data || [])
          .filter(sale => sale.employee_id === emp.id)
          .reduce((sum, sale) => sum + Number(sale.amount), 0);
        
        return {
          ...emp,
          sales_value: empSales
        };
      }).sort((a, b) => b.sales_value - a.sales_value);

      // Calculate general ranking (3 years)
      const generalRanking = allEmployees.map(emp => {
        const empSales = (generalSalesRes.data || [])
          .filter(sale => sale.employee_id === emp.id)
          .reduce((sum, sale) => sum + Number(sale.amount), 0);
        
        return {
          ...emp,
          sales_value: empSales
        };
      }).sort((a, b) => b.sales_value - a.sales_value);

      setEmployees(employeesWithSales);
      setGeneralEmployees(generalRanking);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados: " + (error.message || "Verifique sua conexão"));
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const totalSales = employees.reduce((acc, curr) => acc + (curr.sales_value || 0), 0);
  const totalGeneralSales = generalEmployees.reduce((acc, curr) => acc + (curr.sales_value || 0), 0);

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                VENDAS FARMASETE
              </h1>
              <p className="text-slate-400 text-sm font-medium">Dashboard de Desempenho da Equipe</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <DateFilter onRangeChange={setDateRange} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
              className="bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            >
              {showValues ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showValues ? "Ocultar" : "Mostrar"}
            </Button>
            
            <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
              <Label htmlFor="unit-toggle" className="text-xs font-bold text-slate-500">R$</Label>
              <Switch
                id="unit-toggle"
                checked={displayUnit === "PERCENT"}
                onCheckedChange={(checked) => setDisplayUnit(checked ? "PERCENT" : "BRL")}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="unit-toggle" className="text-xs font-bold text-slate-500">%</Label>
            </div>
            
            <Link to="/admin">
              <Button className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                <Settings className="mr-2 h-4 w-4" /> Painel Admin
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-bold gap-2"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </Button>
          </div>
        </header>

        {/* Metrics */}
        <MetricCards employees={employees} showValues={showValues} />

        {/* Main Content */}
        <Tabs defaultValue="table" className="space-y-6">
          <TabsList className="bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl backdrop-blur-md">
            <TabsTrigger value="table" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all">
              <ListOrdered className="h-4 w-4 mr-2" /> Top Vendedores
            </TabsTrigger>
            <TabsTrigger value="general" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all">
              <Globe className="h-4 w-4 mr-2" /> Ranking Geral
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all">
              <BarChart3 className="h-4 w-4 mr-2" /> Gráfico de Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="outline-none focus-visible:ring-0">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Classificação de Vendedores</h3>
                  <p className="text-slate-500 text-sm mt-1">Período: {dateRange.label}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-500">{employees.length}</span>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Vendedores Ativos</p>
                </div>
              </div>
              <RankingTable 
                employees={employees} 
                onUpdate={fetchData} 
                displayUnit={displayUnit} 
                totalSales={totalSales} 
                showValues={showValues}
              />
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6 outline-none focus-visible:ring-0">
            <RankingCharts employees={employees} displayUnit={displayUnit} totalSales={totalSales} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
