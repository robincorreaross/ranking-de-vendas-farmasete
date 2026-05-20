import { useState } from "react";
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
import { Plus, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const employeeSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .transform(val => val.replace(/<[^>]*>/g, '').trim()),
  code: z.string()
    .min(1, "Código é obrigatório")
    .transform(val => val.replace(/<[^>]*>/g, '').trim()),
  phone: z.string()
    .optional()
    .transform(val => val ? val.replace(/<[^>]*>/g, '').trim() : val),
});

type EmployeeValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSuccess: () => void;
  employee?: any;
}

export function EmployeeForm({ onSuccess, employee }: EmployeeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const employeeForm = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || "",
      code: employee?.code || "",
      phone: employee?.phone || "",
    },
  });

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
            <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800 p-0 overflow-hidden shadow-2xl">
        <div className="flex flex-col">
          <div className="p-6 border-b border-slate-800 bg-slate-800/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-400 font-bold text-xl">
                <UserPlus className="w-5 h-5" />
                {employee ? "Editar Funcionário" : "Novo Funcionário"}
              </DialogTitle>
              <p className="text-sm text-slate-400 mt-1">
                {employee 
                  ? `Atualize as informações de ${employee.name}` 
                  : "Cadastre um novo membro na equipe"}
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
                  <Button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (employee ? "Salvar Alterações" : "Cadastrar Funcionário")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

