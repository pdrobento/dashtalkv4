# 🤖 Sistema de Chat com IA - Persistência no Banco

Este documento explica como configurar a persistência dos chats com IA no banco de dados.

## 📋 O que foi implementado

### 1. **Schema do Banco de Dados**

Duas novas tabelas foram criadas:

- **`ai_chats`**: Armazena as conversas/chats
- **`ai_messages`**: Armazena as mensagens de cada chat

### 2. **Funcionalidades**

- ✅ **Criar novo chat** automaticamente no banco
- ✅ **Listar chats** do usuário (ordenados por última mensagem)
- ✅ **Carregar mensagens** de um chat específico
- ✅ **Salvar mensagens** (usuário e IA) automaticamente
- ✅ **Deletar chat** e todas suas mensagens
- ✅ **Atualizar timestamp** da última mensagem automaticamente

### 3. **Otimizações Implementadas**

- **Índices** para performance em consultas
- **Row Level Security (RLS)** para segurança
- **Triggers** para atualização automática de timestamps
- **Relacionamentos** com cascata para deletar mensagens

## 🚀 Como configurar

### Passo 1: Executar o Script SQL

1. Abra o painel do **Supabase**
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `database-ai-chat.sql`
4. Execute o script

### Passo 2: Verificar a Instalação

Após executar o script, você verá uma tabela com o status da instalação:

```
AI Chat Tables    | OK      | Found 2 of 2 required tables
AI Chat Indexes   | OK      | Found 6 indexes
AI Chat Policies  | OK      | Found 6 policies
```

### Passo 3: Testar a Funcionalidade

1. Acesse a página de **Chat com IA**
2. Crie uma nova conversa
3. Envie algumas mensagens
4. Verifique no banco se os dados estão sendo salvos

## 📊 Estrutura das Tabelas

### Tabela `ai_chats`

```sql
CREATE TABLE public.ai_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `ai_messages`

```sql
CREATE TABLE public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES ai_chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Segurança (RLS)

- **Usuários** só podem ver/editar seus próprios chats
- **Mensagens** são filtradas por propriedade do chat
- **Triggers** automáticos para atualizar timestamps
- **Cascata** para deletar mensagens quando chat é removido

## 🎯 Benefícios

- **Performance**: Consultas otimizadas com índices
- **Segurança**: RLS garante isolamento por usuário
- **Confiabilidade**: Dados persistidos no banco
- **Escalabilidade**: Suporte a milhares de chats
- **Automação**: Timestamps atualizados automaticamente

## 🛠️ Próximos Passos (Opcionais)

- [ ] **Busca em mensagens**: Implementar busca full-text
- [ ] **Categorias**: Adicionar categorias aos chats
- [ ] **Compartilhamento**: Permitir compartilhar chats
- [ ] **Exportação**: Exportar conversas em PDF/TXT
- [ ] **Analytics**: Métricas de uso dos chats

## 🐛 Troubleshooting

### Erro: "relation ai_chats does not exist"

**Solução**: Execute o script `database-ai-chat.sql` no Supabase

### Erro: "permission denied for table ai_chats"

**Solução**: Verifique se o RLS está configurado corretamente

### Chats não aparecem

**Solução**: Verifique se o usuário está logado e se o `user_id` está correto

---

**🎉 Pronto!** Agora o sistema de chat com IA está completamente integrado ao banco de dados!
