// services/teacher.service.ts
import { supabase } from "./supabase";

// 1. Busca os alunos vinculados a este professor
export async function getMeusAlunos() {
  const { data, error } = await supabase.functions.invoke("list-meus-alunos");

  if (error) {
    console.error("Erro ao listar alunos do professor:", error);
    throw error;
  }

  if (typeof data === "string") {
    return JSON.parse(data);
  }

  return data ?? [];
}

// 2. Busca todos os treinos que são Modelos (Templates da Biblioteca)
export async function getTemplatesTreino() {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar biblioteca de treinos:", error);
    throw error;
  }

  return data ?? [];
}

// 3. Cria um novo Molde na Biblioteca
export async function createTemplateTreino(name: string, description: string, professorId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .insert({
      name,
      description,
      professor_id: professorId,
      user_id: null, // Templates não têm um aluno específico
      is_template: true, // Marca como modelo
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// 4. Clona um Molde e os seus exercícios para um aluno (Usando a Edge Function)
export async function clonarTreinoParaAluno(templateId: string, studentId: string) {
  const { data, error } = await supabase.functions.invoke("clone-workout", {
    body: { templateId, studentId },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}