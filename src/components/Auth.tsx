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
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Verifique seu e-mail para confirmar o cadastro!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message);
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
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {isSignUp ? "Já tem uma conta? Entre aqui" : "Não tem conta? Cadastre-se agora"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
