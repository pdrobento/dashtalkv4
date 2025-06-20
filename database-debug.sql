-- SCRIPT DE DEBUG PARA DESABILITAR RLS TEMPORARIAMENTE
-- Execute este script apenas para debug/teste

-- Desabilitar RLS temporariamente
ALTER TABLE public.ai_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages DISABLE ROW LEVEL SECURITY;

-- Verificar se as tabelas estão funcionando
SELECT 'ai_chats table' as table_name, COUNT(*) as records FROM public.ai_chats;
SELECT 'ai_messages table' as table_name, COUNT(*) as records FROM public.ai_messages;

-- Para reabilitar RLS depois dos testes:
-- ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
