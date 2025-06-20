
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CircleDot, Cpu, Home, Layers, User, Zap } from "lucide-react";

// Lista de ícones possíveis (lucide-react aprovados)
const ICONS = [
  { Icon: CircleDot, label: "circle-dot" },
  { Icon: Layers, label: "layers" },
  { Icon: Cpu, label: "cpu" },
  { Icon: User, label: "user" },         // substitui Cube por User
  { Icon: Home, label: "home" },
  { Icon: Zap, label: "zap" },
];

export default function ModalCreateTeam({ open, onOpenChange, onSubmit }: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onSubmit: (team: { name: string, icon: string }) => void;
}) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("circle-dot");

  const handleCreate = () => {
    if (name && selectedIcon) {
      onSubmit({ name, icon: selectedIcon });
      setName("");
      setSelectedIcon("circle-dot");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#19191C] border-none text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg mb-4">Criar novo time</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="text-sm mb-1">Nome</label>
          <Input
            className="bg-transparent border-[#38395a] focus:border-[#7165ff] placeholder:text-gray-400"
            placeholder="Time 1"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <label className="text-sm mt-3 mb-1">ícone do time</label>
          <div className="flex gap-3">
            {ICONS.map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "rounded-lg border-2 p-2 bg-[#151114] hover:border-[#7165ff] transition-all",
                  selectedIcon === label
                    ? "border-[#7165ff] bg-[#241e33]"
                    : "border-transparent"
                )}
                onClick={() => setSelectedIcon(label)}
              >
                <Icon size={28} color="#8C5EFF" strokeWidth={2.6} />
              </button>
            ))}
          </div>
          <Button
            className="mt-6 bg-[#7165ff] hover:bg-[#8879fa] w-full font-semibold py-2"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            Criar novo time
          </Button>
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
