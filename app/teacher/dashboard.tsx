import { Screen } from "@/components/Screen";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfessorDashboard() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Painel do Professor</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/teacher/alunos")}
        >
          <Feather name="users" size={22} color="#fff" />
          <Text style={styles.cardText}>Meus Alunos</Text>
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
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
