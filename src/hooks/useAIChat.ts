import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface AIChat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface AIMessage {
  id: string;
  chat_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

export interface CreateChatData {
  title: string;
}

export interface CreateMessageData {
  chat_id: string;
  content: string;
  role: "user" | "assistant";
}

export const useAIChats = () => {
  const [chats, setChats] = useState<AIChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar chats do usuário
  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("ai_chats")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      setChats(data || []);
    } catch (err) {
      console.error("Erro ao carregar chats:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Criar novo chat
  const createChat = async (
    chatData: CreateChatData
  ): Promise<AIChat | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("ai_chats")
        .insert({
          user_id: userData.user.id,
          title: chatData.title,
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setChats((prev) => [data, ...prev]);

      return data;
    } catch (err) {
      console.error("Erro ao criar chat:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar chat");
      return null;
    }
  };

  // Deletar chat
  const deleteChat = async (chatId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("ai_chats")
        .delete()
        .eq("id", chatId);

      if (error) throw error;

      // Remover da lista local
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      return true;
    } catch (err) {
      console.error("Erro ao deletar chat:", err);
      setError(err instanceof Error ? err.message : "Erro ao deletar chat");
      return false;
    }
  };

  // Atualizar título do chat
  const updateChatTitle = async (
    chatId: string,
    title: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("ai_chats")
        .update({ title })
        .eq("id", chatId);

      if (error) throw error;

      // Atualizar lista local
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
      );

      return true;
    } catch (err) {
      console.error("Erro ao atualizar título:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar título");
      return false;
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return {
    chats,
    loading,
    error,
    loadChats,
    createChat,
    deleteChat,
    updateChatTitle,
  };
};

export const useAIMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar mensagens de um chat
  const loadMessages = async (selectedChatId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("chat_id", selectedChatId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar mensagens"
      );
    } finally {
      setLoading(false);
    }
  };
  // Adicionar nova mensagem
  const addMessage = async (
    messageData: CreateMessageData
  ): Promise<AIMessage | null> => {
    try {
      // Verificar se o usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      console.log("Tentando adicionar mensagem:", messageData);

      const { data, error } = await supabase
        .from("ai_messages")
        .insert({
          chat_id: messageData.chat_id,
          content: messageData.content,
          role: messageData.role,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        throw error;
      }

      console.log("Mensagem adicionada com sucesso:", data);

      // Adicionar à lista local se for do chat atual
      if (messageData.chat_id === chatId) {
        setMessages((prev) => [...prev, data]);
      }

      return data;
    } catch (err) {
      console.error("Erro ao adicionar mensagem:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao adicionar mensagem"
      );
      return null;
    }
  };

  // Limpar mensagens quando chatId mudar
  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage,
  };
};
