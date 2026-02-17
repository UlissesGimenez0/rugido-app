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

// services/admin-professores.service.ts

export async function deleteProfessor(id: string) {
  console.log("DELETE CHAMADO:", id);

  const { data, error } = await supabase.functions.invoke(
    "delete-user",
    {
      body: { userId: id }, // <-- Alterado de user_id para userId
    }
  );

  console.log("DELETE RESPONSE:", data, error);

  if (error) {
    throw error;
  }

  return data;
}
