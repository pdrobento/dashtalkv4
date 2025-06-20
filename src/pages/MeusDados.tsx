import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function MeusDados() {
  const [formData, setFormData] = useState({
    nomeCompleto: "Be Close - Agencia de IA",
    email: "becloseagencia@gmail.com",
    telefone: "+5541987790122",
    senha: "••••••••",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = () => {
    toast({
      title: "Alterações salvas",
      description: "Suas informações foram atualizadas com sucesso.",
    });
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="px-2 md:px-8 py-4 md:py-8 max-w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 overflow-auto">
          <h1 className="text-2xl font-bold">Conta</h1>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto" className="text-white text-base">
              Nome completo
            </Label>
            <Input
              id="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={(e) =>
                handleInputChange("nomeCompleto", e.target.value)
              }
              className="zatten-input h-12 text-base bg-transparent border-[#333] focus:border-[#555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="zatten-input h-12 text-base bg-transparent border-[#333] focus:border-[#555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-white text-base">
              Telefone
            </Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              className="zatten-input h-12 text-base bg-transparent border-[#333] focus:border-[#555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha" className="text-white text-base">
              Senha
            </Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => handleInputChange("senha", e.target.value)}
              className="zatten-input h-12 text-base bg-transparent border-[#333] focus:border-[#555]"
            />
          </div>

          <Button
            onClick={handleSaveChanges}
            className="bg-[#6366f1] hover:bg-[#5855eb] text-white px-6 py-3 rounded-lg font-medium mt-8"
          >
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
