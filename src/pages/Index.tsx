import { useState } from "react";
import { Menu } from "lucide-react";
import ZattenSidebar from "@/components/ZattenSidebar";
import DashboardFilters from "@/components/DashboardFilters";
import DashboardCards from "@/components/DashboardCards";
import DashboardCharts from "@/components/DashboardCharts";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Index() {
  const [selectedMonth, setSelectedMonth] = useState("maio");
  const [selectedAttendant, setSelectedAttendant] = useState("Emin - Marcel");

  return (
    <div className="w-full h-full overflow-auto">
      <div className="flex-1 w-full py-[32px] px-[32px] max-w-full">
        <header className="mb-6 md:mb-8 w-full">
          <div className="flex items-center gap-4 mb-4 md:mb-8">
            <SidebarTrigger className="md:hidden text-white hover:bg-[#222325] h-8 w-8">
              <Menu size={20} />
            </SidebarTrigger>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Dashboard
            </h1>
          </div>
          <DashboardFilters
            selectedMonth={selectedMonth}
            selectedAttendant={selectedAttendant}
            onMonthChange={setSelectedMonth}
            onAttendantChange={setSelectedAttendant}
          />
        </header>
        <main className="w-full">
          <DashboardCards selectedMonth={selectedMonth} />
          <DashboardCharts selectedMonth={selectedMonth} />
        </main>
      </div>
    </div>
  );
}
