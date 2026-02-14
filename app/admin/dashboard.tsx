import { Screen } from "@/components/Screen";
import { getAdminStats } from "@/services/admin-dashboard.service";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  console.log("ADMIN DASH USER:", user);

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user?.academy_id) return;

    const load = async () => {
      const data = await getAdminStats(user.academy_id);
      setStats(data);
    };

    load();
  }, [user]);

  if (!stats) return null;

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Painel da Academia</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Professores</Text>
          <Text style={styles.number}>{stats.totalProfessors}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alunos</Text>
          <Text style={styles.number}>{stats.totalStudents}</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.smallCard}>
            <Text style={styles.smallTitle}>Com Personal</Text>
            <Text style={styles.number}>{stats.withPersonal}</Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallTitle}>Sem Personal</Text>
            <Text style={styles.number}>{stats.withoutPersonal}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/admin/professores")}
        >
          <Text style={styles.buttonText}>Gerenciar Professores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/admin/alunos")}
        >
          <Text style={styles.buttonText}>Gerenciar Alunos</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  cardTitle: { color: "#aaa" },
  number: {
    color: "#FF005E",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 5,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 16,
    width: "48%",
  },
  smallTitle: { color: "#aaa" },
  button: {
    backgroundColor: "#FF005E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
