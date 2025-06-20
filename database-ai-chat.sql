-- =============================================================================
-- AI CHAT MODULE - SCHEMA SETUP
-- =============================================================================
-- Este script adiciona as tabelas necessárias para o sistema de chat com IA
-- =============================================================================

-- =============================================================================
-- 1. TABELAS PARA CHAT IA
-- =============================================================================

-- Tabela de chats (conversas de IA)
CREATE TABLE IF NOT EXISTS public.ai_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens do chat IA
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para ai_chats
CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON public.ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_last_message_at ON public.ai_chats(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chats_created_at ON public.ai_chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chats_user_last_message ON public.ai_chats(user_id, last_message_at DESC);

-- Índices para ai_messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_chat_id ON public.ai_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_chat_created ON public.ai_messages(chat_id, created_at);

-- =============================================================================
-- 3. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =============================================================================

-- Trigger para atualizar updated_at em ai_chats
CREATE TRIGGER trigger_ai_chats_updated_at
    BEFORE UPDATE ON public.ai_chats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Função para atualizar last_message_at quando uma nova mensagem é adicionada
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_chats 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar last_message_at
CREATE TRIGGER trigger_update_chat_last_message
    AFTER INSERT ON public.ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_chat_last_message();

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_chats
CREATE POLICY "Users can view their own chats"
    ON public.ai_chats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
    ON public.ai_chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
    ON public.ai_chats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
    ON public.ai_chats FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para ai_messages
CREATE POLICY "Users can view messages from their chats"
    ON public.ai_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.ai_chats 
        WHERE ai_chats.id = ai_messages.chat_id 
        AND ai_chats.user_id = auth.uid()
    ));

CREATE POLICY "Users can create messages in their chats"
    ON public.ai_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.ai_chats 
        WHERE ai_chats.id = ai_messages.chat_id 
        AND ai_chats.user_id = auth.uid()
    ));

-- =============================================================================
-- 5. GRANTS E PERMISSÕES
-- =============================================================================

-- Grants para authenticated users
GRANT ALL ON public.ai_chats TO authenticated;
GRANT ALL ON public.ai_messages TO authenticated;

-- =============================================================================
-- 6. FUNÇÃO PARA VERIFICAR INSTALAÇÃO
-- =============================================================================

CREATE OR REPLACE FUNCTION public.verify_ai_chat_installation()
RETURNS TABLE(
    component TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar tabelas
    RETURN QUERY
    SELECT 
        'AI Chat Tables' as component,
        CASE WHEN COUNT(*) = 2 THEN 'OK' ELSE 'ERROR' END as status,
        'Found ' || COUNT(*) || ' of 2 required tables' as details
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('ai_chats', 'ai_messages');
    
    -- Verificar índices
    RETURN QUERY
    SELECT 
        'AI Chat Indexes' as component,
        CASE WHEN COUNT(*) >= 6 THEN 'OK' ELSE 'WARNING' END as status,
        'Found ' || COUNT(*) || ' indexes' as details
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN ('ai_chats', 'ai_messages');
    
    -- Verificar policies
    RETURN QUERY
    SELECT 
        'AI Chat Policies' as component,
        CASE WHEN COUNT(*) >= 6 THEN 'OK' ELSE 'WARNING' END as status,
        'Found ' || COUNT(*) || ' policies' as details
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('ai_chats', 'ai_messages');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log da instalação
INSERT INTO public.auth_logs (event_type, success, metadata) VALUES (
    'ai_chat_setup', 
    true, 
    jsonb_build_object(
        'timestamp', NOW(),
        'version', '1.0.0',
        'components', 'ai_chat_module_complete'
    )
);

-- Verificar instalação
SELECT * FROM public.verify_ai_chat_installation();
