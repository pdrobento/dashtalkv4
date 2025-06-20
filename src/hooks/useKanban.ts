import { useState, useEffect, useCallback } from "react";
import {
  Stage,
  ContactStage,
  KanbanBoard,
  KanbanLane,
  KanbanCard,
  CreateStageData,
  ChatwootContact,
} from "../types/kanban";
import {
  stageService,
  contactStageService,
  chatwootService,
} from "../services/kanbanService";

interface UseKanbanReturn {
  board: KanbanBoard;
  isLoading: boolean;
  error: string | null;
  createStage: (stageData: CreateStageData) => Promise<void>;
  moveCard: (
    cardId: string,
    sourceLaneId: string,
    targetLaneId: string
  ) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useKanban = (): UseKanbanReturn => {
  const [board, setBoard] = useState<KanbanBoard>({ lanes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para converter contatos em cards do Kanban
  const contactToCard = useCallback((contact: ChatwootContact): KanbanCard => {
    return {
      id: contact.id.toString(),
      title: contact.name || "Sem nome",
      description: contact.phone_number || contact.email || "",
      label: contact.phone_number ? "📱" : contact.email ? "📧" : "",
      draggable: true,
      metadata: {
        contactId: contact.id,
        phone: contact.phone_number,
        email: contact.email,
        thumbnail: contact.thumbnail,
      },
    };
  }, []);

  // Função para organizar contatos por etapas
  const organizeContactsByStages = useCallback(
    (
      stages: Stage[],
      contacts: ChatwootContact[],
      contactStages: ContactStage[]
    ): KanbanLane[] => {
      // Criar mapa de contato -> etapa
      const contactStageMap = new Map<string, string>();
      contactStages.forEach((cs) => {
        contactStageMap.set(cs.contact_id, cs.stage_id);
      });

      // Criar lanes para cada etapa
      const lanes: KanbanLane[] = stages.map((stage) => ({
        id: stage.id,
        title: stage.title,
        label: `${stage.title}`,
        cards: [],
        style: {
          backgroundColor: stage.color + "20", // 20% opacity
          color: stage.color,
        },
      }));

      // Lane para contatos sem etapa definida
      const unassignedLane: KanbanLane = {
        id: "unassigned",
        title: "Não Atribuídos",
        label: "Novos Contatos",
        cards: [],
        style: {
          backgroundColor: "#6B728020",
          color: "#6B7280",
        },
      };

      // Distribuir contatos pelas lanes
      contacts.forEach((contact) => {
        const card = contactToCard(contact);
        const stageId = contactStageMap.get(contact.id.toString());

        if (stageId) {
          const lane = lanes.find((l) => l.id === stageId);
          if (lane) {
            lane.cards.push(card);
          } else {
            unassignedLane.cards.push(card);
          }
        } else {
          unassignedLane.cards.push(card);
        }
      });

      // Adicionar lane de não atribuídos se houver cards
      if (unassignedLane.cards.length > 0) {
        return [unassignedLane, ...lanes];
      }

      return lanes;
    },
    [contactToCard]
  );
  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar dados em paralelo com tratamento de erro individual
      let stages: Stage[] = [];
      let contacts: ChatwootContact[] = [];
      let contactStages: ContactStage[] = [];

      try {
        stages = await stageService.getStages();
      } catch (stagesError) {
        console.error("Erro ao carregar etapas:", stagesError);
        setError(
          "Não foi possível carregar as etapas. Verifique a conexão com o banco de dados."
        );
      }

      try {
        contacts = await chatwootService.getAllContacts();
      } catch (contactsError) {
        console.error("Erro ao carregar contatos:", contactsError);
        setError(
          "Não foi possível carregar os contatos do Chatwoot. Verifique a configuração da API."
        );
      }

      try {
        contactStages = await contactStageService.getContactStages();
      } catch (contactStagesError) {
        console.error("Erro ao carregar contatos/etapas:", contactStagesError);
        setError(
          "Não foi possível carregar as atribuições de contatos. Verifique a conexão com o banco de dados."
        );
      }

      // Organizar dados no formato do board (mesmo com erros parciais)
      const lanes = organizeContactsByStages(stages, contacts, contactStages);
      setBoard({ lanes });
    } catch (err) {
      console.error("Erro ao carregar dados do Kanban:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar o Kanban"
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizeContactsByStages]);

  // Criar nova etapa
  const createStage = useCallback(
    async (stageData: CreateStageData) => {
      try {
        setError(null);
        await stageService.createStage(stageData);
        await loadData(); // Recarregar dados
      } catch (err) {
        console.error("Erro ao criar etapa:", err);
        setError(err instanceof Error ? err.message : "Erro ao criar etapa");
        throw err;
      }
    },
    [loadData]
  );

  // Mover card entre lanes
  const moveCard = useCallback(
    async (cardId: string, sourceLaneId: string, targetLaneId: string) => {
      try {
        setError(null);

        // Não fazer nada se for a mesma lane
        if (sourceLaneId === targetLaneId) return;

        // Se for para a lane "unassigned", remover das etapas
        if (targetLaneId === "unassigned") {
          await contactStageService.removeContactFromStages(cardId);
        } else {
          // Mover para nova etapa
          await contactStageService.moveContactToStage(cardId, targetLaneId);
        }

        // Atualizar estado local imediatamente para UX responsiva
        setBoard((prevBoard) => {
          const newLanes = prevBoard.lanes.map((lane) => {
            if (lane.id === sourceLaneId) {
              return {
                ...lane,
                cards: lane.cards.filter((card) => card.id !== cardId),
              };
            }
            if (lane.id === targetLaneId) {
              const movedCard = prevBoard.lanes
                .find((l) => l.id === sourceLaneId)
                ?.cards.find((c) => c.id === cardId);

              return movedCard
                ? {
                    ...lane,
                    cards: [...lane.cards, movedCard],
                  }
                : lane;
            }
            return lane;
          });

          return { lanes: newLanes };
        });
      } catch (err) {
        console.error("Erro ao mover card:", err);
        setError(err instanceof Error ? err.message : "Erro ao mover contato");
        // Recarregar dados em caso de erro
        await loadData();
        throw err;
      }
    },
    [loadData]
  );

  // Atualizar dados
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    board,
    isLoading,
    error,
    createStage,
    moveCard,
    refreshData,
  };
};
