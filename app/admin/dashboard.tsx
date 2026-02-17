import { Screen } from "@/components/Screen";
import { getAdminStats } from "@/services/admin-dashboard.service";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

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
      setUser(null); // Limpa a memória do app
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
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
            {/* --- MÉTRICAS (ESTATÍSTICAS) --- */}
            <View style={styles.statsGrid}>
              <View style={styles.statCardFull}>
                <View style={styles.statHeader}>
                  <Feather name="users" size={20} color="#00E676" />
                  <Text style={styles.statCardTitle}>Total de Alunos</Text>
                </View>
                <Text style={styles.number}>{stats.totalStudents}</Text>
              </View>

              <View style={styles.statCardFull}>
                <View style={styles.statHeader}>
                  <Feather name="briefcase" size={20} color="#FF005E" />
                  <Text style={styles.statCardTitle}>Total de Professores</Text>
                </View>
                <Text style={styles.number}>{stats.totalProfessors}</Text>
              </View>

              <View style={styles.cardRow}>
                <View style={styles.smallCard}>
                  <Text style={styles.smallTitle}>Com Personal</Text>
                  <Text style={styles.numberSmall}>{stats.withPersonal}</Text>
                </View>

                <View style={styles.smallCard}>
                  <Text style={styles.smallTitle}>Sem Personal</Text>
                  <Text style={styles.numberSmall}>{stats.withoutPersonal}</Text>
                </View>
              </View>
            </View>

            {/* --- MENU DE GESTÃO RÁPIDA --- */}
            <Text style={styles.sectionTitle}>Gestão e Ações</Text>

            {/* BOTÃO PROFESSORES */}
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/professores")}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(255, 0, 94, 0.15)" }]}>
                <Feather name="briefcase" size={24} color="#FF005E" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Gerenciar Professores</Text>
                <Text style={styles.actionSubtitle}>Adicionar ou remover equipe</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#555" />
            </TouchableOpacity>

            {/* BOTÃO ALUNOS */}
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/alunos")}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
                <Feather name="users" size={24} color="#00E676" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Gerenciar Alunos</Text>
                <Text style={styles.actionSubtitle}>Matrículas e vinculações</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#555" />
            </TouchableOpacity>

            {/* BOTÃO BIBLIOTECA ADMIN */}
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/biblioteca")}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                <Feather name="book-open" size={24} color="#007AFF" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Biblioteca de Treinos</Text>
                <Text style={styles.actionSubtitle}>Prescrever para qualquer aluno</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#555" />
            </TouchableOpacity>

            {/* BOTÃO FINANCEIRO */}
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/financeiro")}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(255, 193, 7, 0.15)" }]}>
                <Feather name="dollar-sign" size={24} color="#FFC107" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Financeiro</Text>
                <Text style={styles.actionSubtitle}>Mensalidades e cobranças</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#555" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40, paddingTop: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  greeting: { color: "#aaa", fontSize: 16, marginBottom: 4 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  logoutButton: { backgroundColor: "rgba(255, 59, 48, 0.15)", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#aaa", textAlign: "center", marginTop: 40 },

  // --- ÁREA DE ESTATÍSTICAS ---
  statsGrid: { marginBottom: 35 },
  statCardFull: { backgroundColor: "rgba(255,255,255,0.06)", padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  statHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  statCardTitle: { color: "#aaa", fontSize: 15, marginLeft: 8, fontWeight: "600" },
  number: { color: "#fff", fontSize: 36, fontWeight: "800" },
  
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  smallCard: { backgroundColor: "rgba(255,255,255,0.06)", padding: 18, borderRadius: 20, width: "48%", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  smallTitle: { color: "#aaa", fontSize: 13, marginBottom: 6 },
  numberSmall: { color: "#fff", fontSize: 24, fontWeight: "800" },

  // --- ÁREA DE AÇÕES ---
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 15 },
  
  actionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 20, marginBottom: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  actionTextContainer: { flex: 1, marginLeft: 15 },
  actionTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  actionSubtitle: { color: "#aaa", fontSize: 13, marginTop: 2 },
});