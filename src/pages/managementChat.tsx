import React from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Plus,
  Send,
  Bot,
  User,
  Menu,
  X,
  Trash2,
  Edit3,
} from "lucide-react";
import { useAIChats, useAIMessages } from "@/hooks/useAIChat";
import { toast } from "@/hooks/use-toast";

export default function AIChatPage() {
  // Hooks para gerenciar chats e mensagens
  const {
    chats,
    loading: chatsLoading,
    createChat,
    deleteChat,
    updateChatTitle,
  } = useAIChats();
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
    null
  );
  const {
    messages,
    loading: messagesLoading,
    addMessage,
  } = useAIMessages(selectedChatId);

  const [showSidebar, setShowSidebar] = React.useState(false);
  const [inputMessage, setInputMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [editingTitleId, setEditingTitleId] = React.useState<string | null>(
    null
  );
  const [editTitleValue, setEditTitleValue] = React.useState("");

  // Adicionar ref para o container de mensagens
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Selecionar primeiro chat se disponível
  React.useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  const selectedConversation = chats.find((chat) => chat.id === selectedChatId);

  // Função para rolar para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect para rolar para baixo quando mensagens mudarem
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect para rolar para baixo quando uma conversa for selecionada
  React.useEffect(() => {
    scrollToBottom();
  }, [selectedChatId]);

  // Criar nova conversa
  const createNewConversation = async () => {
    const newChat = await createChat({
      title: "Nova conversa",
    });

    if (newChat) {
      setSelectedChatId(newChat.id);
      setShowSidebar(false);
      toast({
        title: "Chat criado",
        description: "Nova conversa criada com sucesso!",
      });
    }
  };

  // Funções para editar título
  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingTitleId(chatId);
    setEditTitleValue(currentTitle);
  };

  const saveEditedTitle = async (chatId: string) => {
    if (editTitleValue.trim()) {
      const success = await updateChatTitle(chatId, editTitleValue.trim());
      if (success) {
        toast({
          title: "Título atualizado",
          description: "Título da conversa atualizado com sucesso!",
        });
      }
    }
    setEditingTitleId(null);
    setEditTitleValue("");
  };

  const cancelEditingTitle = () => {
    setEditingTitleId(null);
    setEditTitleValue("");
  };
  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChatId) return;

    const messageText = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    // Adicionar mensagem do usuário ao banco
    const userMessage = await addMessage({
      chat_id: selectedChatId,
      content: messageText,
      role: "user",
    });

    if (!userMessage) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Atualizar título se for a primeira mensagem
    if (messages.length === 0 && selectedConversation) {
      const newTitle =
        messageText.slice(0, 50) + (messageText.length > 50 ? "..." : "");
      await updateChatTitle(selectedChatId, newTitle);
    }

    // Rolar para baixo após adicionar mensagem do usuário
    setTimeout(scrollToBottom, 100);

    try {
      // Chama o webhook com a mensagem do usuário
      const response = await fetch(
        "https://webhookbase.aryaraj.shop/webhook/bd3636e2-3272-469d-ac5b-fb3e1e484a95-ChatGestaoIA01",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mensagem: messageText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const responseData = await response.text();

      // Adicionar resposta da IA ao banco
      await addMessage({
        chat_id: selectedChatId,
        content:
          responseData || "Desculpe, não consegui processar sua mensagem.",
        role: "assistant",
      });

      // Rolar para baixo após receber resposta da IA
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Erro ao enviar mensagem para o webhook:", error);

      // Adicionar mensagem de erro
      await addMessage({
        chat_id: selectedChatId,
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        role: "assistant",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Deletar conversa
  const deleteConversation = async (chatId: string) => {
    const success = await deleteChat(chatId);

    if (success) {
      // Se for o chat selecionado, selecionar outro
      if (selectedChatId === chatId) {
        const remaining = chats.filter((chat) => chat.id !== chatId);
        setSelectedChatId(remaining.length > 0 ? remaining[0].id : null);
      }

      toast({
        title: "Chat excluído",
        description: "Conversa excluída com sucesso!",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao excluir conversa",
        variant: "destructive",
      });
    }
  };

  // Formatar timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full w-full bg-[#18181A]">
      {/* Lista de conversas */}
      <aside
        className={`
        ${showSidebar ? "fixed inset-0 z-50" : "hidden"} 
        md:relative md:flex md:inset-auto pl-4 md:z-auto
        w-full md:w-[320px] 
        h-full bg-[#232325] border-r border-[#222325] flex flex-col
      `}
      >
        {/* Header da sidebar */}
        <div className="p-4 border-b border-[#232323]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot size={24} />
              Gestão com IA
            </h1>
            {/* Botão fechar no mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-[#222325] h-8 w-8"
              onClick={() => setShowSidebar(false)}
            >
              <X size={18} />
            </Button>
          </div>

          {/* Botão nova conversa */}
          <Button
            onClick={createNewConversation}
            className="w-full bg-[#1A1C1E] hover:bg-[#222325] text-white border border-[#232325] gap-2"
          >
            <Plus size={16} />
            Nova conversa
          </Button>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto p-2">
          {chatsLoading ? (
            <div className="text-center text-gray-400 mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Carregando conversas...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma conversa ainda</p>
              <p className="text-sm">Clique em "Nova conversa" para começar</p>
            </div>
          ) : (
            chats.map((conversation) => (
              <div
                key={conversation.id}
                className={`
                  group p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200
                  ${
                    selectedChatId === conversation.id
                      ? "bg-[#1A1C1E] border border-[#374151]"
                      : "hover:bg-[#282A2D]"
                  }
                `}
                onClick={() => {
                  setSelectedChatId(conversation.id);
                  setShowSidebar(false);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingTitleId === conversation.id ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              saveEditedTitle(conversation.id);
                            } else if (e.key === "Escape") {
                              cancelEditingTitle();
                            }
                          }}
                          onBlur={() => saveEditedTitle(conversation.id)}
                          className="text-white text-sm font-medium bg-[#374151] px-2 py-1 rounded border-none outline-none focus:ring-1 focus:ring-[#007AFF] w-full"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-white text-sm font-medium truncate">
                          {conversation.title}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(
                            conversation.last_message_at
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-white hover:bg-[#374151]"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingTitle(conversation.id, conversation.title);
                      }}
                    >
                      <Edit3 size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-[#374151]"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Área principal - Conversa */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative">
        {/* Botão menu hambúrguer no mobile */}
        <div className="md:hidden absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#222325] h-8 w-8 bg-[#232325] border border-[#222325]"
            onClick={() => setShowSidebar(true)}
          >
            <Menu size={18} />
          </Button>
        </div>

        {selectedConversation ? (
          <>
            {/* Header da conversa */}
            <div className="p-4 border-b border-[#232323] bg-[#232325]">
              <h2 className="text-lg font-semibold text-white truncate pl-12 md:pl-0">
                {selectedConversation.title}
              </h2>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                  <p className="text-gray-400">Carregando mensagens...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot size={64} className="text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Como posso te ajudar hoje?
                  </h3>
                  <p className="text-gray-400">
                    Digite sua pergunta abaixo para começar a conversar
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-[#007AFF] text-white"
                          : "bg-[#232325] text-white border border-[#374151]"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Indicador de digitação */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-[#232325] text-white border border-[#374151] p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Referência para o final das mensagens - Auto-scroll */}
              <div ref={messagesEndRef} className="h-1"></div>
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-[#232323] bg-[#232325]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 p-3 rounded-lg bg-[#18181A] text-white border border-[#374151] placeholder-gray-400 focus:outline-none focus:border-[#007AFF] text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-[#007AFF] hover:bg-[#0056CC] text-white px-4"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Estado vazio - nenhuma conversa selecionada
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Bot size={64} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo ao AI Chat
            </h2>
            <p className="text-gray-400 mb-6">
              Crie uma nova conversa para começar a interagir com a IA
            </p>
            <Button
              onClick={createNewConversation}
              className="bg-[#007AFF] hover:bg-[#0056CC] text-white gap-2"
            >
              <Plus size={16} />
              Nova conversa
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
