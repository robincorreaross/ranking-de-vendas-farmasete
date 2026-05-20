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
import { Plus, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

const saleSchema = z.object({
  employee_id: z.string().min(1, "Selecione um funcionário"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Valor deve ser um número maior que zero",
  }),
  sale_date: z.string().min(1, "Data é obrigatória"),
});

type SaleValues = z.infer<typeof saleSchema>;

interface SaleFormProps {
  onSuccess: () => void;
}

export function SaleForm({ onSuccess }: SaleFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  const saleForm = useForm<SaleValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      employee_id: "",
      amount: "",
      sale_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  async function fetchEmployees() {
    const { data } = await supabase.from("employees").select("id, name").order("name");
    setEmployeesList(data || []);
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
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-600/20">
          <Plus className="mr-2 h-4 w-4" /> Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800 p-0 overflow-hidden shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Registrar Venda
            </DialogTitle>
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
              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 text-slate-400 hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Venda"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
