import { useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ModalCreateAttendant from "@/components/ModalCreateAttendant";
import ModalEditAttendant from "@/components/ModalEditAttendant";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  useAttendants,
  type Attendant,
  type CreateAttendantData,
} from "@/hooks/useAttendants";
import { toast } from "@/hooks/use-toast";

export default function AttendantsPage() {
  const {
    attendants,
    loading,
    error,
    createAttendant,
    deleteAttendant,
    updateAttendant,
    updateAttendantStatus,
  } = useAttendants();

  // Modal states
  const [openCreateAttendant, setOpenCreateAttendant] = useState(false);
  const [openEditAttendant, setOpenEditAttendant] = useState<Attendant | null>(
    null
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    attendant: Attendant | null;
  }>({ open: false, attendant: null });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler functions
  async function handleAddAttendant(newAttendant: CreateAttendantData) {
    setIsCreating(true);
    try {
      const result = await createAttendant(newAttendant);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Atendente criado com sucesso!",
        });
        setOpenCreateAttendant(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao criar atendente",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar atendente",
        variant: "destructive",
      });
      console.error("Erro inesperado:", error);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteAttendant() {
    if (!deleteConfirmation.attendant) return;

    setIsDeleting(true);
    try {
      const result = await deleteAttendant(deleteConfirmation.attendant.id);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Atendente excluído com sucesso!",
        });
        setDeleteConfirmation({ open: false, attendant: null });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao excluir atendente",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir atendente",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleStatus(attendant: Attendant) {
    try {
      const result = await updateAttendantStatus(
        attendant.id,
        !attendant.active
      );
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Atendente ${
            !attendant.active ? "ativado" : "desativado"
          } com sucesso!`,
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao atualizar status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      });
    }
  }

  function openDeleteConfirmation(attendant: Attendant) {
    setDeleteConfirmation({ open: true, attendant });
  }

  function handleUpdateAttendant(updatedAttendant: Attendant) {
    // The hook already updates the local state, so we just need to close the modal
    setOpenEditAttendant(null);
  }

  return (
    <SidebarProvider>
      <div className="w-full h-full overflow-auto">
        <main className="flex-1 w-full max-w-full">
          {/* Mobile Header */}
          <div className="w-full h-full md:hidden flex items-center gap-3 p-4 border-b border-[#2A2A2A] bg-[#18181A]">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Meus atendentes
            </h1>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="min-h-screen bg-[#18181A] text-white">
              <div className="px-2 md:px-8 py-4 md:py-8 max-w-full">
                {/* Modais */}
                <ModalCreateAttendant
                  open={openCreateAttendant}
                  onOpenChange={setOpenCreateAttendant}
                  onSubmit={handleAddAttendant}
                  isLoading={isCreating}
                />
                {openEditAttendant && (
                  <ModalEditAttendant
                    open={true}
                    onOpenChange={() => setOpenEditAttendant(null)}
                    attendant={openEditAttendant}
                    onUpdate={handleUpdateAttendant}
                  />
                )}
                <DeleteConfirmation
                  open={deleteConfirmation.open}
                  onOpenChange={(open) =>
                    setDeleteConfirmation({ open, attendant: null })
                  }
                  onConfirm={handleDeleteAttendant}
                  attendantName={deleteConfirmation.attendant?.name || ""}
                  isLoading={isDeleting}
                />

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                    {error}
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-400">
                      Carregando atendentes...
                    </div>
                  </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 md:mb-8 gap-3">
                  <span className="text-xl md:text-2xl font-bold">
                    Meus atendentes
                  </span>
                  <Button
                    variant="outline"
                    className="bg-[#635bff] text-white hover:bg-[#7165ff] px-3 py-2 rounded font-semibold text-sm"
                    onClick={() => setOpenCreateAttendant(true)}
                  >
                    <Plus size={16} className="mr-2" /> Criar atendente
                  </Button>
                </div>

                {/* Attendants Section */}
                {!loading && (
                  <section className="rounded-xl bg-[#141517] border border-[#222225] mb-4 md:mb-8">
                    {/* Attendants List */}
                    <div className="px-3 md:px-6 py-4 md:py-6 space-y-3">
                      {attendants.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          Nenhum atendente encontrado
                        </div>
                      ) : (
                        attendants.map((attendant) => (
                          <div
                            key={attendant.id}
                            className="rounded-lg bg-[#18181A] border border-[#222225] p-3 md:p-4"
                          >
                            {/* Mobile Layout - visible only on small screens */}
                            <div className="block lg:hidden">
                              {/* Row 1: Status and Actions */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={attendant.active}
                                    onCheckedChange={() =>
                                      handleToggleStatus(attendant)
                                    }
                                    className="data-[state=checked]:bg-[#635bff]"
                                  />
                                  <span
                                    className={`font-bold text-sm ${
                                      attendant.active
                                        ? "text-[#a295fb]"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {attendant.active ? "Ativo" : "Inativo"}
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  className="px-2 py-1 border-[#FF4242] text-[#FF4242] hover:bg-[#221818] text-xs"
                                  onClick={() =>
                                    openDeleteConfirmation(attendant)
                                  }
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>

                              {/* Row 2: Name */}
                              <div className="mb-2">
                                <div className="font-medium text-base text-white">
                                  {attendant.name}
                                </div>
                              </div>

                              {/* Row 3: N8N ID */}
                              <div className="mb-3">
                                <div className="text-xs text-gray-400 font-mono">
                                  N8N ID: {attendant.n8n_id}
                                </div>
                              </div>

                              {/* Row 4: Connection Status & Modified Date */}
                              <div className="flex items-center justify-between mb-3">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs 
                                    ${
                                      attendant.active
                                        ? "border border-green-500 bg-green-500/20 text-green-400"
                                        : "border border-red-500 bg-red-500/20 text-red-400"
                                    }
                                  `}
                                >
                                  {attendant.active
                                    ? "Conectado"
                                    : "Desconectado"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Modificado em{" "}
                                  <span className="font-medium text-gray-300">
                                    {new Date(
                                      attendant.updated_at
                                    ).toLocaleDateString("pt-BR")}
                                  </span>
                                </div>
                              </div>

                              {/* Row 5: Action Buttons */}
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  className="px-2 py-2 border-[#333] text-gray-200 text-xs"
                                  onClick={() =>
                                    setOpenEditAttendant(attendant)
                                  }
                                >
                                  <Edit size={14} className="mr-1" /> Editar
                                </Button>
                              </div>
                            </div>

                            {/* Desktop Layout - visible only on large screens */}
                            <div className="hidden lg:flex items-center gap-4">
                              <div className="flex items-center gap-3 min-w-[120px]">
                                <Switch
                                  checked={attendant.active}
                                  onCheckedChange={() =>
                                    handleToggleStatus(attendant)
                                  }
                                  className="data-[state=checked]:bg-[#635bff]"
                                />
                                <span
                                  className={`font-bold text-sm ${
                                    attendant.active
                                      ? "text-[#a295fb]"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {attendant.active ? "Ativo" : "Inativo"}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-base mb-1">
                                  {attendant.name}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  N8N ID: {attendant.n8n_id}
                                </div>
                              </div>

                              <div className="text-xs text-gray-400 hidden xl:block min-w-[140px]">
                                Modificado em{" "}
                                <span className="font-medium text-gray-300">
                                  {new Date(
                                    attendant.updated_at
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              </div>

                              <div
                                className={`px-3 py-1 rounded-full text-xs mr-2
                                  ${
                                    attendant.active
                                      ? "border border-green-500 bg-green-500/20 text-green-400"
                                      : "border border-red-500 bg-red-500/20 text-red-400"
                                  }
                                `}
                              >
                                {attendant.active
                                  ? "Conectado"
                                  : "Desconectado"}
                              </div>

                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  className="px-3 py-2 border-[#333] text-gray-200 text-sm"
                                  onClick={() =>
                                    setOpenEditAttendant(attendant)
                                  }
                                >
                                  <Edit size={16} className="mr-2" /> Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  className="px-3 py-2 border-[#FF4242] text-[#FF4242] hover:bg-[#221818]"
                                  onClick={() =>
                                    openDeleteConfirmation(attendant)
                                  }
                                >
                                  <Trash size={17} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
