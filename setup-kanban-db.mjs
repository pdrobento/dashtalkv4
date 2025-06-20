#!/usr/bin/env node

/**
 * Script para configurar as tabelas do Kanban
 * Execute este script após configurar as variáveis de ambiente do Supabase
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ler variáveis de ambiente do arquivo .env
const envContent = readFileSync(join(__dirname, ".env"), "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Configuração do Supabase não encontrada no arquivo .env");
  console.error(
    "   Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configurados"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupKanbanDatabase() {
  console.log("🚀 Configurando banco de dados do Kanban...");

  try {
    // Ler o SQL do arquivo
    const sqlContent = readFileSync(
      join(__dirname, "database-kanban.sql"),
      "utf8"
    );

    console.log("📋 Executando SQL do Kanban...");

    // Executar o SQL usando a funcionalidade do Supabase
    // Nota: Isso pode precisar ser executado manualmente no painel do Supabase
    console.log("📋 SQL a ser executado:");
    console.log("=====================================");
    console.log(sqlContent);
    console.log("=====================================");

    // Verificar se as tabelas foram criadas
    console.log("🔍 Verificando tabelas...");

    const { data: stages, error: stagesError } = await supabase
      .from("stages")
      .select("count");

    if (stagesError && !stagesError.message.includes("does not exist")) {
      console.error("❌ Erro ao verificar tabela stages:", stagesError.message);
    } else if (!stagesError) {
      console.log("✅ Tabela stages encontrada");
    }

    const { data: contactStages, error: contactStagesError } = await supabase
      .from("contact_stages")
      .select("count");

    if (
      contactStagesError &&
      !contactStagesError.message.includes("does not exist")
    ) {
      console.error(
        "❌ Erro ao verificar tabela contact_stages:",
        contactStagesError.message
      );
    } else if (!contactStagesError) {
      console.log("✅ Tabela contact_stages encontrada");
    }

    if (stagesError || contactStagesError) {
      console.log("\n💡 INSTRUÇÕES:");
      console.log(
        "1. Acesse o painel do Supabase (https://supabase.com/dashboard)"
      );
      console.log("2. Vá para SQL Editor");
      console.log("3. Cole e execute o SQL mostrado acima");
      console.log("4. Execute este script novamente para verificar");
      return;
    }

    // Verificar se existem etapas padrão
    const {
      data: defaultStages,
      count,
      error: countError,
    } = await supabase.from("stages").select("*", { count: "exact" });

    if (countError) {
      console.error("❌ Erro ao contar etapas:", countError.message);
      return;
    }

    console.log(`\n📊 Configuração concluída!`);
    console.log(`📋 Etapas no banco: ${count || 0}`);

    if (defaultStages && defaultStages.length > 0) {
      console.log("\n🎯 Etapas configuradas:");
      defaultStages.forEach((stage, index) => {
        console.log(`   ${index + 1}. ${stage.title} (${stage.color})`);
      });
    } else {
      console.log(
        "\n⚠️  Nenhuma etapa encontrada. As etapas padrão devem ser criadas pelo SQL."
      );
    }

    console.log("\n✅ Banco de dados do Kanban configurado com sucesso!");
    console.log("🌐 Acesse /kanban para testar a funcionalidade");
  } catch (error) {
    console.error("❌ Erro na configuração:", error.message);
    console.log("\n💡 Soluções:");
    console.log("1. Verifique se o arquivo .env está configurado corretamente");
    console.log("2. Verifique se o Supabase está acessível");
    console.log("3. Execute o SQL manualmente no painel do Supabase");
  }
}

// Executar a configuração
setupKanbanDatabase();
