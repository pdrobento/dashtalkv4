import { supabase } from "../lib/supabaseClient";
import {
  Stage,
  ContactStage,
  CreateStageData,
  ChatwootContactsResponse,
} from "../types/kanban";

// Serviços do Supabase para Stages
export const stageService = {
  // Buscar todas as etapas ordenadas
  async getStages(): Promise<Stage[]> {
    const { data, error } = await supabase
      .from("stages")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Erro ao buscar stages:", error);
      throw error;
    }

    return data || [];
  },

  // Criar nova etapa
  async createStage(stageData: CreateStageData): Promise<Stage> {
    // Buscar o próximo order_index
    const { data: maxOrderData } = await supabase
      .from("stages")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrder =
      maxOrderData && maxOrderData.length > 0
        ? maxOrderData[0].order_index + 1
        : 0;

    const { data, error } = await supabase
      .from("stages")
      .insert({
        title: stageData.title,
        color: stageData.color || "#3B82F6",
        order_index: stageData.order_index ?? nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar stage:", error);
      throw error;
    }

    return data;
  },

  // Atualizar etapa
  async updateStage(id: string, updates: Partial<Stage>): Promise<Stage> {
    const { data, error } = await supabase
      .from("stages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar stage:", error);
      throw error;
    }

    return data;
  },

  // Deletar etapa
  async deleteStage(id: string): Promise<void> {
    const { error } = await supabase.from("stages").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar stage:", error);
      throw error;
    }
  },
};

// Serviços do Supabase para Contact Stages
export const contactStageService = {
  // Buscar todas as associações contato-etapa
  async getContactStages(): Promise<ContactStage[]> {
    const { data, error } = await supabase.from("contact_stages").select("*");

    if (error) {
      console.error("Erro ao buscar contact_stages:", error);
      throw error;
    }

    return data || [];
  },

  // Mover contato para uma etapa
  async moveContactToStage(
    contactId: string,
    stageId: string
  ): Promise<ContactStage> {
    // Usar upsert para atualizar ou inserir
    const { data, error } = await supabase
      .from("contact_stages")
      .upsert(
        {
          contact_id: contactId,
          stage_id: stageId,
        },
        {
          onConflict: "contact_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Erro ao mover contato:", error);
      throw error;
    }

    return data;
  },

  // Remover contato de todas as etapas
  async removeContactFromStages(contactId: string): Promise<void> {
    const { error } = await supabase
      .from("contact_stages")
      .delete()
      .eq("contact_id", contactId);

    if (error) {
      console.error("Erro ao remover contato das etapas:", error);
      throw error;
    }
  },
};

// Serviços do Chatwoot
export const chatwootService = {
  // Buscar contatos com paginação
  async getContacts(page: number = 1): Promise<ChatwootContactsResponse> {
    const apiKey = import.meta.env.VITE_CHATWOOT_API_KEY;
    const accountId = import.meta.env.VITE_CHATWOOT_ACCOUNT_ID || "1";

    if (!apiKey) {
      throw new Error("VITE_CHATWOOT_API_KEY não configurada");
    }

    try {
      const response = await fetch(
        `/api/chatwoot/api/v1/accounts/${accountId}/contacts?page=${page}`,
        {
          method: "GET",
          headers: {
            api_access_token: apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API do Chatwoot: ${response.status}`);
      }
      const data = await response.json();

      // Verificar se a resposta tem o formato esperado
      if (!data || !data.payload) {
        console.warn(
          "Resposta da API do Chatwoot em formato inesperado:",
          data
        );
        // Retornar uma estrutura vazia mas que corresponda ao tipo esperado
        return {
          data: {
            payload: [],
            meta: {
              count: 0,
              current_page: 1,
              total_pages: 1,
            },
          },
        };
      }

      // Transformar a resposta para o formato esperado
      return {
        data: {
          payload: data.payload,
          meta: data.meta,
        },
      };
    } catch (error) {
      console.error("Erro ao buscar contatos do Chatwoot:", error);
      // Retornar um objeto vazio mas compatível com o tipo
      return {
        data: {
          payload: [],
          meta: {
            count: 0,
            current_page: 1,
            total_pages: 1,
          },
        },
      };
    }
  },
  // Buscar todos os contatos (com paginação automática)
  async getAllContacts(): Promise<ChatwootContactsResponse["data"]["payload"]> {
    const allContacts = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      try {
        const response = await this.getContacts(currentPage); // Verificar se a resposta contém os dados esperados
        if (response && response.data && response.data.payload) {
          allContacts.push(...response.data.payload);
          totalPages = response.data.meta.total_pages || 1;
        } else {
          console.error(
            "Resposta da API está em formato inesperado:",
            response
          );
          break; // Sai do loop se a resposta não está no formato esperado
        }

        currentPage++;
      } catch (error) {
        console.error("Erro ao buscar página de contatos:", error);
        break; // Sai do loop em caso de erro
      }
    } while (currentPage <= totalPages);

    return allContacts;
  },
};
