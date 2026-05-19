import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-3">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-500" />
            Política de Privacidade (LGPD)
          </h1>
          <p className="text-slate-400">Última atualização: 19 de Maio de 2026</p>
        </div>

        <section className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 mt-1">
              <Eye className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">1. Coleta de Dados</h2>
              <p className="leading-relaxed">
                Coletamos apenas os dados estritamente necessários para o funcionamento do ranking de vendas, 
                incluindo nome do funcionário, código de identificação e registros de vendas. 
                Estes dados são fornecidos voluntariamente pelos usuários administradores.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 mt-1">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">2. Uso das Informações</h2>
              <p className="leading-relaxed">
                As informações são utilizadas exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 ml-4">
                <li>Geração de relatórios de desempenho de vendas;</li>
                <li>Visualização do ranking entre funcionários;</li>
                <li>Autenticação e segurança da conta do administrador.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 mt-1">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">3. Seus Direitos (LGPD)</h2>
              <p className="leading-relaxed">
                Em conformidade com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 ml-4">
                <li>Acessar seus dados pessoais;</li>
                <li>Corrigir dados incompletos ou inexatos;</li>
                <li>Solicitar a exclusão de seus dados;</li>
                <li>Revogar o consentimento a qualquer momento.</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-white">Segurança</h3>
          <p className="text-sm text-slate-400">
            Utilizamos criptografia de ponta e infraestrutura segura (Supabase/Lovable Cloud) para garantir que seus dados 
            estejam protegidos contra acessos não autorizados.
          </p>
        </div>

        <footer className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© 2026 FarmaSETE. Todos os direitos reservados em conformidade com a LGPD.</p>
        </footer>
      </div>
    </div>
  );
}
