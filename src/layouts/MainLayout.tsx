import React from "react";
import { Outlet } from "react-router-dom";
import ZattenSidebar from "@/components/ZattenSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#101112] flex-col md:flex-row full-screen">
        <ZattenSidebar />
        <main className="flex-1 overflow-auto p-0 m-0 w-full">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
