import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithPassword: (params: {
    email: string;
    password: string;
  }) => Promise<{ error: Error | null }>;
  signUp: typeof supabase.auth.signUp;
  signOut: typeof supabase.auth.signOut;
  signInWithOAuth: typeof supabase.auth.signInWithOAuth;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializa a sessão atual ao carregar o componente
    const initializeAuth = async () => {
      setIsLoading(true);

      // Verificar se já existe uma sessão
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      // Configurar o listener para mudanças na autenticação
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
      });

      setIsLoading(false);

      // Limpar o listener ao desmontar o componente
      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  // Wrapper para signInWithPassword para garantir consistência e evitar erros
  const signInWithPasswordWrapper = async (params: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await supabase.auth.signInWithPassword(params);
      return {
        ...response,
        error: response.error,
      };
    } catch (error) {
      console.error("Error in signInWithPassword:", error);
      return { error: error as Error };
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signInWithPassword: signInWithPasswordWrapper,
    signUp: supabase.auth.signUp,
    signOut: supabase.auth.signOut,
    signInWithOAuth: supabase.auth.signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
