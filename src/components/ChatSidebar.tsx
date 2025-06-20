import { MessageSquare, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = [
  { icon: MessageSquare, label: "Conversas", active: true },
  { icon: Users, label: "Contatos", active: false },
  { icon: Settings, label: "Configurações", active: false },
];

interface ChatSidebarProps {
  className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col items-center bg-[#1A1C1E] border-r border-[#232325] py-4 w-16 h-full min-h-screen gap-4 shadow-sm",
        className
      )}
    >
      <div className="mb-6">
        <img
          src="/lovable-uploads/bd3461b4-3611-4b1a-9ecd-2ce764142cf1.png"
          alt="Logo"
          className="w-10 h-10 rounded-lg"
        />
      </div>
      <nav className="flex flex-col gap-7 flex-1">
        {icons.map((item, idx) => (
          <button
            key={item.label}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-lg group transition",
              item.active
                ? "bg-[#232325] text-blue-400"
                : "text-gray-400 hover:bg-[#232328] hover:text-white"
            )}
            aria-label={item.label}
          >
            <item.icon size={22} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
