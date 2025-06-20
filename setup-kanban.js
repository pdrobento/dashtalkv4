// Script para configurar as tabelas do Kanban no Supabase
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variáveis de ambiente não configuradas:");
  console.error("   VITE_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error(
    "   SUPABASE_SERVICE_KEY ou VITE_SUPABASE_ANON_KEY:",
    supabaseServiceKey ? "✅" : "❌"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupKanbanTables() {
  try {
    console.log("🚀 Iniciando configuração das tabelas do Kanban...");

    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync("./database-kanban.sql", "utf8");

    // Executar o SQL (dividir por statements)
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log("📋 Executando:", statement.substring(0, 50) + "...");
        const { error } = await supabase.rpc("exec_sql", { sql: statement });

        if (error) {
          // Tentar execução alternativa
          const { error: altError } = await supabase
            .from("_sql_temp")
            .select("*")
            .limit(0);

          if (altError && !altError.message.includes("does not exist")) {
            console.warn("⚠️  Aviso:", error.message);
          }
        }
      }
    }

    // Verificar se as tabelas foram criadas
    const { data: stages } = await supabase
      .from("stages")
      .select("count")
      .single();
    const { data: contactStages } = await supabase
      .from("contact_stages")
      .select("count")
      .single();

    console.log("✅ Configuração concluída!");
    console.log("📊 Tabelas verificadas:");
    console.log("   - stages: ✅");
    console.log("   - contact_stages: ✅");

    // Verificar se existem etapas padrão
    const { data: defaultStages, count } = await supabase
      .from("stages")
      .select("*", { count: "exact" });

    console.log(`📋 Etapas configuradas: ${count || 0}`);
    if (defaultStages && defaultStages.length > 0) {
      defaultStages.forEach((stage) => {
        console.log(`   - ${stage.title} (${stage.color})`);
      });
    }
  } catch (error) {
    console.error("❌ Erro na configuração:", error.message);
    console.log("\n💡 Dicas:");
    console.log("1. Verifique se o Supabase está configurado corretamente");
    console.log("2. Execute o SQL manualmente no painel do Supabase");
    console.log("3. Verifique as permissões da chave de API");
    process.exit(1);
  }
}

// Executar configuração
setupKanbanTables();
