# 🚀 Atualizações em Tempo Real - Chat Chatwoot

## 📋 Visão Geral

Este documento descreve o plano para implementar atualizações automáticas do histórico de mensagens no chat, permitindo que mensagens enviadas e recebidas apareçam em tempo real sem necessidade de recarregar a página.

## 🔍 Análise das Opções Disponíveis

### 1. **Webhooks do Chatwoot** ⭐ (Recomendado a longo prazo)

- **Eventos disponíveis:**
  - `message_created` - Nova mensagem criada
  - `conversation_updated` - Conversa atualizada
  - `conversation_status_changed` - Status da conversa alterado
- **Vantagens:**
  - Atualizações instantâneas
  - Menor consumo de recursos
  - Dados sempre sincronizados
- **Desvantagens:**
  - Requer endpoint backend
  - Configuração mais complexa

### 2. **Polling Inteligente** ⚡ (Implementação imediata)

- **Funcionamento:**
  - Requests periódicos para buscar atualizações
  - Frequência ajustável baseada na atividade
- **Vantagens:**
  - Implementação simples e rápida
  - Funciona com qualquer versão do Chatwoot
  - Não requer configuração de servidor
- **Desvantagens:**
  - Maior consumo de recursos
  - Latência nas atualizações

### 3. **WebSockets/Server-Sent Events** 🔄

- **Funcionamento:**
  - Chatwoot usa ActionCable (WebSockets do Rails)
  - Conexão persistente para atualizações
- **Vantagens:**
  - Tempo real verdadeiro
  - Eficiente para muitas atualizações
- **Desvantagens:**
  - Implementação complexa
  - Gerenciamento de conexões

## 🎯 Estratégia de Implementação

### **FASE 1: Polling Inteligente** (Prioritário)

#### Configurações de Polling:

```typescript
const POLLING_INTERVALS = {
  ACTIVE_CONVERSATION: 3000, // 3 segundos
  INACTIVE_CONVERSATION: 30000, // 30 segundos
  BACKGROUND_APP: 0, // Pausar
  ERROR_BACKOFF: [1000, 2000, 5000, 10000], // Backoff exponencial
};
```

#### Funcionalidades:

- ✅ Hook personalizado `useRealtimeChat`
- ✅ Sistema de cache inteligente
- ✅ Detecção de mudanças por timestamp
- ✅ Indicadores visuais de status
- ✅ Otimização baseada na atividade do usuário

### **FASE 2: Webhooks** (Futuro)

#### Arquitetura:

```
Chatwoot → Webhook Endpoint → WebSocket/SSE → Frontend
```

#### Implementação:

- Backend para receber webhooks
- Sistema de notificações em tempo real
- Fallback para polling em caso de falha

## 🛠️ Arquivos para Implementação

### Novos Arquivos:

1. **`src/hooks/useRealtimeChat.ts`**

   - Hook principal para gerenciar atualizações em tempo real
   - Controle de polling inteligente
   - Cache e otimizações

2. **`src/hooks/useChatPolling.ts`**

   - Lógica específica de polling
   - Controle de intervalos
   - Tratamento de erros

3. **`src/services/chatwootApi.ts`**

   - Centralização das chamadas API
   - Funções específicas para mensagens
   - Cache e otimizações

4. **`src/types/chat.ts`**
   - Interfaces TypeScript centralizadas
   - Tipos para API responses
   - Enums para status

### Modificações em Arquivos Existentes:

1. **`src/pages/Chat.tsx`**

   - Integração com hooks de tempo real
   - Remoção de lógica manual de refresh
   - Melhor gerenciamento de estado

2. **`src/components/ChatConversation.tsx`**
   - Indicadores de "digitando"
   - Status de entrega de mensagens
   - Animações de novas mensagens

## 📊 Estrutura do Hook Principal

```typescript
// useRealtimeChat.ts
interface UseRealtimeChatOptions {
  selectedChatId: number | null;
  isAppActive: boolean;
  pollingInterval?: number;
}

interface UseRealtimeChatReturn {
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  refreshChats: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useRealtimeChat(
  options: UseRealtimeChatOptions
): UseRealtimeChatReturn;
```

## ⚡ Funcionalidades Planejadas

### Indicadores Visuais:

- 🟢 Status online/offline dos contatos
- ⏳ Indicador "digitando..."
- ✓ Status de entrega das mensagens
- 🔔 Notificações de novas mensagens
- 📱 Badge de mensagens não lidas

### Otimizações:

- 🎯 Polling apenas para conversas ativas
- 💾 Cache inteligente de mensagens
- 🔄 Debounce em atualizações
- 📄 Paginação automática
- 🧹 Cleanup de recursos

### Tratamento de Erros:

- 🔁 Retry automático com backoff
- 📊 Logs detalhados
- 🚨 Alertas para falhas persistentes
- 💾 Fallback para dados locais

## 🔧 Configurações Avançadas

### Variables de Ambiente:

```env
# Polling
VITE_CHAT_POLLING_ACTIVE=3000
VITE_CHAT_POLLING_INACTIVE=30000
VITE_CHAT_POLLING_MAX_RETRIES=5

# Cache
VITE_CHAT_CACHE_TTL=300000
VITE_CHAT_CACHE_MAX_MESSAGES=100

# Webhooks (Futuro)
VITE_WEBHOOK_ENDPOINT_URL=""
VITE_WEBSOCKET_URL=""
```

### Performance:

- Máximo de 100 mensagens em cache por conversa
- TTL de cache: 5 minutos
- Cleanup automático de conversas antigas
- Compressão de dados para grandes volumes

## 📈 Métricas e Monitoramento

### KPIs a Monitorar:

- Tempo de resposta das APIs
- Taxa de sucesso/falha dos requests
- Frequência de atualizações
- Uso de memória do cache
- Latência das mensagens

### Logs Importantes:

- Início/fim de polling
- Errors de API
- Cache hits/misses
- Mensagens enviadas/recebidas
- Mudanças de status

## 🚦 Critérios de Aceitação

### Funcionais:

- ✅ Mensagens aparecem automaticamente
- ✅ Status de conversa atualiza em tempo real
- ✅ Contador de não lidas funciona
- ✅ Indicadores visuais corretos
- ✅ Performance não degradada

### Técnicos:

- ✅ Código TypeScript tipado
- ✅ Tratamento de erros robusto
- ✅ Testes unitários
- ✅ Documentação completa
- ✅ Logs para debugging

## 🔄 Migração Futura para Webhooks

### Passos:

1. Implementar endpoint backend
2. Configurar webhooks no Chatwoot
3. Criar sistema WebSocket/SSE
4. Migração gradual com feature flag
5. Desativação do polling

### Compatibilidade:

- Manter polling como fallback
- Feature flags para alternar sistemas
- Monitoramento comparativo
- Rollback automático se necessário

## 📝 Notas de Desenvolvimento

### Considerações:

- Usar AbortController para cancelar requests
- Implementar cleanup em useEffect
- Considerar offline/online detection
- Throttle em updates rápidos
- Batch updates quando possível

### Testes:

- Simular cenários de alta carga
- Testar reconexão após falhas
- Validar comportamento offline
- Performance com muitas conversas
- Memory leaks em polling longo

---

**Status:** 📋 Planejado  
**Prioridade:** 🔥 Alta  
**Estimativa:** 2-3 sprints para Fase 1  
**Última atualização:** 29/05/2025
