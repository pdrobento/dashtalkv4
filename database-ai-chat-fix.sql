-- =============================================================================
-- AI CHAT MODULE - HOTFIX PARA POLÍTICAS RLS
-- =============================================================================
-- Este script corrige as políticas de segurança para o sistema de chat com IA
-- =============================================================================

-- Primeiro, vamos desabilitar RLS temporariamente para debug
ALTER TABLE public.ai_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can create their own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.ai_chats;
DROP POLICY IF EXISTS "Users can view messages from their chats" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can create messages in their chats" ON public.ai_messages;

-- Reabilitar RLS
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS CORRIGIDAS PARA AI_CHATS
-- =============================================================================

-- Política para visualizar chats
CREATE POLICY "ai_chats_select_policy"
    ON public.ai_chats FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Política para criar chats
CREATE POLICY "ai_chats_insert_policy"
    ON public.ai_chats FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Política para atualizar chats
CREATE POLICY "ai_chats_update_policy"
    ON public.ai_chats FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política para deletar chats
CREATE POLICY "ai_chats_delete_policy"
    ON public.ai_chats FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =============================================================================
-- POLÍTICAS CORRIGIDAS PARA AI_MESSAGES
-- =============================================================================

-- Política para visualizar mensagens
CREATE POLICY "ai_messages_select_policy"
    ON public.ai_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_chats 
            WHERE ai_chats.id = ai_messages.chat_id 
            AND ai_chats.user_id = auth.uid()
        )
    );

-- Política para criar mensagens (CORRIGIDA)
CREATE POLICY "ai_messages_insert_policy"
    ON public.ai_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_chats 
            WHERE ai_chats.id = ai_messages.chat_id 
            AND ai_chats.user_id = auth.uid()
        )
    );

-- =============================================================================
-- VERIFICAR SE AS POLÍTICAS ESTÃO FUNCIONANDO
-- =============================================================================

-- Função para testar as políticas
CREATE OR REPLACE FUNCTION public.test_ai_chat_policies()
RETURNS TABLE(
    test_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar se as tabelas existem
    RETURN QUERY
    SELECT 
        'Tables exist'::TEXT as test_name,
        CASE 
            WHEN (SELECT COUNT(*) FROM information_schema.tables 
                  WHERE table_schema = 'public' 
                  AND table_name IN ('ai_chats', 'ai_messages')) = 2 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END as status,
        (SELECT COUNT(*)::TEXT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name IN ('ai_chats', 'ai_messages')) || ' tables found' as details;
    
    -- Verificar RLS habilitado
    RETURN QUERY
    SELECT 
        'RLS enabled'::TEXT as test_name,
        CASE 
            WHEN (SELECT COUNT(*) FROM pg_tables 
                  WHERE schemaname = 'public' 
                  AND tablename IN ('ai_chats', 'ai_messages')
                  AND rowsecurity = true) = 2 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END as status,
        'RLS status checked' as details;
        
    -- Verificar políticas criadas
    RETURN QUERY
    SELECT 
        'Policies created'::TEXT as test_name,
        CASE 
            WHEN (SELECT COUNT(*) FROM pg_policies 
                  WHERE schemaname = 'public' 
                  AND tablename IN ('ai_chats', 'ai_messages')) >= 6 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END as status,
        (SELECT COUNT(*)::TEXT FROM pg_policies 
         WHERE schemaname = 'public' 
         AND tablename IN ('ai_chats', 'ai_messages')) || ' policies found' as details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar teste
SELECT * FROM public.test_ai_chat_policies();

-- Log de correção
INSERT INTO public.auth_logs (event_type, success, metadata) VALUES (
    'ai_chat_policies_fix', 
    true, 
    jsonb_build_object(
        'timestamp', NOW(),
        'version', '1.1.0',
        'action', 'policies_recreated'
    )
);
