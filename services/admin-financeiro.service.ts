import { supabase } from "./supabase";

export async function getTodosPagamentos() {
  const { data, error } = await supabase
    .from("payments")
    .select(`*, profiles (name)`)
    .order("due_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAlunosParaCobranca() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "student")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function criarCobranca(userId: string, amount: number, dueDate: string, referenceMonth: string) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      amount: amount,
      due_date: dueDate,
      reference_month: referenceMonth,
      status: "pendente",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// 4. Marca uma cobrança como PAGA (Versão Faladora)
export async function marcarComoPago(paymentId: string) {
  const today = new Date().toISOString().split("T")[0]; 

  const { data, error } = await supabase
    .from("payments")
    .update({
      status: "pago",
      payment_date: today,
    })
    .eq("id", paymentId)
    .select(); 

  // Se o Supabase deitar erro, ele grita aqui:
  if (error) throw new Error("Erro Supabase: " + error.message);
  
  // Se o Supabase fingir que não viu a fatura, ele grita aqui:
  if (!data || data.length === 0) throw new Error("A fatura não foi encontrada no banco de dados.");
  
  return data[0];
}
// 5. O Botão Mágico: Chama a função do banco para gerar para TODOS os alunos de uma vez
export async function gerarMensalidadesEmMassa() {
  // O .rpc() serve para acionar funções (procedures) gravadas direto no Supabase
  const { data, error } = await supabase.rpc("gerar_mensalidades_automaticas");
  
  if (error) throw new Error(error.message);
  return data;
}