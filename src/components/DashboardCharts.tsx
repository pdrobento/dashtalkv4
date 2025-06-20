import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const messagesData = [
  {
    date: "01/05/2025",
    enviadas: 5,
    recebidas: 7,
    entregues: 4,
    lidas: 4,
    erros: 0,
  },
  {
    date: "04/05/2025",
    enviadas: 8,
    recebidas: 12,
    entregues: 8,
    lidas: 7,
    erros: 0,
  },
  {
    date: "07/05/2025",
    enviadas: 30,
    recebidas: 28,
    entregues: 25,
    lidas: 20,
    erros: 2,
  },
  {
    date: "10/05/2025",
    enviadas: 0,
    recebidas: 0,
    entregues: 0,
    lidas: 0,
    erros: 0,
  },
  {
    date: "13/05/2025",
    enviadas: 7,
    recebidas: 7,
    entregues: 6,
    lidas: 5,
    erros: 0,
  },
  {
    date: "16/05/2025",
    enviadas: 0,
    recebidas: 0,
    entregues: 0,
    lidas: 0,
    erros: 0,
  },
  {
    date: "19/05/2025",
    enviadas: 5,
    recebidas: 6,
    entregues: 5,
    lidas: 5,
    erros: 0,
  },
  {
    date: "22/05/2025",
    enviadas: 0,
    recebidas: 0,
    entregues: 0,
    lidas: 0,
    erros: 0,
  },
  {
    date: "25/05/2025",
    enviadas: 45,
    recebidas: 52,
    entregues: 44,
    lidas: 43,
    erros: 1,
  },
  {
    date: "28/05/2025",
    enviadas: 0,
    recebidas: 0,
    entregues: 0,
    lidas: 0,
    erros: 0,
  },
  {
    date: "31/05/2025",
    enviadas: 0,
    recebidas: 0,
    entregues: 0,
    lidas: 0,
    erros: 0,
  },
];

// Fallback data for tokens if API fails
const tokensData = [
  { date: "01/05/2025", input: 0, output: 0 },
  { date: "04/05/2025", input: 50000, output: 10000 },
  { date: "07/05/2025", input: 40000, output: 5000 },
  { date: "10/05/2025", input: 0, output: 0 },
  { date: "13/05/2025", input: 0, output: 0 },
  { date: "16/05/2025", input: 0, output: 0 },
  { date: "19/05/2025", input: 0, output: 0 },
  { date: "22/05/2025", input: 0, output: 0 },
  { date: "25/05/2025", input: 180000, output: 25000 },
  { date: "28/05/2025", input: 0, output: 0 },
  { date: "31/05/2025", input: 0, output: 0 },
];

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

interface DashboardChartsProps {
  selectedMonth?: string;
}

export default function DashboardCharts({
  selectedMonth: propMonth,
}: DashboardChartsProps) {
  const [tokenUsageData, setTokenUsageData] = useState(tokensData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Process data for chart visualization
      if (data && data.data && data.data.length > 0) {
        // Transformar os dados da API para o formato do gráfico
        const processedData = [];

        // Percorrer todos os objetos do array data
        data.data.forEach((bucket: any, bucketIndex: number) => {
          // Verificar se há resultados para este "bucket"
          if (bucket.results && bucket.results.length > 0) {
            // Percorrer os resultados e criar entradas para o gráfico
            bucket.results.forEach((result: any, resultIndex: number) => {
              // Calcular uma data para visualização
              const timestamp =
                startTime + bucketIndex * 24 * 60 * 60 + resultIndex * 3600; // Ajuste de espaçamento
              const date = new Date(timestamp * 1000).toLocaleDateString(
                "pt-BR"
              );

              processedData.push({
                date,
                input: result.input_tokens || 0,
                output: result.output_tokens || 0,
              });
            });
          }
        });

        console.log("Processed chart data:", processedData);

        if (processedData.length > 0) {
          setTokenUsageData(processedData);
        } else {
          // Sem dados para o mês selecionado
          setTokenUsageData([]);
        }
      } else {
        console.log("Nenhum dado encontrado para este mês");
        // No data for selected month
        setTokenUsageData([]);
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

  return (
    <div className="space-y-6 w-full">
      <Card className="bg-[#1a1c1e] border-[#323232] w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">
            Visão Geral das Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <AreaChart
                data={messagesData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  fontSize={10}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#666" fontSize={10} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value}`, ""]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                  iconSize={12}
                />
                <Area
                  type="monotone"
                  dataKey="enviadas"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Enviadas"
                />
                <Area
                  type="monotone"
                  dataKey="recebidas"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Recebidas"
                />
                <Area
                  type="monotone"
                  dataKey="entregues"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                  name="Entregues"
                />
                <Area
                  type="monotone"
                  dataKey="lidas"
                  stackId="1"
                  stroke="#0088FE"
                  fill="#0088FE"
                  name="Lidas"
                />
                <Area
                  type="monotone"
                  dataKey="erros"
                  stackId="1"
                  stroke="#FF8042"
                  fill="#FF8042"
                  name="Erros"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>{" "}
      <Card className="bg-[#1a1c1e] border-[#323232] w-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg md:text-xl">
              Tokens Usados
              {loading && (
                <span className="ml-2 text-xs opacity-70">(Carregando...)</span>
              )}
              {error && (
                <span className="ml-2 text-xs text-red-500">
                  (Erro: {error})
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <BarChart
                data={tokenUsageData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  fontSize={10}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#666" fontSize={10} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value}`, ""]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                  iconSize={12}
                />
                <Bar dataKey="input" name="Input" fill="#8884d8" />
                <Bar dataKey="output" name="Output" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
