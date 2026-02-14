import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfessorAluno() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const router = useRouter();

  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchStudent = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setStudent(data);
    };

    fetchStudent();
  }, [id]);

  if (!student) return null;

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{student.name}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/teacher/aluno/[id]/criar-treino",
              params: { id },
            })
          }
        >
          <Text style={styles.buttonText}>Criar Treino</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF005E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
