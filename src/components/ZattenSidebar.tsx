import {
  Settings,
  Users,
  List,
  MessageSquare,
  Folder,
  FolderOpen,
  Grid2x2,
  CircleDot,
  ArrowDown,
  LogOut,
  Bot,
  Wrench,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// Use Grid2x2 as dashboard icon substitute
const crmItems = [
  { title: "Chat", icon: MessageSquare, url: "/chat" },
  { title: "Contatos", icon: Users, url: "/contatos" },
  { title: "Kanban", icon: List, url: "/kanban" },
];

const menuItems = [
  { title: "Dashboard", icon: Grid2x2, url: "/" },
  { title: "Atendentes", icon: Users, url: "/atendentes" },
  {
    title: "CRM",
    icon: FolderOpen,
    subItems: crmItems,
  },
  { title: "Gestão com IA", icon: Bot, url: "/chat-gestao" },
  { title: "Meus Dados", icon: Settings, url: "/meus-dados" },
];

export function ZattenSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a route is active
  const isActiveRoute = (url: string): boolean => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  // Function to check if any subitem is active
  const hasActiveSubItem = (subItems: typeof crmItems): boolean => {
    return subItems.some((item) => isActiveRoute(item.url));
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      // Use o client Supabase diretamente em vez do método do contexto
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
        console.error("Logout error:", error);
      } else {
        toast({
          title: "Logout realizado",
          description: "Você saiu do sistema.",
        });
        // Add a small delay to ensure the logout process completes
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error("Unexpected logout error:", err);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar className="zatten-sidebar min-h-screen w-[230px] md:w-[270px] px-2 md:px-4 py-4 md:py-6 flex flex-col border-r border-[#323232] overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 md:mb-10 px-1">
        {/* <div className="bg-white rounded-lg p-2">
          <img
            src="/lovable-uploads/bd3461b4-3611-4b1a-9ecd-2ce764142cf1.png"
            alt="${import.meta.env.VITE_PLATAFORM_NAME} logo"
            className="w-8 h-8"
          />
        </div> */}
        <span className="text-xl md:text-2xl font-bold select-none text-zatten-text-primary">
          {import.meta.env.VITE_PLATAFORM_NAME}
        </span>
      </div>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="pl-2 text-xs text-zatten-text-muted mb-1">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, i) =>
                item.subItems ? (
                  <SidebarMenuItem key={item.title}>
                    {/* CRM with Submenu */}
                    <details
                      className="group [&[open]>summary>svg]:rotate-180 transition-all"
                      open={hasActiveSubItem(item.subItems)}
                    >
                      <summary
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition group-open:bg-zatten-bg-hover",
                          hasActiveSubItem(item.subItems)
                            ? "bg-zatten-accent text-zatten-text-primary"
                            : "hover:bg-zatten-bg-hover text-zatten-text-secondary"
                        )}
                      >
                        <item.icon size={18} />
                        <span className="flex-1">{item.title}</span>
                        <ArrowDown size={18} className="transition-transform" />
                      </summary>
                      <div className="flex flex-col ml-8 mt-1">
                        {item.subItems.map((sub) => (
                          <a
                            key={sub.title}
                            href={sub.url}
                            className={cn(
                              "flex items-center gap-2 py-1 text-sm transition",
                              isActiveRoute(sub.url)
                                ? "text-zatten-accent font-medium"
                                : "text-zatten-text-muted hover:text-zatten-text-primary hover:underline"
                            )}
                          >
                            <sub.icon size={16} /> <span>{sub.title}</span>
                          </a>
                        ))}
                      </div>
                    </details>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-lg group transition",
                          isActiveRoute(item.url!)
                            ? "bg-zatten-accent text-zatten-text-primary"
                            : "hover:bg-zatten-bg-hover text-zatten-text-secondary"
                        )}
                      >
                        <item.icon size={18} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        {/* User Account */}
        {user && (
          <div className="flex items-center gap-3 py-2 px-1">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-zatten-border-secondary flex-shrink-0 overflow-hidden">
              <img
                src={
                  user.user_metadata?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                    user.email || "user"
                  }`
                }
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs md:text-sm truncate text-zatten-text-primary">
                {user.user_metadata?.full_name || user.email}
              </div>
              <div className="text-xs text-zatten-text-muted truncate">
                {user.email}
              </div>
            </div>
          </div>
        )}
        {/* Logout */}
        <Button
          variant="outline"
          className="w-full gap-2 zatten-button-secondary text-red-400 hover:text-white mb-3"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default ZattenSidebar;
