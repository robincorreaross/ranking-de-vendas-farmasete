import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { X, ShieldCheck } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-xl bg-opacity-95">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-white">Privacidade e Cookies</h3>
              <button 
                onClick={() => setShow(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Utilizamos cookies e processamos dados pessoais para melhorar sua experiência em conformidade com a LGPD. 
              Ao continuar, você concorda com nossa{" "}
              <Link to="/privacy" className="text-blue-400 hover:underline">
                Política de Privacidade
              </Link>.
            </p>
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={decline}
              >
                Recusar
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={accept}
              >
                Aceitar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
