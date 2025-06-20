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
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Attendant {
  id: string;
  name: string;
  n8n_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ModalEditAttendantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendant: Attendant;
  onUpdate?: (updatedAttendant: Attendant) => void;
}

export default function ModalEditAttendant({
  open,
  onOpenChange,
  attendant,
  onUpdate,
}: ModalEditAttendantProps) {
  const [name, setName] = useState(attendant.name);
  const [n8nId, setN8nId] = useState(attendant.n8n_id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !n8nId.trim()) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      // Check if n8n_id already exists (excluding current attendant)
      const { data: existingAttendant, error: checkError } = await supabase
        .from("attendants")
        .select("n8n_id")
        .eq("n8n_id", n8nId.trim())
        .neq("id", attendant.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingAttendant) {
        toast.error("Já existe um atendente com este ID do n8n");
        return;
      }

      const { data, error } = await supabase
        .from("attendants")
        .update({
          name: name.trim(),
          n8n_id: n8nId.trim(),
        })
        .eq("id", attendant.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Atendente atualizado com sucesso!");
      onUpdate?.(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar atendente:", error);
      toast.error("Erro ao atualizar atendente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      // Reset form to original values
      setName(attendant.name);
      setN8nId(attendant.n8n_id);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#19191C] border-none text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg mb-4">Editar atendente</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="edit-attendant-name" className="text-sm mb-2 block">
              Nome do atendente
            </label>
            <Input
              id="edit-attendant-name"
              className="bg-transparent border-[#38395a] focus:border-[#7165ff] placeholder:text-gray-400"
              placeholder="Digite o nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="edit-attendant-n8n-id"
              className="text-sm mb-2 block"
            >
              ID do n8n
            </label>
            <Input
              id="edit-attendant-n8n-id"
              className="bg-transparent border-[#38395a] focus:border-[#7165ff] placeholder:text-gray-400"
              placeholder="Digite o ID do n8n"
              value={n8nId}
              onChange={(e) => setN8nId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-[#333] text-gray-300 hover:bg-[#222] hover:text-white"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#7165ff] hover:bg-[#8879fa] font-semibold"
              onClick={handleSave}
              disabled={!name.trim() || !n8nId.trim() || isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
