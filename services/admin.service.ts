import { supabase } from "./supabase";

export async function createUser({
  email,
  password,
  name,
  role,
  professor_id,
}: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "professor" | "student";
  professor_id?: string | null;
}) {
  const { data, error } = await supabase.functions.invoke(
    "create-user",
    {
      body: {
        email,
        password,
        name,
        role,
        professor_id,
      },
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
