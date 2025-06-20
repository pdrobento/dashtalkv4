-- SQL para criação das tabelas do Kanban

-- Tabela de etapas/stages
CREATE TABLE IF NOT EXISTS stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Cor em formato hex
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação entre contatos e etapas
CREATE TABLE IF NOT EXISTS contact_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id VARCHAR(255) NOT NULL, -- ID do contato no Chatwoot
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garante que um contato está em apenas uma etapa por vez
    UNIQUE(contact_id)
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_stages_updated_at BEFORE UPDATE ON contact_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas etapas padrão
INSERT INTO stages (title, order_index, color) VALUES
    ('Lead Novo', 0, '#10B981'),
    ('Lead Contactado', 1, '#3B82F6'),
    ('Em Negociação', 2, '#F59E0B'),
    ('Fechado', 3, '#059669'),
    ('Perdido', 4, '#EF4444')
ON CONFLICT DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contact_stages_contact_id ON contact_stages(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_stages_stage_id ON contact_stages(stage_id);
CREATE INDEX IF NOT EXISTS idx_stages_order ON stages(order_index);
