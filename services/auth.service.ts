import { supabase } from "./supabase";

export async function getProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (error) {
    console.error("Erro ao buscar profile:", error);
    return null;
  }

  return data;
}
