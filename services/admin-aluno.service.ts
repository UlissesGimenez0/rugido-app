import { supabase } from "./supabase";

export async function getAlunos() {
  const { data, error } = await supabase.functions.invoke("list-alunos");

  if (error) {
    console.error("Erro ao listar alunos:", error);
    throw error;
  }

  if (typeof data === "string") {
    return JSON.parse(data);
  }

  return data ?? [];
}