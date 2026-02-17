import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfessorDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    const executeSignOut = async () => {
      await supabase.auth.signOut();
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
      { text: "Sair", style: "destructive", onPress: executeSignOut },
    ]);
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(" ")[0]}</Text>
            <Text style={styles.title}>Painel do Professor</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Feather name="log-out" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* BOTÃO ALUNOS */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/teacher/alunos")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "rgba(255, 0, 94, 0.15)" }]}>
            <Feather name="users" size={26} color="#FF005E" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Meus Alunos</Text>
            <Text style={styles.cardSubtitle}>Gerir treinos e acompanhamento</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#555" style={{ marginLeft: "auto" }} />
        </TouchableOpacity>

        {/* BOTÃO BIBLIOTECA (Preparado para o próximo passo) */}
     {/* BOTÃO BIBLIOTECA */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/teacher/biblioteca")} 
        >
          <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
            <Feather name="book-open" size={26} color="#00E676" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Biblioteca de Treinos</Text>
            <Text style={styles.cardSubtitle}>Modelos prontos para clonar</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#555" style={{ marginLeft: "auto" }} />
        </TouchableOpacity> 

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
    marginBottom: 35,
  },
  greeting: { color: "#aaa", fontSize: 16, marginBottom: 4 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  logoutButton: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  cardSubtitle: { color: "#aaa", fontSize: 13 },
});