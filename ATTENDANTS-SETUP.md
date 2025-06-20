# Sistema de Gerenciamento de Atendentes - Integração Supabase

Este documento descreve como configurar e usar o sistema de gerenciamento de atendentes integrado ao Supabase.

## 🚀 Configuração Inicial

### 1. Configurar Supabase

1. **Criar/Acessar projeto no Supabase**

   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto ou use um existente

2. **Executar SQL para criar tabela**

   - Abra o SQL Editor no painel do Supabase
   - Execute o conteúdo do arquivo `create-attendants-table.sql`
   - Isso criará a tabela `attendants` com todas as configurações necessárias

3. **Configurar variáveis de ambiente**
   - Copie `.env.example` para `.env`
   - Preencha as variáveis com os dados do seu projeto:
     ```env
     VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
     VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
     ```

### 2. Estrutura da Tabela `attendants`

```sql
CREATE TABLE public.attendants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    n8n_id TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**

- `id`: UUID único do atendente (chave primária)
- `name`: Nome do atendente
- `n8n_id`: ID único do atendente no sistema n8n
- `active`: Status ativo/inativo (padrão: true)
- `created_at`: Data de criação
- `updated_at`: Data da última modificação (atualizada automaticamente)

## 📋 Funcionalidades Implementadas

### ✅ Listar Atendentes

- Carrega todos os atendentes da tabela `attendants`
- Exibe apenas registros existentes no banco
- Ordenação por data de criação (mais recentes primeiro)
- Estados de loading e tratamento de erros

### ✅ Criar Atendente

- Modal com campos `name` e `n8nId`
- Campo `active` definido como `true` por padrão
- Validação de ID do n8n único
- Feedback visual de sucesso/erro

### ✅ Editar Atendente

- Modal para editar `name` e `n8n_id`
- Validação para evitar IDs duplicados
- Atualização em tempo real na lista

### ✅ Alternar Status (Ativo/Inativo)

- Switch para ativar/desativar atendentes
- Atualização imediata no banco e na interface
- Feedback visual do status atual

### ✅ Excluir Atendente

- Modal de confirmação antes da exclusão
- Remoção permanente do banco de dados
- Atualização automática da lista

## 🛡️ Segurança e Performance

### Row Level Security (RLS)

- RLS habilitado na tabela `attendants`
- Políticas que permitem acesso apenas a usuários autenticados
- Operações permitidas: SELECT, INSERT, UPDATE, DELETE

### Índices Otimizados

- `idx_attendants_n8n_id`: Para buscas por ID do n8n
- `idx_attendants_active`: Para filtros por status
- `idx_attendants_name`: Para buscas por nome
- `idx_attendants_active_name`: Índice composto otimizado

### Triggers Automáticos

- Trigger `update_attendants_updated_at` atualiza automaticamente o campo `updated_at`

## 🔧 Arquivos Importantes

### Frontend

- **`src/pages/Attendants.tsx`**: Página principal com lista de atendentes
- **`src/hooks/useAttendants.ts`**: Hook custom para operações CRUD
- **`src/components/ModalCreateAttendant.tsx`**: Modal para criar atendente
- **`src/components/ModalEditAttendant.tsx`**: Modal para editar atendente
- **`src/components/DeleteConfirmation.tsx`**: Modal de confirmação de exclusão
- **`src/lib/supabaseClient.ts`**: Cliente configurado do Supabase

### Database

- **`create-attendants-table.sql`**: Script completo para criar tabela e configurações

## 🎯 Como Usar

### 1. Criando um Atendente

1. Clique no botão "Criar atendente"
2. Preencha o nome e ID do n8n
3. Clique em "Prosseguir"
4. O atendente será criado com status ativo por padrão

### 2. Editando um Atendente

1. Clique no botão "Editar" ao lado do atendente desejado
2. Modifique o nome ou ID do n8n
3. Clique em "Salvar"

### 3. Alterando Status

1. Use o switch ao lado do nome do atendente
2. O status será atualizado automaticamente

### 4. Excluindo um Atendente

1. Clique no botão de lixeira (🗑️)
2. Confirme a exclusão no modal
3. O atendente será removido permanentemente

## 🚨 Tratamento de Erros

O sistema inclui tratamento robusto de erros:

- **IDs duplicados**: Validação para evitar n8n_id duplicados
- **Campos obrigatórios**: Validação de campos vazios
- **Conectividade**: Tratamento de erros de rede
- **Feedback visual**: Toasts informativos para todas as operações

## 🔄 Sincronização de Dados

- **Mutação local otimista**: Interface atualiza imediatamente
- **Fallback automático**: Reverte em caso de erro no servidor
- **Refetch automático**: Carrega dados atualizados após operações
- **Estado consistente**: Mantém sincronização entre banco e interface

## 📱 Responsividade

A interface é totalmente responsiva:

- **Mobile**: Layout vertical otimizado
- **Desktop**: Layout horizontal com mais informações
- **Tablets**: Adaptação automática conforme tamanho da tela

Este sistema fornece uma base sólida para gerenciar atendentes integrados ao n8n, com todas as operações CRUD necessárias e uma experiência de usuário polida.
