import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignUp = false; // Registration disabled by user request

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message === "Invalid login credentials") {
        toast.error("E-mail ou senha incorretos. Por favor, tente novamente.");
      } else if (error.status === 422) {
        toast.error("Erro ao cadastrar: Verifique se a senha é forte o suficiente ou se o e-mail já existe.");
      } else if (error.message === "Email not confirmed") {
        toast.error("E-mail ainda não confirmado. Verifique sua caixa de entrada.");
      } else {
        toast.error(error.message || "Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Criar Conta" : "Acessar Sistema"}
          </CardTitle>
          <CardDescription className="text-slate-400 text-center">
            {isSignUp ? "Preencha os dados para se cadastrar" : "Entre com seu e-mail e senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">E-mail</label>
              <Input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSignUp ? "Cadastrar" : "Entrar")}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 italic">
              Acesso restrito a administradores autorizados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
