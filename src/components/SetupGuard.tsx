import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetupCheck } from "@/hooks/useSetupCheck";

interface SetupGuardProps {
  children: React.ReactNode;
}

export const SetupGuard: React.FC<SetupGuardProps> = ({ children }) => {
  const { needsSetup, isChecking } = useSetupCheck();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isChecking && needsSetup && location.pathname !== "/setup") {
      navigate("/setup");
    }
  }, [needsSetup, isChecking, navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#18181A] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verificando configuração...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
