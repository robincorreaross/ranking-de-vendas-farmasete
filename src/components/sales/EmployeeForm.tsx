import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, DollarSign, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const employeeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  code: z.string().min(1, "Código é obrigatório"),
  phone: z.string().optional(),
});

const saleSchema = z.object({
  employee_id: z.string().min(1, "Selecione um funcionário"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Valor deve ser um número maior que zero",
  }),
  sale_date: z.string().min(1, "Data é obrigatória"),
});

type EmployeeValues = z.infer<typeof employeeSchema>;
type SaleValues = z.infer<typeof saleSchema>;

interface EmployeeFormProps {
  onSuccess: () => void;
  employee?: any;
}

export function EmployeeForm({ onSuccess, employee }: EmployeeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  const employeeForm = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || "",
      code: employee?.code || "",
      phone: employee?.phone || "",
    },
  });

  const saleForm = useForm<SaleValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      employee_id: "",
      amount: "",
      sale_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open && !employee) {
      fetchEmployees();
    }
  }, [open, employee]);

  async function fetchEmployees() {
    const { data } = await supabase.from("employees").select("id, name").order("name");
    setEmployeesList(data || []);
  }

  async function onEmployeeSubmit(values: EmployeeValues) {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const employeeData = {
        ...values,
        user_id: userData.user.id,
      };

      if (employee) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", employee.id);
        if (error) throw error;
        toast.success("Funcionário atualizado!");
      } else {
        const { error } = await supabase.from("employees").insert([employeeData]);
        if (error) throw error;
        toast.success("Funcionário cadastrado!");
      }

      setOpen(false);
      employeeForm.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSaleSubmit(values: SaleValues) {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const saleData = {
        employee_id: values.employee_id,
        amount: parseFloat(values.amount),
        sale_date: values.sale_date,
        user_id: userData.user.id,
      };

      const { error } = await supabase.from("sales").insert([saleData]);
      if (error) throw error;

      toast.success("Venda registrada com sucesso!");
      setOpen(false);
      saleForm.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {employee ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 flex items-center gap-1.5 px-3"
          >
            Editar
          </Button>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-600/20">
            <Plus className="mr-2 h-4 w-4" /> Nova Venda / Func.
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800 p-0 overflow-hidden shadow-2xl">
        {employee ? (
          <div className="flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-blue-400">
                  <UserPlus className="w-5 h-5" />
                  Editar Dados do Funcionário
                </DialogTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Atualize as informações do perfil de {employee.name}
                </p>
              </DialogHeader>
            </div>
            
            <div className="p-6">
              <Form {...employeeForm}>
                <form onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} className="space-y-4">
                  <FormField
                    control={employeeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" {...field} className="bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 transition-colors" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={employeeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Código</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 001" {...field} className="bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 transition-colors" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employeeForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} className="bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 transition-colors" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="flex-1 text-slate-400 hover:bg-slate-800"
                      onClick={() => setOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="sale" className="w-full">
            <TabsList className="w-full bg-slate-800/50 rounded-none border-b border-slate-800 h-14">
              <TabsTrigger value="sale" className="flex-1 h-full data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent transition-all">
                <DollarSign className="w-4 h-4 mr-2" /> Venda
              </TabsTrigger>
              <TabsTrigger value="employee" className="flex-1 h-full data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent transition-all">
                <UserPlus className="w-4 h-4 mr-2" /> Novo Funcionário
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="sale" className="mt-0">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-xl font-bold">Registrar Venda</DialogTitle>
                  <p className="text-sm text-slate-400">Adicione uma nova venda ao histórico</p>
                </DialogHeader>
                <Form {...saleForm}>
                  <form onSubmit={saleForm.handleSubmit(onSaleSubmit)} className="space-y-4">
                    <FormField
                      control={saleForm.control}
                      name="employee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Funcionário</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                <SelectValue placeholder="Selecione o vendedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              {employeesList.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id} className="focus:bg-slate-700 focus:text-white">
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={saleForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Valor (R$)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                              <Input placeholder="0.00" {...field} className="bg-slate-800/50 border-slate-700 text-white pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={saleForm.control}
                      name="sale_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Data da Venda</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-slate-800/50 border-slate-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-6 shadow-lg shadow-blue-600/20" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Venda"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="employee" className="mt-0">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-xl font-bold">Novo Funcionário</DialogTitle>
                  <p className="text-sm text-slate-400">Cadastre um novo membro na equipe</p>
                </DialogHeader>
                <Form {...employeeForm}>
                  <form onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} className="space-y-4">
                    <FormField
                      control={employeeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: João Silva" {...field} className="bg-slate-800/50 border-slate-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={employeeForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">Código</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 001" {...field} className="bg-slate-800/50 border-slate-700 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={employeeForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} className="bg-slate-800/50 border-slate-700 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-6 shadow-lg shadow-blue-600/20" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar Funcionário"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
