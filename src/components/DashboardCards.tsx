import { MessageSquare, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

// Available months for filtering
const availableMonths = [
  { value: "01-2025", label: "Janeiro 2025" },
  { value: "02-2025", label: "Fevereiro 2025" },
  { value: "03-2025", label: "Março 2025" },
  { value: "04-2025", label: "Abril 2025" },
  { value: "05-2025", label: "Maio 2025" },
  { value: "06-2025", label: "Junho 2025" },
  { value: "07-2025", label: "Julho 2025" },
  { value: "08-2025", label: "Agosto 2025" },
  { value: "09-2025", label: "Setembro 2025" },
  { value: "10-2025", label: "Outubro 2025" },
  { value: "11-2025", label: "Novembro 2025" },
  { value: "12-2025", label: "Dezembro 2025" },
];

// Get current month as default (May 2025)
const getCurrentMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${month}-${year}`;
};

// Function to get Unix timestamps for start and end of month
const getMonthUnixTimestamps = (monthValue: string) => {
  const [month, year] = monthValue.split("-");

  console.log("Getting timestamps for month:", monthValue);
  console.log("Parsed month:", month, "year:", year);

  // Start of month (1st day at 00:00:00)
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const startTime = Math.floor(startDate.getTime() / 1000);

  // End of month (last day at 23:59:59)
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
  const endTime = Math.floor(endDate.getTime() / 1000);

  console.log("Start date:", startDate, "Unix:", startTime);
  console.log("End date:", endDate, "Unix:", endTime);
  console.log(
    "Date range:",
    new Date(startTime * 1000).toLocaleDateString("pt-BR"),
    "to",
    new Date(endTime * 1000).toLocaleDateString("pt-BR")
  );

  return { startTime, endTime };
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = "bg-[#1a1c1e]",
  iconColor = "text-white",
}: StatCardProps) {
  return (
    <Card className="bg-[#1a1c1e] border-[#323232] overflow-hidden w-full">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`rounded p-1.5 md:p-2 ${iconBg}`}>
            <Icon size={16} className={`md:size-[18px] ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-sm text-gray-400 truncate">
              {title}
            </div>
            <div className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1 truncate">
              {value}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardCardsProps {
  selectedMonth?: string;
}

export default function DashboardCards({
  selectedMonth: propMonth,
}: DashboardCardsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Converter o nome do mês para o formato MM-YYYY
  const getMonthFormat = (monthName: string) => {
    const monthMap: { [key: string]: string } = {
      janeiro: "01",
      fevereiro: "02",
      março: "03",
      abril: "04",
      maio: "05",
      junho: "06",
      julho: "07",
      agosto: "08",
      setembro: "09",
      outubro: "10",
      novembro: "11",
      dezembro: "12",
    };
    const monthNumber = monthMap[monthName.toLowerCase()] || "05";
    return `${monthNumber}-2025`;
  };

  // Usar o mês das props ou o valor padrão
  const [selectedMonth, setSelectedMonth] = useState(
    propMonth ? getMonthFormat(propMonth) : getCurrentMonth()
  );

  // Atualizar quando as props mudarem
  useEffect(() => {
    if (propMonth) {
      const formattedMonth = getMonthFormat(propMonth);
      console.log(
        "Props month changed to:",
        propMonth,
        "Formatted:",
        formattedMonth
      );
      setSelectedMonth(formattedMonth);
    }
  }, [propMonth]);

  const [tokenData, setTokenData] = useState({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  });

  const fetchOpenAIUsage = async (monthValue: string) => {
    try {
      setLoading(true);

      console.log("Fetching OpenAI usage for month:", monthValue);

      // Get Unix timestamps for the selected month
      const { startTime, endTime } = getMonthUnixTimestamps(monthValue);

      const apiUrl = `https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&end_time=${endTime}&limit=30`;
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_ADMIN_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to fetch OpenAI usage data"
        );
      }
      const data = await response.json();

      // Log the OpenAI API response for debugging
      console.log("OpenAI API Response:", data);

      // Calculate totals from API response
      if (data && data.data && data.data.length > 0) {
        let totalInput = 0;
        let totalOutput = 0;

        // Percorrer todos os objetos do array data
        data.data.forEach((bucket: any) => {
          // Verificar se há resultados para este "bucket"
          if (bucket.results && bucket.results.length > 0) {
            // Percorrer os resultados e somar os tokens
            bucket.results.forEach((result: any) => {
              totalInput += result.input_tokens || 0;
              totalOutput += result.output_tokens || 0;
            });
          }
        });

        console.log("Total inputs tokens somados:", totalInput);
        console.log("Total outputs tokens somados:", totalOutput);

        setTokenData({
          inputTokens: totalInput,
          outputTokens: totalOutput,
          totalTokens: totalInput + totalOutput,
        });

        setTokenData({
          inputTokens: totalInput,
          outputTokens: totalOutput,
          totalTokens: totalInput + totalOutput,
        });
      } else {
        console.log("Nenhum dado encontrado para este mês");
        // No data for selected month
        setTokenData({
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch OpenAI usage:", err);
      setError(err.message);
      // Keep previous data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered with selectedMonth:", selectedMonth);
    fetchOpenAIUsage(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (value: string) => {
    console.log("Month changed to:", value);
    setSelectedMonth(value);
    setError(null);
  };

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-4 w-full">
      {/* Status indicator */}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 w-full">
        <StatCard title="Mensagens Recebidas" value="78" icon={MessageSquare} />
        <StatCard
          title="Input Tokens"
          value={loading ? "..." : formatNumber(tokenData.inputTokens)}
          icon={ArrowUp}
        />
        <StatCard
          title="Output Tokens"
          value={loading ? "..." : formatNumber(tokenData.outputTokens)}
          icon={ArrowDown}
        />
        <StatCard
          title="Total Tokens"
          value={loading ? "..." : formatNumber(tokenData.totalTokens)}
          icon={MessageSquare}
        />
      </div>
    </div>
  );
}
