import { supabase } from "./supabase";

export async function getAdminStats(academyId: string) {
  const { data: professors } = await supabase
    .from("profiles")
    .select("id")
    .eq("academy_id", academyId)
    .eq("role", "professor");

  const { data: students } = await supabase
    .from("profiles")
    .select("id, professor_id")
    .eq("academy_id", academyId)
    .eq("role", "student");

  const totalProfessors = professors?.length || 0;
  const totalStudents = students?.length || 0;

  const withPersonal =
    students?.filter((s) => s.professor_id !== null).length || 0;

  const withoutPersonal =
    students?.filter((s) => s.professor_id === null).length || 0;

  return {
    totalProfessors,
    totalStudents,
    withPersonal,
    withoutPersonal,
  };
}
