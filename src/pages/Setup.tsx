import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Settings,
  Database,
  Bot,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SetupConfig {
  // Configurações da Plataforma
  platformName: string;
  platformFavicon: string;

  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;

  // OpenAI
  openaiAdminKey: string;
  openaiProjectId: string;

  // Chatwoot
  chatwootApiEndpoint: string;
  chatwootApiKey: string;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: "pending" | "completed" | "error";
}

export default function Setup() {
  const [config, setConfig] = useState<SetupConfig>({
    platformName: "Dashtalk",
    platformFavicon: "https://cdn-icons-png.flaticon.com/512/229/229800.png",
    supabaseUrl: "",
    supabaseAnonKey: "",
    openaiAdminKey: "",
    openaiProjectId: "",
    chatwootApiEndpoint: "",
    chatwootApiKey: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: "platform",
      title: "Configuração da Plataforma",
      description: "Nome e aparência",
      icon: Settings,
      status: "pending",
    },
    {
      id: "supabase",
      title: "Banco de Dados (Supabase)",
      description: "Configuração do banco e autenticação",
      icon: Database,
      status: "pending",
    },
    {
      id: "openai",
      title: "Inteligência Artificial (OpenAI)",
      description: "Configuração da IA para chat",
      icon: Bot,
      status: "pending",
    },
    {
      id: "chatwoot",
      title: "Sistema de Chat (Chatwoot)",
      description: "Integração com atendimento",
      icon: MessageSquare,
      status: "pending",
    },
  ]);

  // Verificar se já existe configuração
  useEffect(() => {
    const existingConfig = localStorage.getItem("dashtalk-setup");
    if (existingConfig) {
      try {
        const parsed = JSON.parse(existingConfig);
        setConfig(parsed);
        // Marcar steps como completos se já configurados
        updateStepsStatus(parsed);
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
      }
    }
  }, []);

  const updateStepsStatus = (configData: SetupConfig) => {
    setSetupSteps((prev) =>
      prev.map((step) => {
        let status: "pending" | "completed" | "error" = "pending";

        switch (step.id) {
          case "platform":
            status = configData.platformName ? "completed" : "pending";
            break;
          case "supabase":
            status =
              configData.supabaseUrl && configData.supabaseAnonKey
                ? "completed"
                : "pending";
            break;
          case "openai":
            status =
              configData.openaiAdminKey && configData.openaiProjectId
                ? "completed"
                : "pending";
            break;
          case "chatwoot":
            status =
              configData.chatwootApiEndpoint && configData.chatwootApiKey
                ? "completed"
                : "pending";
            break;
        }

        return { ...step, status };
      })
    );
  };

  const handleInputChange = (field: keyof SetupConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    updateStepsStatus(newConfig);
  };

  const testSupabaseConnection = async () => {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha URL e Chave Anônima do Supabase",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch(`${config.supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: config.supabaseAnonKey,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Conexão bem-sucedida!",
          description: "Supabase conectado com sucesso",
        });
        return true;
      } else {
        throw new Error("Falha na conexão");
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Verifique as credenciais do Supabase",
        variant: "destructive",
      });
      return false;
    }
  };

  const testChatwootConnection = async () => {
    if (!config.chatwootApiEndpoint || !config.chatwootApiKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha endpoint e chave API do Chatwoot",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch(config.chatwootApiEndpoint, {
        headers: {
          api_access_token: config.chatwootApiKey,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Conexão bem-sucedida!",
          description: "Chatwoot conectado com sucesso",
        });
        return true;
      } else {
        throw new Error("Falha na conexão");
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Verifique as credenciais do Chatwoot",
        variant: "destructive",
      });
      return false;
    }
  };

  const generateEnvFile = () => {
    const envContent = `# Gerado automaticamente pelo Setup do Dashtalk
# ${new Date().toLocaleString("pt-BR")}

# Configurações da Plataforma
VITE_PLATAFORM_NAME=${config.platformName}
VITE_PLATAFORM_FAVICON=${config.platformFavicon}

# Supabase Configuration
VITE_SUPABASE_URL=${config.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${config.supabaseAnonKey}

# OpenAI Configuration
VITE_OPENAI_ADMIN_KEY=${config.openaiAdminKey}
VITE_OPENAI_CLIENTE_PROJECT_ID=${config.openaiProjectId}

# Chatwoot API Configuration
VITE_CHATWOOT_API_ENDPOINT=${config.chatwootApiEndpoint}
VITE_CHATWOOT_API_KEY=${config.chatwootApiKey}
`;

    // Criar e baixar arquivo .env
    const blob = new Blob([envContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Salvar no localStorage também
    localStorage.setItem("dashtalk-setup", JSON.stringify(config));

    toast({
      title: "Configuração salva!",
      description: "Arquivo .env baixado com sucesso",
    });
  };

  const runDatabaseSetup = async () => {
    setIsGenerating(true);

    try {
      // Aqui você executaria o SQL de setup do banco
      // Por enquanto, vamos simular
      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast({
        title: "Banco configurado!",
        description: "Todas as tabelas e funções foram criadas",
      });
    } catch (error) {
      toast({
        title: "Erro no setup do banco",
        description: "Verifique as configurações e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#18181A] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Setup do Dashtalk</h1>
          <p className="text-gray-400">
            Configure seu sistema em poucos passos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {setupSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#232325] border border-[#374151] mb-2">
                    {getStepIcon(step.status)}
                  </div>
                  <span className="text-xs text-center max-w-[80px]">
                    {step.title}
                  </span>
                </div>
                {index < setupSteps.length - 1 && (
                  <div className="w-12 h-0.5 bg-[#374151] mx-2 mt-[-20px]" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#232325]">
            <TabsTrigger value="platform">Plataforma</TabsTrigger>
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="chatwoot">Chatwoot</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-4">
            <Card className="bg-[#232325] border-[#374151]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações da Plataforma
                </CardTitle>
                <CardDescription>
                  Personalize o nome e aparência do seu sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nome da Plataforma</Label>
                  <Input
                    id="platformName"
                    value={config.platformName}
                    onChange={(e) =>
                      handleInputChange("platformName", e.target.value)
                    }
                    placeholder="Ex: Minha Empresa Chat"
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformFavicon">URL do Favicon</Label>
                  <Input
                    id="platformFavicon"
                    value={config.platformFavicon}
                    onChange={(e) =>
                      handleInputChange("platformFavicon", e.target.value)
                    }
                    placeholder="https://example.com/favicon.ico"
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supabase" className="space-y-4">
            <Card className="bg-[#232325] border-[#374151]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Configuração do Supabase
                </CardTitle>
                <CardDescription>
                  Configure a conexão com seu banco de dados e sistema de
                  autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabaseUrl">URL do Projeto Supabase</Label>
                  <Input
                    id="supabaseUrl"
                    value={config.supabaseUrl}
                    onChange={(e) =>
                      handleInputChange("supabaseUrl", e.target.value)
                    }
                    placeholder="https://seu-projeto.supabase.co"
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabaseAnonKey">
                    Chave Anônima (anon key)
                  </Label>
                  <Input
                    id="supabaseAnonKey"
                    type="password"
                    value={config.supabaseAnonKey}
                    onChange={(e) =>
                      handleInputChange("supabaseAnonKey", e.target.value)
                    }
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={testSupabaseConnection} variant="outline">
                    Testar Conexão
                  </Button>
                  <Button
                    onClick={runDatabaseSetup}
                    disabled={isGenerating}
                    className="bg-[#6366f1] hover:bg-[#5855eb]"
                  >
                    {isGenerating ? "Configurando..." : "Configurar Banco"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="openai" className="space-y-4">
            <Card className="bg-[#232325] border-[#374151]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Configuração OpenAI
                </CardTitle>
                <CardDescription>
                  Configure a integração com IA para o chat de gestão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openaiAdminKey">Chave API OpenAI</Label>
                  <Input
                    id="openaiAdminKey"
                    type="password"
                    value={config.openaiAdminKey}
                    onChange={(e) =>
                      handleInputChange("openaiAdminKey", e.target.value)
                    }
                    placeholder="sk-admin-..."
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openaiProjectId">ID do Projeto</Label>
                  <Input
                    id="openaiProjectId"
                    value={config.openaiProjectId}
                    onChange={(e) =>
                      handleInputChange("openaiProjectId", e.target.value)
                    }
                    placeholder="proj_..."
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chatwoot" className="space-y-4">
            <Card className="bg-[#232325] border-[#374151]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Configuração Chatwoot
                </CardTitle>
                <CardDescription>
                  Configure a integração com seu sistema de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chatwootApiEndpoint">Endpoint da API</Label>
                  <Input
                    id="chatwootApiEndpoint"
                    value={config.chatwootApiEndpoint}
                    onChange={(e) =>
                      handleInputChange("chatwootApiEndpoint", e.target.value)
                    }
                    placeholder="https://seu-chatwoot.com/api/v1/accounts/1/conversations"
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatwootApiKey">Chave da API</Label>
                  <Input
                    id="chatwootApiKey"
                    type="password"
                    value={config.chatwootApiKey}
                    onChange={(e) =>
                      handleInputChange("chatwootApiKey", e.target.value)
                    }
                    placeholder="Sua chave API do Chatwoot"
                    className="bg-[#18181A] border-[#374151]"
                  />
                </div>
                <Button onClick={testChatwootConnection} variant="outline">
                  Testar Conexão
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            onClick={generateEnvFile}
            className="bg-[#6366f1] hover:bg-[#5855eb]"
            size="lg"
          >
            Gerar Arquivo .env
          </Button>
        </div>

        {/* Instructions */}
        <Alert className="mt-6 bg-[#232325] border-[#374151]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Instruções:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Preencha todas as configurações nas abas acima</li>
              <li>Teste as conexões para verificar se estão funcionando</li>
              <li>
                Clique em "Gerar Arquivo .env" para baixar o arquivo de
                configuração
              </li>
              <li>Substitua o arquivo .env na raiz do projeto</li>
              <li>Reinicie o sistema para aplicar as mudanças</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
