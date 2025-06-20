import { useState, useEffect } from "react";

export const useSetupCheck = () => {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSetupStatus = () => {
      // Verificar se as variáveis essenciais existem
      const requiredVars = [
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        import.meta.env.VITE_CHATWOOT_API_ENDPOINT,
        import.meta.env.VITE_CHATWOOT_API_KEY,
      ];

      const hasAllRequired = requiredVars.every(
        (variable) => variable && variable.trim() !== ""
      );

      setNeedsSetup(!hasAllRequired);
      setIsChecking(false);
    };

    checkSetupStatus();
  }, []);

  return { needsSetup, isChecking };
};
