/**
 * Correção para o processamento de mensagens de áudio
 *
 * Código para a função handleChatSelect
 */

// Inclua este bloco dentro da função handleChatSelect
// no lugar do trecho que processa mensagens

if (response.ok) {
  const data = await response.json();
  console.log("Messages data for conversation:", id, data);

  // Log para depurar a estrutura da primeira mensagem
  if (data.payload && data.payload.length > 0) {
    console.log("First message structure:", data.payload[0]);
    const firstAttachment =
      data.payload[0].attachments && data.payload[0].attachments.length > 0
        ? data.payload[0].attachments[0]
        : null;
    if (firstAttachment) {
      console.log("First attachment structure:", firstAttachment);
      console.log("Available properties:", Object.keys(firstAttachment));
    }
  }

  let messages =
    data.payload?.map((msg: any) => {
      // Detecta se é mensagem de áudio
      const isAudio =
        msg.content_type === "audio" ||
        msg.messageType === "audio" ||
        (msg.attachments &&
          msg.attachments.length > 0 &&
          (msg.attachments[0].file_type?.startsWith("audio") ||
            msg.attachments[0].content_type?.startsWith("audio")));

      // Extrai dados do áudio se existir
      let audioUrl = null;
      let audioDuration = null;
      let attachments = null;
      let messageType = msg.content_type;

      if (isAudio) {
        // Define messageType como audio para todas mensagens de áudio
        messageType = "audio";

        if (msg.attachments && msg.attachments.length > 0) {
          const audioAttachment = msg.attachments[0];

          // Registra o objeto de anexo para depuração
          console.log(
            "Audio attachment:",
            JSON.stringify(audioAttachment, null, 2)
          );

          // Tenta obter URL do áudio de diferentes propriedades
          audioUrl =
            audioAttachment.data_url ||
            audioAttachment.file_url ||
            audioAttachment.url ||
            audioAttachment.source_url ||
            audioAttachment.download_url ||
            null;

          audioDuration =
            audioAttachment.metadata?.duration || audioAttachment.duration || 0;
          attachments = msg.attachments;

          console.log("Audio processing result:", {
            isAudio,
            audioUrl,
            audioDuration,
            messageType,
          });
        } else {
          console.log("Audio message detected but no attachments found:", msg);
        }
      }

      return {
        id: msg.id,
        content:
          msg.content ||
          msg.processed_message_content ||
          (isAudio ? "🎵 Mensagem de áudio" : ""),
        sender:
          msg.message_type === 0 || msg.message_type === "incoming"
            ? "other"
            : "me",
        timestamp: new Date(msg.created_at * 1000).toISOString(),
        status: msg.status,
        messageType, // Importante: usa o messageType processado
        senderInfo: msg.sender,
        audioUrl, // URL do áudio
        audioDuration,
        attachments,
        originalTimestamp: msg.created_at,
      };
    }) || [];

  // Ordena mensagens em ordem cronológica (mais antigas primeiro)
  messages = messages.sort(
    (a: any, b: any) => a.originalTimestamp - b.originalTimestamp
  );

  // Remove o timestamp original após a ordenação
  messages = messages.map(({ originalTimestamp, ...msg }: any) => msg);

  // Atualiza as mensagens
  setTimeout(() => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, messages, unreadCount: 0 } : chat
      )
    );
    setLoadingMessages(null);
  }, 300);
}
