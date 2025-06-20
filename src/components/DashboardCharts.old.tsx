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

export default function DashboardCharts() {
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
      </Card>

      <Card className="bg-[#1a1c1e] border-[#323232] w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Tokens Usados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <BarChart
                data={tokensData}
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
