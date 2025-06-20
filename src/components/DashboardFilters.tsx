import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface DashboardFiltersProps {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}

export default function DashboardFilters({
  selectedMonth,
  onMonthChange,
}: DashboardFiltersProps) {
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  // Função para obter o mês atual
  const getCurrentMonth = () => {
    // Forçando a obter a data atual sem cache
    const currentDate = new Date();
    console.log("Data atual:", currentDate);
    const monthIndex = currentDate.getMonth(); // 0-11
    console.log("Índice do mês:", monthIndex);
    console.log("Mês retornado:", months[monthIndex]);
    return months[monthIndex];
  };

  // Define o mês atual quando o componente carrega
  useEffect(() => {
    // Força a atualização do mês atual sempre que o componente for montado
    const currentMonth = getCurrentMonth();
    onMonthChange(currentMonth);
  }, []); // Removendo dependências para executar apenas na montagem

  return (
    <div className="flex flex-wrap gap-4 mb-6 w-full">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 block text-gray-400">
          Mês
        </label>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="bg-[#222222] border-[#323232] focus:ring-purple-500 w-full">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent className="bg-[#222222] border-[#323232]">
            {months.map((month) => (
              <SelectItem
                key={month}
                value={month}
                className="hover:bg-[#2a2a2a]"
              >
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
