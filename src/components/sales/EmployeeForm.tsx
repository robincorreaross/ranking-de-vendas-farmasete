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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee?.name || "",
      code: employee?.code || "",
      phone: employee?.phone || "",
      sales_value: employee?.sales_value?.toString() || "0",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const employeeData = {
        name: values.name,
        code: values.code,
        phone: values.phone,
        sales_value: parseFloat(values.sales_value),
        user_id: userData.user.id,
      };

      if (employee) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", employee.id);
        if (error) throw error;
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("employees")
          .insert([employeeData]);
        if (error) throw error;
        toast.success("Funcionário cadastrado com sucesso!");
      }

      setOpen(false);
      form.reset();
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
            <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{employee ? "Editar Funcionário" : "Cadastrar Funcionário"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 001" {...field} className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sales_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Valor da Venda (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="0.00" 
                      {...field} 
                      className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (employee ? "Atualizar" : "Cadastrar")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
