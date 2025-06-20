import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!auth || !auth.signInWithPassword) {
      toast({
        title: "Erro de configuração",
        description: "Serviço de autenticação não está disponível.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Usando a função wrapper que criamos no AuthContext
      const { error } = await auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        console.error("Login error:", error);
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: error.message || "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive",
      });
      console.error("Unexpected login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    if (!auth || !auth.signInWithOAuth) {
      toast({
        title: "Erro de configuração",
        description: "Serviço de autenticação Google não está disponível.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Erro ao fazer login com Google",
          description: error.message,
          variant: "destructive",
        });
        console.error("Google login error:", error);
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description:
          error.message || "Ocorreu um erro ao tentar fazer login com Google.",
        variant: "destructive",
      });
      console.error("Unexpected Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101112] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="zatten-card border-[#222326]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white text-center">
              Entrar
            </CardTitle>
            <CardDescription className="text-[#9CA3AF] text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E5E5E5]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="zatten-input h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#E5E5E5]">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="zatten-input h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] hover:text-[#E5E5E5] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-[#232323] bg-[#181A1B] text-[#3B82F6] focus:ring-[#3B82F6] focus:ring-offset-0"
                  />
                  <span className="text-[#9CA3AF]">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full zatten-button-primary h-11 text-white font-medium"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* <div className="text-center mt-6">
              <span className="text-[#9CA3AF] text-sm">
                Não tem uma conta?{" "}
                <button className="text-[#3B82F6] hover:text-[#2563EB] transition-colors font-medium">
                  Criar conta
                </button>
              </span>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
