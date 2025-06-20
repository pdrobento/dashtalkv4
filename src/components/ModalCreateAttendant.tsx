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

interface AttendantData {
  name: string;
  n8nId: string;
}

interface ModalCreateAttendantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AttendantData) => void;
  isLoading?: boolean;
}

export default function ModalCreateAttendant({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ModalCreateAttendantProps) {
  const [name, setName] = useState("");
  const [n8nId, setN8nId] = useState("");

  const handleCreate = () => {
    if (name.trim() && n8nId.trim()) {
      onSubmit({ name: name.trim(), n8nId: n8nId.trim() });
    }
  };

  // Reset form when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      setName("");
      setN8nId("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#19191C] border-none text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg mb-4">
            Criar novo atendente
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label htmlFor="attendant-name" className="text-sm mb-1">
            Nome do atendente
          </label>
          <Input
            id="attendant-name"
            className="bg-transparent border-[#38395a] focus:border-[#7165ff] placeholder:text-gray-400"
            placeholder="Digite o nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="attendant-n8n-id" className="text-sm mt-3 mb-1">
            ID do n8n
          </label>
          <Input
            id="attendant-n8n-id"
            className="bg-transparent border-[#38395a] focus:border-[#7165ff] placeholder:text-gray-400"
            placeholder="Digite o ID do n8n"
            value={n8nId}
            onChange={(e) => setN8nId(e.target.value)}
          />
          <Button
            className="mt-6 bg-[#7165ff] hover:bg-[#8879fa] w-full font-semibold py-2"
            onClick={handleCreate}
            disabled={!name.trim() || !n8nId.trim() || isLoading}
          >
            {isLoading ? "Criando..." : "Prosseguir"}
          </Button>
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
