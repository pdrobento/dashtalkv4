-- =============================================================================
-- DASHTALK AUTH MODULE - COMPLETE SETUP
-- =============================================================================
-- Este script provisiona todas as tabelas, funções e policies necessárias
-- para o sistema de autenticação do Dashtalk em novos clientes
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABELAS CUSTOMIZADAS
-- =============================================================================

-- Tabela de perfis de usuário (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'agent', 'user')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessions customizadas (opcional - para tracking adicional)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de autenticação
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'signup', 'password_reset', 'email_change')),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON public.auth_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);

-- =============================================================================
-- 3. FUNÇÕES AUXILIARES
-- =============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Log do evento de signup
    INSERT INTO public.auth_logs (user_id, event_type, metadata)
    VALUES (NEW.id, 'signup', jsonb_build_object(
        'email', NEW.email,
        'provider', COALESCE(NEW.app_metadata->>'provider', 'email')
    ));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar permissões de usuário
CREATE OR REPLACE FUNCTION public.check_user_permission(
    user_uuid UUID,
    required_role TEXT DEFAULT 'user'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_uuid AND status = 'active';
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Hierarquia de roles (maior número = mais permissões)
    role_hierarchy := CASE user_role
        WHEN 'admin' THEN 4
        WHEN 'manager' THEN 3
        WHEN 'agent' THEN 2
        WHEN 'user' THEN 1
        ELSE 0
    END;
    
    required_hierarchy := CASE required_role
        WHEN 'admin' THEN 4
        WHEN 'manager' THEN 3
        WHEN 'agent' THEN 2
        WHEN 'user' THEN 1
        ELSE 0
    END;
    
    RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 4. TRIGGERS
-- =============================================================================

-- Trigger para atualizar updated_at nas tabelas relevantes
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_system_settings
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES PARA PROFILES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.check_user_permission(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.check_user_permission(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
    ON public.profiles FOR DELETE
    USING (public.check_user_permission(auth.uid(), 'admin'));

-- POLICIES PARA USER_SESSIONS
CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON public.user_sessions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
    ON public.user_sessions FOR ALL
    USING (public.check_user_permission(auth.uid(), 'admin'));

-- POLICIES PARA AUTH_LOGS
CREATE POLICY "Users can view their own auth logs"
    ON public.auth_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all auth logs"
    ON public.auth_logs FOR SELECT
    USING (public.check_user_permission(auth.uid(), 'admin'));

CREATE POLICY "System can insert auth logs"
    ON public.auth_logs FOR INSERT
    WITH CHECK (true);

-- POLICIES PARA SYSTEM_SETTINGS
CREATE POLICY "Public settings are readable by authenticated users"
    ON public.system_settings FOR SELECT
    USING (auth.role() = 'authenticated' AND is_public = true);

CREATE POLICY "Admins can manage all system settings"
    ON public.system_settings FOR ALL
    USING (public.check_user_permission(auth.uid(), 'admin'));

-- =============================================================================
-- 6. CONFIGURAÇÕES INICIAIS DO SISTEMA
-- =============================================================================

-- Inserir configurações padrão
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
    ('app_name', '"Dashtalk"', 'Nome da aplicação', 'general', true),
    ('app_version', '"1.0.0"', 'Versão da aplicação', 'general', true),
    ('maintenance_mode', 'false', 'Modo de manutenção', 'general', false),
    ('allow_registration', 'true', 'Permitir novos registros', 'auth', false),
    ('require_email_verification', 'true', 'Exigir verificação de email', 'auth', false),
    ('session_timeout', '7200', 'Timeout da sessão em segundos', 'auth', false),
    ('max_login_attempts', '5', 'Máximo de tentativas de login', 'auth', false),
    ('password_min_length', '8', 'Tamanho mínimo da senha', 'auth', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 7. VIEWS ÚTEIS
-- =============================================================================

-- View para estatísticas de usuários
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_users,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE role = 'manager') as manager_users,
    COUNT(*) FILTER (WHERE role = 'agent') as agent_users,
    COUNT(*) FILTER (WHERE role = 'user') as regular_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as users_last_30_days,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as users_last_7_days
FROM public.profiles;

-- =============================================================================
-- 8. GRANTS E PERMISSÕES
-- =============================================================================

-- Grants para authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT SELECT, INSERT ON public.auth_logs TO authenticated;
GRANT SELECT ON public.system_settings TO authenticated;
GRANT SELECT ON public.user_stats TO authenticated;

-- Grants para anonymous users (caso necessário)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.system_settings TO anon;

-- =============================================================================
-- FINALIZAÇÃO
-- =============================================================================

-- Função para verificar se a instalação está completa
CREATE OR REPLACE FUNCTION public.verify_auth_installation()
RETURNS TABLE(
    component TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar tabelas
    RETURN QUERY
    SELECT 
        'Tables' as component,
        CASE WHEN COUNT(*) = 4 THEN 'OK' ELSE 'ERROR' END as status,
        'Found ' || COUNT(*) || ' of 4 required tables' as details
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'user_sessions', 'auth_logs', 'system_settings');
    
    -- Verificar funções
    RETURN QUERY
    SELECT 
        'Functions' as component,
        CASE WHEN COUNT(*) >= 4 THEN 'OK' ELSE 'ERROR' END as status,
        'Found ' || COUNT(*) || ' functions' as details
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('handle_updated_at', 'handle_new_user', 'cleanup_expired_sessions', 'check_user_permission');
    
    -- Verificar policies
    RETURN QUERY
    SELECT 
        'Policies' as component,
        CASE WHEN COUNT(*) >= 10 THEN 'OK' ELSE 'WARNING' END as status,
        'Found ' || COUNT(*) || ' policies' as details
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Verificar configurações
    RETURN QUERY
    SELECT 
        'Settings' as component,
        CASE WHEN COUNT(*) >= 8 THEN 'OK' ELSE 'WARNING' END as status,
        'Found ' || COUNT(*) || ' system settings' as details
    FROM public.system_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log da instalação
INSERT INTO public.auth_logs (event_type, success, metadata) VALUES (
    'system_setup', 
    true, 
    jsonb_build_object(
        'timestamp', NOW(),
        'version', '1.0.0',
        'components', 'auth_module_complete'
    )
);

-- Verificar instalação
SELECT * FROM public.verify_auth_installation();
