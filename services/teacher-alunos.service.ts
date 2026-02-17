import { supabase } from "./supabase";

// 1. Busca os alunos vinculados a este professor
export async function getMeusAlunos() {
  const { data, error } = await supabase.functions.invoke("list-meus-alunos");
  if (error) throw error;
  if (typeof data === "string") return JSON.parse(data);
  return data ?? [];
}

// 2. NOVA FUNÇÃO: Buscar Categorias
export async function getWorkoutTypes() {
  const { data, error } = await supabase.from("workout_types").select("*").order("name");
  if (error) throw error;
  return data || [];
}

// 3. ATUALIZADA: Busca todos os treinos com o nome da Categoria
export async function getTemplatesTreino() {
  const { data, error } = await supabase
    .from("workouts")
    .select(`*, workout_types(name)`)
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// 4. ATUALIZADA: Cria um novo Molde guardando a Categoria (typeId)
export async function createTemplateTreino(name: string, description: string, professorId: string, typeId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .insert({
      name,
      description,
      professor_id: professorId,
      user_id: null, 
      is_template: true, 
      workout_type_id: typeId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// 5. Clona um Molde para o aluno
export async function clonarTreinoParaAluno(templateId: string, studentId: string) {
  const { data, error } = await supabase.functions.invoke("clone-workout", {
    body: { templateId, studentId },
  });

  if (error) throw new Error(error.message);
  return data;
}