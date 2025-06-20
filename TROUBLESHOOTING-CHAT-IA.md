# 🚨 GUIA DE TROUBLESHOOTING - Chat IA

## Problema Identificado

O erro **"New row violates row-level security policy"** indica que as políticas RLS do Supabase estão bloqueando a inserção de mensagens na tabela `ai_messages`.

## 🔧 Soluções (Execute em ordem)

### **Solução 1: Executar Script de Correção**

1. Abra o **SQL Editor** do Supabase
2. Execute o arquivo `database-ai-chat-fix.sql`
3. Verifique se o teste retorna "PASS" em todos os itens

### **Solução 2: Debug Temporário (se Solução 1 falhar)**

1. Execute o arquivo `database-debug.sql` no Supabase
2. Isso **desabilita temporariamente** o RLS para teste
3. Teste a funcionalidade no frontend
4. **IMPORTANTE:** Reabilite o RLS depois:

```sql
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
```

### **Solução 3: Verificar Autenticação**

Se o problema persistir, verifique se o usuário está logado:

1. Abra o **DevTools** do navegador (F12)
2. Na aba **Console**, procure por logs como:
   - "Tentando adicionar mensagem:"
   - "Erro detalhado do Supabase:"
   - "Usuário não autenticado"

### **Solução 4: Verificar se as Tabelas Existem**

Execute no SQL Editor do Supabase:

```sql
-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_chats', 'ai_messages');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('ai_chats', 'ai_messages');
```

## 🚀 **Como Testar se Está Funcionando**

1. **Acesse** a página do Chat IA
2. **Clique** em "Nova Conversa"
3. **Digite** uma mensagem e envie
4. **Verifique** se:
   - A mensagem aparece na tela
   - Não há erros no console
   - A conversa aparece na lista lateral

## 📋 **Checklist de Verificação**

- [ ] Script SQL `database-ai-chat.sql` foi executado
- [ ] Usuário está logado no sistema
- [ ] Tabelas `ai_chats` e `ai_messages` existem
- [ ] Políticas RLS estão configuradas
- [ ] Não há erros no console do navegador

## 🔍 **Comandos SQL Úteis para Debug**

```sql
-- Ver estrutura das tabelas
\d public.ai_chats;
\d public.ai_messages;

-- Ver dados (se existirem)
SELECT * FROM public.ai_chats LIMIT 5;
SELECT * FROM public.ai_messages LIMIT 5;

-- Ver políticas ativas
SELECT * FROM pg_policies WHERE tablename IN ('ai_chats', 'ai_messages');

-- Testar inserção manual (como admin)
INSERT INTO public.ai_chats (user_id, title)
VALUES ('00000000-0000-0000-0000-000000000000', 'Teste');
```

## ⚠️ **Notas Importantes**

1. **RLS Desabilitado**: Se você desabilitar RLS para teste, SEMPRE reabilite depois
2. **Backup**: Faça backup do banco antes de executar scripts de correção
3. **Logs**: Mantenha o console aberto para ver logs detalhados
4. **Autenticação**: Verifique se o token JWT não expirou

## 🆘 **Se Nada Funcionar**

1. **Execute o script original** `database-ai-chat.sql` novamente
2. **Limpe o cache** do navegador (Ctrl+Shift+R)
3. **Deslogue e faça login** novamente
4. **Verifique as variáveis** de ambiente do Supabase

---

**🎯 A causa mais comum deste erro é que as políticas RLS não reconhecem o usuário autenticado. O script de correção resolve isso na maioria dos casos.**
