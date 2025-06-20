import React from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatConversation } from "@/components/ChatConversation";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, Download, Archive, Menu, X } from "lucide-react";

// Interfaces para tipagem
interface ChatMessage {
  id: number;
  content: string;
  sender: "me" | "other";
  timestamp: string;
  status?: string;
  messageType?: string;
  senderInfo?: any;
}

interface Chat {
  id: number;
  name: string;
  number: string;
  initial: string;
  lastSeen: string;
  messages: ChatMessage[];
  status?: string;
  unreadCount?: number;
  avatar?: string | null;
}

// Chat e mensagens de exemplo
const chatsMock: Chat[] = [
  {
    id: 1,
    name: "Adriano Fante",
    number: "556392878781",
    initial: "AD",
    lastSeen: "23/05/2025 20:12",
    status: "open",
    unreadCount: 0,
    avatar: null,
    messages: [
      {
        id: 1,
        content: "Olá! Como posso ajudá-lo hoje?",
        sender: "other" as const,
        timestamp: "23/05/2025 20:10",
      },
      {
        id: 2,
        content: "Oi! Gostaria de saber mais sobre os serviços.",
        sender: "me" as const,
        timestamp: "23/05/2025 20:12",
      },
    ],
  },
  {
    id: 2,
    name: "Márcio",
    number: "5581975531291",
    initial: "MÁ",
    lastSeen: "26/05/2025 14:04",
    status: "open",
    unreadCount: 0,
    avatar: null,
    messages: [
      {
        id: 1,
        content: "Bom dia! Preciso de uma cotação.",
        sender: "other" as const,
        timestamp: "26/05/2025 14:00",
      },
      {
        id: 2,
        content: "Claro! Vou preparar um orçamento para você.",
        sender: "me" as const,
        timestamp: "26/05/2025 14:04",
      },
    ],
  },
  {
    id: 3,
    name: "Jordão",
    number: "5553999410889",
    initial: "JO",
    lastSeen: "20/05/2025 10:30",
    status: "resolved",
    unreadCount: 0,
    avatar: null,
    messages: [
      {
        id: 1,
        content: "Obrigado pelo atendimento!",
        sender: "other" as const,
        timestamp: "20/05/2025 10:30",
      },
    ],
  },
];

export default function ChatPage() {
  const [selectedId, setSelectedId] = React.useState<number | null>(1);
  const [chats, setChats] = React.useState<Chat[]>(chatsMock);
  const [showChatList, setShowChatList] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const selectedChat = chats.find((chat) => chat.id === selectedId) ?? null;

  // Filtra chats baseado na busca
  const filteredChats = React.useMemo(() => {
    if (!searchTerm.trim()) return chats;

    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.number.includes(searchTerm)
    );
  }, [chats, searchTerm]); // Chamada API para o Chatwoot
  React.useEffect(() => {
    const fetchChatwootConversations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "/api/chatwoot/api/v1/accounts/1/conversations",
          {
            method: "GET",
            headers: {
              api_access_token: import.meta.env.VITE_CHATWOOT_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Chatwoot conversations data:", data.data.payload);

          // Mapeia as conversações do Chatwoot para o formato local
          const chatwootChats = data.data.payload.map((conversation: any) => {
            const senderName = conversation.meta?.sender?.name || "Sem nome";
            const senderPhone =
              conversation.meta?.sender?.phone_number || "Número desconhecido";

            // Gera iniciais do nome
            const getInitials = (name: string) => {
              if (name === "Sem nome") return "SN";
              return name
                .split(" ")
                .map((word: string) => word[0]?.toUpperCase() || "")
                .join("")
                .substring(0, 2);
            };

            return {
              id: conversation.id,
              name: senderName,
              number: senderPhone,
              initial: getInitials(senderName),
              lastSeen: new Date(
                conversation.last_activity_at * 1000
              ).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: conversation.status,
              unreadCount: conversation.unread_count,
              avatar: conversation.meta?.sender?.thumbnail || null,
              messages:
                conversation.messages?.map((msg: any) => ({
                  id: msg.id,
                  content: msg.content || msg.processed_message_content,
                  sender: msg.sender_type === "User" ? "me" : "other",
                  timestamp: new Date(msg.created_at * 1000).toLocaleString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  ),
                  status: msg.status,
                  messageType: msg.content_type,
                  senderInfo: msg.sender,
                })) || [],
            };
          });

          // Substitui os chats mock pelos dados reais do Chatwoot
          setChats(chatwootChats);

          // Se não há chat selecionado, seleciona o primeiro
          if (chatwootChats.length > 0 && !selectedId) {
            setSelectedId(chatwootChats[0].id);
          }

          console.log("Chatwoot chats loaded:", chatwootChats);
        } else {
          console.error(
            "Error fetching Chatwoot conversations:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error calling Chatwoot API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatwootConversations();
  }, []);

  // Função para recarregar conversas
  const refreshConversations = () => {
    window.location.reload(); // Recarrega a página para buscar dados atualizados
  };
  // Ao enviar mensagem, adiciona ao chat selecionado e envia para o Chatwoot
  const handleSend = async (message: string) => {
    if (!selectedChat) return;

    // Adiciona mensagem local imediatamente
    const newMessage: ChatMessage = {
      id: Date.now(), // ID temporário
      content: message,
      sender: "me",
      timestamp: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastSeen: newMessage.timestamp,
            }
          : chat
      )
    );

    // Envia mensagem para o Chatwoot
    try {
      const response = await fetch(
        `/api/chatwoot/api/v1/accounts/1/conversations/${selectedChat.id}/messages`,
        {
          method: "POST",
          headers: {
            api_access_token: import.meta.env.VITE_CHATWOOT_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
            message_type: "outgoing",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Atualiza o ID da mensagem com o ID real do servidor
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id === newMessage.id
                      ? { ...msg, id: data.id, status: "sent" }
                      : msg
                  ),
                }
              : chat
          )
        );
      } else {
        console.error("Erro ao enviar mensagem:", response.statusText);
        // Marca mensagem como falha
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id === newMessage.id
                      ? { ...msg, status: "failed" }
                      : msg
                  ),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Marca mensagem como falha
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
                ),
              }
            : chat
        )
      );
    }
  };
  const handleChatSelect = async (id: number) => {
    setSelectedId(id);
    setShowChatList(false); // Fecha a lista no mobile após selecionar

    // Busca mensagens específicas da conversa selecionada
    try {
      const response = await fetch(
        `/api/chatwoot/api/v1/accounts/1/conversations/${id}/messages`,
        {
          method: "GET",
          headers: {
            api_access_token: import.meta.env.VITE_CHATWOOT_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const messages =
          data.payload?.map((msg: any) => ({
            id: msg.id,
            content: msg.content || msg.processed_message_content,
            sender: msg.sender_type === "User" ? "me" : "other",
            timestamp: new Date(msg.created_at * 1000).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: msg.status,
            messageType: msg.content_type,
            senderInfo: msg.sender,
          })) || [];

        // Atualiza as mensagens da conversa selecionada
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === id ? { ...chat, messages, unreadCount: 0 } : chat
          )
        );
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#18181A] relative">
      {/* Sidebar reduzida - hidden no mobile */}

      {/* Lista de chats - overlay no mobile */}
      <aside
        className={`
        ${showChatList ? "fixed inset-0 z-50" : "hidden"} 
        md:relative md:flex md:inset-auto md:z-auto
        w-full md:w-[300px] md:min-w-[220px] md:max-w-[350px] pl-4 
        h-screen bg-[#232325] border-r border-[#222325] flex flex-col
      `}
      >
        {/* Header lista */}
        <div className="p-3 md:p-4 border-b border-[#232323] bg-[#232325]">
          <div className="flex items-center justify-between mb-2 md:mb-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              Conversas
            </h2>
            {/* Botão fechar no mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-[#222325] h-8 w-8"
              onClick={() => setShowChatList(false)}
            >
              <X size={18} />
            </Button>
          </div>{" "}
          <div className="relative mb-3 md:mb-4">
            <input
              type="text"
              placeholder="Buscar por nome ou telefone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pr-9 rounded bg-[#181A1B] text-gray-300 border border-[#232325] placeholder-gray-400 focus:outline-none focus:border-[#374151] text-sm"
            />
            <Search
              className="absolute right-2 top-2 text-gray-400"
              size={18}
            />
          </div>
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="icon"
              onClick={refreshConversations}
              disabled={isLoading}
              className="bg-[#222325] border-[#1F1F22] text-gray-400 hover:text-white hover:bg-[#232328] h-8 w-8"
            >
              <RefreshCcw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-[#222325] border-[#1F1F22] text-gray-400 hover:text-white hover:bg-[#232328] h-8 w-8"
            >
              <Download size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-[#222325] border-[#1F1F22] text-gray-400 hover:text-white hover:bg-[#232328] h-8 w-8"
            >
              <Archive size={16} />
            </Button>
          </div>
        </div>{" "}
        {/* lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-400 text-sm">
                Carregando conversas...
              </div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-400 text-sm">
                {searchTerm
                  ? "Nenhuma conversa encontrada"
                  : "Nenhuma conversa disponível"}
              </div>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 border-b border-[#232323] px-3 md:px-4 py-3 md:py-4 cursor-pointer hover:bg-[#282A2D] transition ${
                  selectedId === chat.id ? "bg-[#1A1C1E]" : ""
                }`}
                onClick={() => handleChatSelect(chat.id)}
              >
                {" "}
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#101112] flex items-center justify-center font-bold text-base md:text-lg text-white mr-1 relative">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    chat.initial
                  )}
                  {/* Indicador de status online/offline */}
                  {chat.status === "open" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#232325]"></div>
                  )}
                </div>{" "}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm md:text-base font-semibold text-white truncate">
                      {chat.name}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-gray-400">
                        {chat.lastSeen}
                      </span>
                      {/* Contador de mensagens não lidas */}
                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <div className="bg-green-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400 truncate flex-1">
                      {chat.number}
                    </div>
                    {/* Status da conversa */}
                    <div className="text-xs text-gray-500 ml-2">
                      {chat.status === "open" && (
                        <span className="text-green-400">●</span>
                      )}
                      {chat.status === "resolved" && (
                        <span className="text-gray-500">●</span>
                      )}
                      {chat.status === "pending" && (
                        <span className="text-yellow-400">●</span>
                      )}
                    </div>{" "}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Componente de conversa */}
      <main className="flex-auto h-screen flex flex-col overflow-hidden relative">
        {/* Botão menu hambúrguer no mobile */}
        <div className="md:hidden absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#222325] h-8 w-8 bg-[#232325] border border-[#222325]"
            onClick={() => setShowChatList(true)}
          >
            <Menu size={18} />
          </Button>
        </div>

        <ChatConversation chat={selectedChat} onSend={handleSend} />
      </main>
    </div>
  );
}
