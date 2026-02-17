import { Screen } from "@/components/Screen";
import { getAdminStats } from "@/services/admin-dashboard.service";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser)

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user?.academy_id) return;

    const load = async () => {
      const data = await getAdminStats();
      setStats(data);
    };

    load();
  }, [user]);
  

 const handleLogout = async () => {
    const executeSignOut = async () => {
      await supabase.auth.signOut();
      setUser(null); // <-- ADICIONE ISTO para limpar a memória do app!
      router.replace("/auth/login");
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Tem certeza que deseja terminar a sessão?")) {
        executeSignOut();
      }
      return;
    }

    Alert.alert("Sair", "Tem certeza que deseja terminar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: executeSignOut,
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(" ")[0]}</Text>
            <Text style={styles.title}>Painel da Academia</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Feather name="log-out" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {!stats ? (
          <Text style={styles.loadingText}>A carregar métricas...</Text>
        ) : (
          <>
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
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: "#aaa", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  cardTitle: { color: "#aaa", fontSize: 16 },
  number: {
    color: "#FF005E",
    fontSize: 32,
    fontWeight: "800",
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
  smallTitle: { color: "#aaa", fontSize: 14 },
  button: {
    backgroundColor: "#FF005E",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});