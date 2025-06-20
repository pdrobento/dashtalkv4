-- Criação da tabela attendants para integração com n8n
-- Este script deve ser executado no SQL Editor do Supabase

-- 1. Criar a tabela attendants
CREATE TABLE public.attendants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    n8n_id TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Comentários para documentação
COMMENT ON TABLE public.attendants IS 'Tabela para armazenar dados de atendentes integrados ao n8n';
COMMENT ON COLUMN public.attendants.id IS 'UUID único do atendente (chave primária)';
COMMENT ON COLUMN public.attendants.name IS 'Nome do atendente';
COMMENT ON COLUMN public.attendants.n8n_id IS 'ID único do atendente no sistema n8n';
COMMENT ON COLUMN public.attendants.active IS 'Indica se o atendente está ativo (true) ou inativo (false)';
COMMENT ON COLUMN public.attendants.created_at IS 'Timestamp de criação do registro';
COMMENT ON COLUMN public.attendants.updated_at IS 'Timestamp da última modificação (atualizado automaticamente)';

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para atualizar updated_at
CREATE TRIGGER update_attendants_updated_at
    BEFORE UPDATE ON public.attendants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Índices para performance
-- Índice para busca por n8n_id (já é único, mas pode ser útil para queries)
CREATE INDEX IF NOT EXISTS idx_attendants_n8n_id ON public.attendants(n8n_id);

-- Índice para busca por status ativo
CREATE INDEX IF NOT EXISTS idx_attendants_active ON public.attendants(active);

-- Índice para busca por nome (útil para filtros e ordenação)
CREATE INDEX IF NOT EXISTS idx_attendants_name ON public.attendants(name);

-- Índice composto para busca por atendentes ativos ordenados por nome
CREATE INDEX IF NOT EXISTS idx_attendants_active_name ON public.attendants(active, name);

-- 6. Políticas RLS (Row Level Security)
-- Habilitar RLS na tabela
ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;

-- Política para leitura - apenas usuários autenticados
CREATE POLICY "Usuários autenticados podem visualizar atendentes"
    ON public.attendants
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para inserção - apenas usuários autenticados
CREATE POLICY "Usuários autenticados podem criar atendentes"
    ON public.attendants
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para atualização - apenas usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar atendentes"
    ON public.attendants
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para exclusão - apenas usuários autenticados
CREATE POLICY "Usuários autenticados podem excluir atendentes"
    ON public.attendants
    FOR DELETE
    TO authenticated
    USING (true);

-- 7. Inserir alguns dados de exemplo (opcional - pode remover se não quiser)
INSERT INTO public.attendants (name, n8n_id, active) VALUES
    ('SophIA – Impulse', 'n8n_sophia_impulse_001', false),
    ('Emin - Marcel', 'n8n_emin_marcel_002', true),
    ('Laurinha', 'n8n_laurinha_003', false);

-- 8. Verificar se tudo foi criado corretamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'attendants';

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'attendants';
