import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50/50 px-4">
      <div className="text-center max-w-md">
        {/* 404 number */}
        <div className="relative mb-6">
          <span className="text-[10rem] font-black text-gray-100 leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">📸</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Página não encontrada
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl px-6 shadow-md shadow-purple-500/20">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-gray-200">
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Fazer Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
