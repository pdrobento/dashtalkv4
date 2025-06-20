import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";

document.title = `${import.meta.env.VITE_PLATAFORM_NAME} - Dashboard`;
document
  .querySelector('meta[name="author"]')
  .setAttribute("content", import.meta.env.VITE_PLATAFORM_NAME);
document
  .querySelector('meta[name="description"]')
  .setAttribute(
    "content",
    `${import.meta.env.VITE_PLATAFORM_NAME} - Sistema de Gestão de Atendimentos`
  );

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
