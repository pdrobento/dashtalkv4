import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Attendant {
  id: string;
  name: string;
  n8n_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAttendantData {
  name: string;
  n8nId: string;
}

export function useAttendants() {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch all attendants
  const fetchAttendants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("attendants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAttendants(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar atendentes";
      setError(errorMessage);
      console.error("Erro ao buscar atendentes:", err);
    } finally {
      setLoading(false);
    }
  };
  // Create new attendant
  const createAttendant = async (attendantData: CreateAttendantData) => {
    try {
      setError(null);

      // Check if n8n_id already exists
      const { data: existingAttendant, error: checkError } = await supabase
        .from("attendants")
        .select("n8n_id")
        .eq("n8n_id", attendantData.n8nId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingAttendant) {
        throw new Error("Já existe um atendente com este ID do n8n");
      }

      const { data, error } = await supabase
        .from("attendants")
        .insert([
          {
            name: attendantData.name,
            n8n_id: attendantData.n8nId,
            active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAttendants((prev) => [data, ...prev]);

      return { success: true, data };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar atendente";
      setError(errorMessage);
      console.error("Erro ao criar atendente:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Delete attendant
  const deleteAttendant = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase.from("attendants").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      setAttendants((prev) => prev.filter((attendant) => attendant.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao excluir atendente";
      setError(errorMessage);
      console.error("Erro ao excluir atendente:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Update attendant status
  const updateAttendantStatus = async (id: string, active: boolean) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("attendants")
        .update({ active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAttendants((prev) =>
        prev.map((attendant) =>
          attendant.id === id ? { ...attendant, active } : attendant
        )
      );

      return { success: true, data };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar status";
      setError(errorMessage);
      console.error("Erro ao atualizar status:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Update attendant data
  const updateAttendant = async (
    id: string,
    data: { name: string; n8n_id: string }
  ) => {
    try {
      setError(null);

      const { data: updatedData, error } = await supabase
        .from("attendants")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAttendants((prev) =>
        prev.map((attendant) => (attendant.id === id ? updatedData : attendant))
      );

      return { success: true, data: updatedData };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar atendente";
      setError(errorMessage);
      console.error("Erro ao atualizar atendente:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Load attendants on mount
  useEffect(() => {
    fetchAttendants();
  }, []);

  return {
    attendants,
    loading,
    error,
    fetchAttendants,
    createAttendant,
    deleteAttendant,
    updateAttendantStatus,
    updateAttendant,
  };
}
