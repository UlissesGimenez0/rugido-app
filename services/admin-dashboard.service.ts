import { supabase } from "./supabase";

export async function getAdminStats() {
  const { data, error } = await supabase.functions.invoke("dashboard-stats");

  if (error) {
    console.error("Erro ao buscar stats do dashboard:", error);
    return null;
  }

  if (typeof data === "string") {
    return JSON.parse(data);
  }

  return data;
}