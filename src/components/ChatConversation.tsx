import React from "react";
import { useEffect, useRef } from "react";
import { Send, CornerDownLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";

// Função para formatar a data no estilo do WhatsApp
const formatMessageTime = (timestamp: string) => {
  // Certifica-se de que a data é válida
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);
  // Verifica se a data é válida
  if (isNaN(messageDate.getTime())) {
    console.error("Data inválida:", timestamp);
    return "";
  }

  // Para mensagens, mostramos apenas a hora (HH:MM)
  return messageDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface Message {
  id: number;
  content: string;
  sender: "me" | "other";
  timestamp: string;
  name?: string;
  isEmoji?: boolean;
  forwarded?: boolean;
  position?: number;
  messageType?: string;
  audioUrl?: string;
  audioDuration?: number;
  attachments?: any[];
}

interface ChatConversationProps {
  chat: {
    id: number;
    name: string;
    number: string;
    initial: string;
    messages: Message[];
    lastSeen: string;
  } | null;
  onSend: (message: string) => void;
  isLoadingMessages?: boolean;
}

export function ChatConversation({
  chat,
  onSend,
  isLoadingMessages = false,
}: ChatConversationProps) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [chat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-zatten-bg-primary min-h-screen px-4">
        <span className="text-zatten-text-muted text-center text-sm md:text-base">
          Selecione uma conversa à esquerda
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zatten-bg-primary flex-1 min-h-screen w-full">
      {/* Topbar do chat melhorado */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-zatten-border-primary bg-zatten-bg-secondary mt-12 md:mt-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-lg text-white shadow-lg">
            {chat.initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base md:text-lg font-semibold text-zatten-text-primary truncate">
              {chat.name}
            </div>
            <div className="text-xs md:text-sm text-zatten-text-muted flex items-center gap-2">
              <span className="truncate">{chat.number}</span>
              <span className="text-zatten-text-placeholder">•</span>
              <span className="text-zatten-success text-xs">Online</span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-zatten-text-muted hover:text-zatten-text-primary hover:bg-zatten-bg-hover h-9 w-9 rounded-full"
          >
            <Phone size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zatten-text-muted hover:text-zatten-text-primary hover:bg-zatten-bg-hover h-9 w-9 rounded-full"
          >
            <Video size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zatten-text-muted hover:text-zatten-text-primary hover:bg-zatten-bg-hover h-9 w-9 rounded-full"
          >
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Histórico mensagens */}
      <div
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 flex flex-col bg-zatten-bg-primary"
        style={{ gap: "8px" }}
      >
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-6 p-8">
              {/* Loading spinner duplo */}
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-300 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animation-delay-150"></div>
              </div>

              {/* Mensagens mockup com loading pulse */}
              <div className="w-full max-w-md space-y-4">
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="bg-gray-300 rounded-2xl rounded-bl-sm px-4 py-2 animate-pulse">
                      <div className="h-4 w-32 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-purple-300 rounded-2xl rounded-br-sm px-4 py-2 animate-pulse">
                    <div className="h-4 w-20 bg-purple-400 rounded"></div>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="bg-gray-300 rounded-2xl rounded-bl-sm px-4 py-2 animate-pulse">
                      <div className="h-4 w-40 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Texto de carregamento */}
              <div className="text-center">
                <span className="text-zatten-text-muted text-base font-medium block loading-pulse">
                  Carregando mensagens...
                </span>
                <span className="text-zatten-text-placeholder text-sm mt-2 block">
                  Aguarde um momento
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chat.messages.map((msg, i) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: msg.sender === "me" ? "row-reverse" : "row",
                  gap: "8px",
                  alignItems: "flex-end",
                  justifyContent:
                    msg.sender === "me" ? "flex-end" : "flex-start",
                  width: "100%",
                  marginBottom: "12px",
                }}
              >
                {/* Avatar (só para remetente) */}
                {msg.sender === "other" ? (
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
                    {chat.initial}
                  </div>
                ) : (
                  <div className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0" />
                )}
                <div
                  style={{
                    backgroundColor:
                      msg.sender === "me" ? "#8B5CF6" : "#4B5563",
                    color: "white",
                    borderRadius: "16px",
                    borderBottomRightRadius:
                      msg.sender === "me" ? "4px" : "16px",
                    borderBottomLeftRadius:
                      msg.sender === "other" ? "4px" : "16px",
                    padding:
                      msg.messageType === "audio" ? "4px 8px" : "8px 16px",
                    maxWidth: "80%",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    marginLeft: msg.sender === "me" ? "auto" : "0",
                    marginRight: msg.sender === "me" ? "0" : "auto",
                  }}
                  className="text-sm"
                >
                  {/* Renderiza AudioPlayer para mensagens de áudio */}
                  {msg.messageType === "audio" ? (
                    msg.audioUrl ? (
                      <AudioPlayer
                        audioUrl={msg.audioUrl}
                        duration={msg.audioDuration}
                        className="my-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-black bg-opacity-20 border border-white border-opacity-20 rounded-lg">
                        <div className="animate-pulse w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🎵</span>
                        </div>
                        <div>
                          <span className="text-sm block">
                            Mensagem de áudio
                          </span>
                          <span className="text-xs text-gray-300">
                            URL de áudio não disponível
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="block">{msg.content}</span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "4px",
                      fontSize: "10px",
                      gap: "4px",
                      opacity: "0.8",
                      color: msg.sender === "me" ? "#EDE9FE" : "#E5E7EB",
                    }}
                  >
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {msg.sender === "me" && (
                      <CornerDownLeft className="inline w-2.5 h-2.5 md:w-3 md:h-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Barra enviar mensagem */}
      <form
        className="flex gap-2 px-3 md:px-4 py-3 md:py-4 border-t border-zatten-border-primary bg-zatten-bg-tertiary"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() !== "") {
            onSend(input);
            setInput("");
          }
        }}
      >
        <Textarea
          className="resize-none h-10 md:h-12 min-h-[40px] md:min-h-[42px] zatten-input flex-1 text-sm rounded-xl border-none"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          className="zatten-button-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 shadow-lg"
        >
          <Send size={18} className="md:size-[21px]" />
        </Button>
      </form>
    </div>
  );
}
