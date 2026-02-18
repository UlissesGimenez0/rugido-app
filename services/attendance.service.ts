import { supabase } from "./supabase";

export async function registrarCheckIn(userId: string, workoutId?: string) {
  const today = new Date().toISOString().split('T')[0];

  // Verifica se o aluno já fez check-in hoje para não duplicar as bolinhas no calendário
  const { data: existente } = await supabase
    .from("attendance")
    .select("id")
    .eq("user_id", userId)
    .eq("checkin_date", today)
    .single();

  if (existente) return { message: "Já treinou hoje! 💪" };

  const { error } = await supabase
    .from("attendance")
    .insert({
      user_id: userId,
      workout_id: workoutId,
      checkin_date: today
    });

  if (error) throw error;
  return { message: "Check-in realizado!" };
}
// Busca todos os check-ins do dia de hoje
export async function getPresencasHoje() {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      profiles (name)
    `)
    .eq("checkin_date", today)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Busca o histórico geral agrupado por aluno (opcional para relatórios)
export async function getResumoFrequencia() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      attendance (checkin_date)
    `)
    .eq("role", "student");

  if (error) throw error;
  return data || [];
}