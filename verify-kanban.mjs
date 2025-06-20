// Arquivo de teste para verificar as rotas do Kanban
// Execute este arquivo para verificar se tudo está configurado corretamente

import { resolve } from "path";
import { readFileSync } from "fs";

const projectRoot = resolve(".");

console.log("🔍 Verificando configuração do Kanban...\n");

// 1. Verificar se o arquivo de rotas contém a rota do Kanban
try {
  const appContent = readFileSync(resolve(projectRoot, "src/App.tsx"), "utf8");
  if (appContent.includes("/kanban") && appContent.includes("KanbanPage")) {
    console.log("✅ Rota /kanban configurada em App.tsx");
  } else {
    console.log("❌ Rota /kanban NÃO encontrada em App.tsx");
  }
} catch (error) {
  console.log("❌ Erro ao ler App.tsx:", error.message);
}

// 2. Verificar se o componente Kanban existe
try {
  const kanbanContent = readFileSync(
    resolve(projectRoot, "src/pages/Kanban.tsx"),
    "utf8"
  );
  if (kanbanContent.includes("export default function KanbanPage")) {
    console.log("✅ Componente KanbanPage encontrado");
  } else {
    console.log("❌ Componente KanbanPage com problemas");
  }
} catch (error) {
  console.log("❌ Arquivo Kanban.tsx não encontrado:", error.message);
}

// 3. Verificar se o hook useKanban existe
try {
  const hookContent = readFileSync(
    resolve(projectRoot, "src/hooks/useKanban.ts"),
    "utf8"
  );
  if (hookContent.includes("export const useKanban")) {
    console.log("✅ Hook useKanban encontrado");
  } else {
    console.log("❌ Hook useKanban com problemas");
  }
} catch (error) {
  console.log("❌ Hook useKanban não encontrado:", error.message);
}

// 4. Verificar se os serviços existem
try {
  const serviceContent = readFileSync(
    resolve(projectRoot, "src/services/kanbanService.ts"),
    "utf8"
  );
  if (
    serviceContent.includes("chatwootService") &&
    serviceContent.includes("stageService")
  ) {
    console.log("✅ Serviços do Kanban encontrados");
  } else {
    console.log("❌ Serviços do Kanban com problemas");
  }
} catch (error) {
  console.log("❌ Serviços do Kanban não encontrados:", error.message);
}

// 5. Verificar se os tipos existem
try {
  const typesContent = readFileSync(
    resolve(projectRoot, "src/types/kanban.ts"),
    "utf8"
  );
  if (
    typesContent.includes("ChatwootContact") &&
    typesContent.includes("Stage")
  ) {
    console.log("✅ Types do Kanban encontrados");
  } else {
    console.log("❌ Types do Kanban com problemas");
  }
} catch (error) {
  console.log("❌ Types do Kanban não encontrados:", error.message);
}

// 6. Verificar se react-trello está instalado
try {
  const packageContent = readFileSync(
    resolve(projectRoot, "package.json"),
    "utf8"
  );
  if (packageContent.includes("react-trello")) {
    console.log("✅ react-trello instalado");
  } else {
    console.log("❌ react-trello NÃO instalado");
  }
} catch (error) {
  console.log("❌ Erro ao ler package.json:", error.message);
}

// 7. Verificar sidebar
try {
  const sidebarContent = readFileSync(
    resolve(projectRoot, "src/components/ZattenSidebar.tsx"),
    "utf8"
  );
  if (sidebarContent.includes("/kanban")) {
    console.log("✅ Link do Kanban encontrado na sidebar");
  } else {
    console.log("❌ Link do Kanban NÃO encontrado na sidebar");
  }
} catch (error) {
  console.log("❌ Erro ao ler ZattenSidebar.tsx:", error.message);
}

console.log("\n📋 Verificação concluída!");
console.log("\n💡 Próximos passos:");
console.log("1. Execute `npm run dev` para iniciar o servidor");
console.log("2. Acesse http://localhost:8080/kanban");
console.log(
  "3. Configure as tabelas do banco executando o SQL em database-kanban.sql"
);
console.log("4. Configure as variáveis de ambiente do Chatwoot no .env");
