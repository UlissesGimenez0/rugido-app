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