# Setup do Dashtalk

Este documento explica como configurar o Dashtalk em um novo ambiente.

## 🚀 Configuração Rápida via Interface

### 1. Acesse a tela de setup

- Navegue para `/setup` no seu navegador
- Ou clique em "Setup" no menu lateral (se estiver logado)

### 2. Configure as abas sequencialmente

#### **Plataforma**

- Nome da plataforma (ex: "Minha Empresa Chat")
- URL do favicon (opcional)

#### **Supabase**

- URL do projeto: `https://seu-projeto.supabase.co`
- Chave anônima (anon key): encontre no painel do Supabase
- **Teste a conexão** antes de prosseguir
- **Configure o banco** (executa SQL automaticamente)

#### **OpenAI**

- Chave API da OpenAI: `sk-admin-...`
- ID do projeto OpenAI: `proj_...`

#### **Chatwoot**

- Endpoint da API: `https://seu-chatwoot.com/api/v1/accounts/1/conversations`
- Chave da API
- **Teste a conexão** antes de prosseguir

### 3. Gere o arquivo .env

- Clique em "Gerar Arquivo .env"
- Substitua o arquivo `.env` na raiz do projeto
- Reinicie a aplicação

## 🔧 Configuração Manual

### 1. Crie o arquivo .env

```bash
# Configurações da Plataforma
VITE_PLATAFORM_NAME=Seu Nome Aqui
VITE_PLATAFORM_FAVICON=https://cdn-icons-png.flaticon.com/512/229/229800.png

# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# OpenAI Configuration
VITE_OPENAI_ADMIN_KEY=sua_chave_openai_aqui
VITE_OPENAI_CLIENTE_PROJECT_ID=seu_projeto_id_aqui

# Chatwoot API Configuration
VITE_CHATWOOT_API_ENDPOINT=https://seu-chatwoot.com/api/v1/accounts/1/conversations
VITE_CHATWOOT_API_KEY=sua_chave_chatwoot_aqui
```

### 2. Configure o banco de dados Supabase

Execute o arquivo `setup-database.sql` no SQL Editor do Supabase:

1. Acesse o painel do Supabase
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `setup-database.sql`
4. Execute o script

### 3. Configure Auth no Supabase

No painel do Supabase, vá em Authentication > Settings:

- **Site URL**: `http://localhost:5173` (desenvolvimento) ou sua URL de produção
- **Redirect URLs**: adicione as URLs permitidas
- Configure providers OAuth se necessário (Google, etc.)

## 📋 Checklist de Instalação

### Pré-requisitos

- [ ] Projeto Supabase criado
- [ ] Conta OpenAI com API key
- [ ] Instância Chatwoot configurada
- [ ] Node.js instalado

### Configuração

- [ ] Arquivo `.env` criado e configurado
- [ ] Script SQL executado no Supabase
- [ ] Auth providers configurados
- [ ] Teste de conexões realizado

### Verificação

- [ ] Login funciona corretamente
- [ ] Dashboard carrega sem erros
- [ ] Chat conecta com Chatwoot
- [ ] IA responde no chat de gestão

## 🔍 Solução de Problemas

### Erro de conexão Supabase

- Verifique se a URL está correta
- Confirme se a chave anônima é válida
- Verifique se o projeto está ativo

### Erro de conexão Chatwoot

- Confirme se o endpoint está acessível
- Verifique se a chave API tem permissões corretas
- Teste manualmente com curl/Postman

### Erro de IA

- Verifique se a chave OpenAI é válida
- Confirme se há créditos na conta
- Verifique se o projeto ID está correto

## 🛠️ Scripts Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do console do navegador
2. Confirme se todas as variáveis de ambiente estão definidas
3. Execute o verificador de setup: `/setup`
4. Consulte a documentação do Supabase, OpenAI e Chatwoot

---

**Dica**: Mantenha suas chaves de API seguras e nunca as compartilhe publicamente!
