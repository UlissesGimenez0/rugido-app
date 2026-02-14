import { supabase } from "./supabase";

export async function getProfessores() {
  const { data, error } = await supabase.functions.invoke(
    "list-professores"
  );

  const { data: sessionData } = await supabase.auth.getSession();
  console.log("SESSION:", sessionData);

  if (error) {
    console.error("Erro ao listar professores:", error);
    throw error;
  }

  // 🔒 blindagem contra retorno string
  if (typeof data === "string") {
    return JSON.parse(data);
  }

  return data ?? [];
}


export async function deleteProfessor(userId: string) {
  const { data, error } = await supabase.functions.invoke(
    "delete-user",
    {
      body: { user_id: userId },
    }
  );

  if (error) {
    console.error("Erro ao deletar professor:", error);
    throw error;
  }

  return data;
}