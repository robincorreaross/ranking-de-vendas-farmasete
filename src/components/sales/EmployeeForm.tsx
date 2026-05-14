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
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-slate-800">Editar</Button>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> Nova Venda / Func.
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800 p-0 overflow-hidden">
        <Tabs defaultValue={employee ? "employee" : "sale"} className="w-full">
          <TabsList className="w-full bg-slate-800 rounded-none border-b border-slate-700">
            {!employee && (
              <TabsTrigger value="sale" className="flex-1 data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400">
                <DollarSign className="w-4 h-4 mr-2" /> Venda
              </TabsTrigger>
            )}
            <TabsTrigger value="employee" className="flex-1 data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400">
              <UserPlus className="w-4 h-4 mr-2" /> {employee ? "Editar Perfil" : "Novo Funcionário"}
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="sale">
              <DialogHeader className="mb-4">
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <Form {...saleForm}>
                <form onSubmit={saleForm.handleSubmit(onSaleSubmit)} className="space-y-4">
                  <FormField
                    control={saleForm.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funcionário</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="Selecione o vendedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {employeesList.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
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
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} className="bg-slate-800 border-slate-700 text-white" />
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
                        <FormLabel>Data da Venda</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-slate-800 border-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Venda"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="employee">
              <DialogHeader className="mb-4">
                <DialogTitle>{employee ? "Editar Dados do Funcionário" : "Cadastrar Novo Funcionário"}</DialogTitle>
              </DialogHeader>
              <Form {...employeeForm}>
                <form onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} className="space-y-4">
                  <FormField
                    control={employeeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" {...field} className="bg-slate-800 border-slate-700 text-white" />
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
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 001" {...field} className="bg-slate-800 border-slate-700 text-white" />
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
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} className="bg-slate-800 border-slate-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (employee ? "Salvar Alterações" : "Cadastrar Funcionário")}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
