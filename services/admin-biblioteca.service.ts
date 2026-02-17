import { supabase } from "./supabase";

export async function getTodosAlunos() {
  const { data, error } = await supabase.from("profiles").select("id, name").eq("role", "student").order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

// 1. NOVA FUNÇÃO: Buscar Categorias
export async function getWorkoutTypes() {
  const { data, error } = await supabase.from("workout_types").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function getTemplatesTreinoAdmin() {
  const { data, error } = await supabase.from("workouts").select(`*, workout_types(name)`).eq("is_template", true).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// 2. ATUALIZADA: Agora recebe o typeId
export async function createTemplateTreinoAdmin(name: string, description: string, adminId: string, typeId: string) {
  const { data, error } = await supabase.from("workouts").insert({
    name,
    description,
    professor_id: adminId,
    user_id: null,
    is_template: true,
    workout_type_id: typeId, // Guarda a categoria na base de dados
  }).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function clonarTreinoAdmin(templateId: string, studentId: string) {
  const { data, error } = await supabase.functions.invoke("clone-workout", { body: { templateId, studentId } });
  if (error) throw new Error(error.message);
  return data;
}