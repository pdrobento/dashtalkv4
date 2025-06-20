import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  Plus,
  RefreshCw,
  Users,
  AlertCircle,
  GripVertical,
  Phone,
  Mail,
  Target,
  Calendar,
  Menu,
  X,
  MoreVertical,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { ModalCreateStage } from "../components/ModalCreateStage";
import { useKanban } from "../hooks/useKanban";
import { useIsMobile } from "../hooks/use-mobile";
import { toast } from "../hooks/use-toast";
import "./Kanban.css";

export default function KanbanPage() {
  const { board, isLoading, error, createStage, moveCard, refreshData } =
    useKanban();
  const [showCreateStageModal, setShowCreateStageModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Handle viewport resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Responsive card width calculation
  const getCardWidth = () => {
    if (viewportWidth <= 320) return "260px"; // Ultra-small mobile
    if (viewportWidth <= 480) return "280px"; // Small mobile
    if (viewportWidth <= 768) return "290px"; // Large mobile
    return "320px"; // Desktop and tablet
  };
  // Get responsive grid columns for stats
  const getStatsGridCols = () => {
    if (viewportWidth <= 480) return "grid-cols-1";
    if (viewportWidth <= 768) return "grid-cols-2";
    return "grid-cols-3";
  };

  // Função para lidar com drag and drop
  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não há destino, não faz nada
    if (!destination) return;

    // Se o item foi solto no mesmo lugar, não faz nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await moveCard(draggableId, source.droppableId, destination.droppableId);
      toast({
        title: "Contato movido",
        description: "O contato foi movido para a nova etapa com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao mover card:", error);
      toast({
        title: "Erro ao mover contato",
        description: "Não foi possível mover o contato. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para atualizar dados
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      toast({
        title: "Dados atualizados",
        description: "Os dados do Kanban foram sincronizados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para criar nova etapa
  const handleCreateStage = async (stageData: any) => {
    try {
      await createStage(stageData);
      toast({
        title: "Etapa criada",
        description: `A etapa "${stageData.title}" foi criada com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao criar etapa:", error);
      toast({
        title: "Erro ao criar etapa",
        description: "Não foi possível criar a etapa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Calcular estatísticas
  const totalContacts = board.lanes.reduce(
    (total, lane) => total + lane.cards.length,
    0
  );
  const totalStages = board.lanes.filter(
    (lane) => lane.id !== "unassigned"
  ).length;
  const unassignedCount =
    board.lanes.find((lane) => lane.id === "unassigned")?.cards.length || 0;
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--zatten-bg-primary)] p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--zatten-accent)] sm:h-16 sm:w-16"></div>
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full border-2 border-[var(--zatten-accent)]/20 sm:h-16 sm:w-16"></div>
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium text-[var(--zatten-text-primary)] sm:text-lg">
              Carregando Kanban...
            </p>
            <p className="text-xs text-[var(--zatten-text-muted)] sm:text-sm">
              Sincronizando com Chatwoot e Supabase
            </p>
          </div>
          {/* Loading skeleton for mobile */}
          {isMobile && (
            <div className="mt-4 w-full max-w-sm space-y-2">
              <Skeleton className="h-3 w-3/4 bg-[var(--zatten-bg-tertiary)]" />
              <Skeleton className="h-3 w-1/2 bg-[var(--zatten-bg-tertiary)]" />
              <Skeleton className="h-3 w-2/3 bg-[var(--zatten-bg-tertiary)]" />
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col bg-[var(--zatten-bg-primary)] min-h-screen">
      {/* Header - Mobile optimized */}
      <div className="flex-shrink-0 border-b border-[var(--zatten-border-primary)] bg-[var(--zatten-bg-secondary)]">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-[var(--zatten-text-primary)] truncate sm:text-xl lg:text-2xl">
                Kanban de Contatos
              </h1>
              <p className="text-xs text-[var(--zatten-text-muted)] mt-1 sm:text-sm lg:text-base">
                Gerencie seus contatos por etapas de negócio
              </p>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 lg:space-x-3">
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-[var(--zatten-border-secondary)] bg-[var(--zatten-bg-tertiary)] text-[var(--zatten-text-secondary)] hover:bg-[var(--zatten-bg-hover)] text-xs sm:text-sm"
              >
                <RefreshCw
                  className={`mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                {isMobile ? "Atualizar" : "Atualizar"}
              </Button>

              <Button
                onClick={() => setShowCreateStageModal(true)}
                size={isMobile ? "sm" : "default"}
                className="bg-[var(--zatten-accent)] hover:bg-[var(--zatten-accent-hover)] text-xs sm:text-sm"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                {isMobile ? "Nova Etapa" : "Nova Etapa"}
              </Button>
            </div>
          </div>

          {/* Statistics - Fully responsive grid */}
          <div
            className={`mt-3 sm:mt-4 grid gap-2 sm:gap-3 lg:gap-4 ${getStatsGridCols()}`}
          >
            <Card className="zatten-card border-[var(--zatten-border-primary)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="text-xs font-medium text-[var(--zatten-text-primary)] sm:text-sm">
                  Total de Contatos
                </CardTitle>
                <Users className="h-3.5 w-3.5 text-[var(--zatten-text-muted)] sm:h-4 sm:w-4" />
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <div className="text-xl font-bold text-[var(--zatten-text-primary)] sm:text-2xl">
                  {totalContacts}
                </div>
                <p className="text-xs text-[var(--zatten-text-muted)] mt-0.5">
                  Sincronizados do Chatwoot
                </p>
              </CardContent>
            </Card>

            <Card className="zatten-card border-[var(--zatten-border-primary)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="text-xs font-medium text-[var(--zatten-text-primary)] sm:text-sm">
                  Etapas Ativas
                </CardTitle>
                <div className="h-3.5 w-3.5 rounded-full bg-[var(--zatten-accent)] sm:h-4 sm:w-4" />
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <div className="text-xl font-bold text-[var(--zatten-text-primary)] sm:text-2xl">
                  {totalStages}
                </div>
                <p className="text-xs text-[var(--zatten-text-muted)] mt-0.5">
                  Configuradas no sistema
                </p>
              </CardContent>
            </Card>

            <Card className="zatten-card border-[var(--zatten-border-primary)] col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="text-xs font-medium text-[var(--zatten-text-primary)] sm:text-sm">
                  Não Atribuídos
                </CardTitle>
                <AlertCircle className="h-3.5 w-3.5 text-[var(--zatten-warning)] sm:h-4 sm:w-4" />
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <div className="text-xl font-bold text-[var(--zatten-text-primary)] sm:text-2xl">
                  {unassignedCount}
                </div>
                <p className="text-xs text-[var(--zatten-text-muted)] mt-0.5">
                  Aguardando atribuição
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>{" "}
      {/* Error Alert - Mobile optimized */}
      {error && (
        <div className="p-3 sm:p-4">
          <Alert
            variant="destructive"
            className="border-[var(--zatten-error)] bg-[var(--zatten-error)]/10"
          >
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <AlertDescription className="text-[var(--zatten-error)] text-sm sm:text-base">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}      {/* Kanban Board - Fully responsive layout with horizontal scrolling on mobile */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full p-2 sm:p-3 lg:p-6">
          <DragDropContext onDragEnd={handleOnDragEnd}>
            {/* Mobile-first horizontal scrolling layout */}
            <div
              className="flex h-full space-x-2 overflow-x-auto pb-2 sm:space-x-3 sm:pb-3 lg:space-x-4 lg:pb-4"
              style={{
                // Ensure smooth scrolling on mobile
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "thin",
                scrollbarColor: "var(--zatten-border-secondary) transparent",
                minHeight: "calc(100vh - 240px)",
                maxHeight: "calc(100vh - 240px)",
              }}
            >              {board.lanes.map((lane, laneIndex) => (
                <div
                  key={lane.id}
                  className="kanban-column flex-shrink-0 zatten-card border-[var(--zatten-border-primary)] bg-[var(--zatten-bg-secondary)]"
                  style={{
                    width: getCardWidth(),
                    minWidth: getCardWidth(),
                    maxWidth: getCardWidth(),
                  }}
                >                  {/* Lane Header - Compact for mobile */}
                  <div
                    className="kanban-column-header flex-shrink-0 rounded-t-lg border-b border-[var(--zatten-border-secondary)] p-2.5 sm:p-3 lg:p-4"
                    style={{
                      backgroundColor:
                        lane.style?.backgroundColor ||
                        "var(--zatten-bg-tertiary)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[var(--zatten-text-primary)] truncate text-sm sm:text-base">
                        {lane.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-[var(--zatten-bg-primary)] text-[var(--zatten-text-secondary)] text-xs px-2 py-0.5"
                      >
                        {lane.cards.length}
                      </Badge>
                    </div>
                    {lane.id === "unassigned" && (
                      <p className="mt-1 text-xs text-[var(--zatten-text-muted)]">
                        Novos contatos
                      </p>
                    )}
                  </div>                  {/* Cards Container - Scrollable on mobile */}
                  <Droppable droppableId={lane.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`
                          kanban-cards-container transition-colors
                          ${
                            snapshot.isDraggingOver
                              ? "kanban-column-drag-over"
                              : ""
                          }
                        `}
                      >                        {lane.cards.map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  kanban-card rounded-lg border border-[var(--zatten-border-secondary)] 
                                  bg-[var(--zatten-bg-primary)] p-2.5 shadow-sm transition-all 
                                  hover:shadow-md active:scale-[0.98] sm:p-3
                                  ${
                                    snapshot.isDragging
                                      ? "kanban-card-dragging ring-2 ring-[var(--zatten-accent)] ring-opacity-50"
                                      : ""
                                  }
                                `}
                              >
                                {/* Card Header - Compact */}
                                <div className="kanban-card-content mb-2 flex items-start justify-between">
                                  <h4 className="kanban-card-title font-medium text-[var(--zatten-text-primary)] flex-1 mr-2 text-sm leading-tight">
                                    {card.title}
                                  </h4>
                                  <div className="flex items-center space-x-1">
                                    {isMobile && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-[var(--zatten-bg-hover)]"
                                      >
                                        <MoreVertical className="h-3 w-3 text-[var(--zatten-text-muted)]" />
                                      </Button>
                                    )}
                                    <GripVertical className="h-3.5 w-3.5 text-[var(--zatten-text-muted)] flex-shrink-0 sm:h-4 sm:w-4" />
                                  </div>
                                </div>
                                {/* Contact Information - Compact layout */}
                                <div className="space-y-1">
                                  {card.metadata?.phone && (
                                    <div className="flex items-center space-x-1.5">
                                      <Phone className="h-3 w-3 text-[var(--zatten-text-muted)] flex-shrink-0" />
                                      <p className="text-xs text-[var(--zatten-text-secondary)] truncate">
                                        {card.metadata.phone}
                                      </p>
                                    </div>
                                  )}
                                  {card.metadata?.email && (
                                    <div className="flex items-center space-x-1.5">
                                      <Mail className="h-3 w-3 text-[var(--zatten-text-muted)] flex-shrink-0" />
                                      <p className="text-xs text-[var(--zatten-text-secondary)] truncate">
                                        {card.metadata.email}
                                      </p>
                                    </div>
                                  )}
                                  {card.description && (
                                    <p className="kanban-card-description text-xs text-[var(--zatten-text-muted)] line-clamp-2 leading-relaxed">
                                      {card.description}
                                    </p>
                                  )}
                                </div>
                                {/* Metadata/Tags - Mobile optimized */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {card.label && card.label !== "" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-[var(--zatten-border-secondary)] text-[var(--zatten-text-muted)] px-1.5 py-0.5"
                                    >
                                      {card.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}                        {/* Empty state - Mobile optimized */}
                        {lane.cards.length === 0 && (
                          <div className="flex h-32 sm:h-40 items-center justify-center rounded-lg border-2 border-dashed border-[var(--zatten-border-secondary)]">
                            <div className="text-center">
                              <Target className="h-6 w-6 mx-auto mb-2 text-[var(--zatten-text-muted)]" />
                              <p className="text-xs text-[var(--zatten-text-muted)] sm:text-sm">
                                {isMobile
                                  ? "Solte aqui"
                                  : "Solte contatos aqui"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>
      {/* Modal para criar etapa */}
      <ModalCreateStage
        isOpen={showCreateStageModal}
        onClose={() => setShowCreateStageModal(false)}
        onCreateStage={handleCreateStage}
      />
    </div>
  );
}
