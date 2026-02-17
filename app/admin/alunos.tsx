import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { getAlunos } from "@/services/admin-aluno.service";
import { getProfessores } from "@/services/admin-professores.service";
import { deleteUser } from "@/services/admin.service";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Alunos() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [alunos, setAlunos] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o Modal de Exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!user?.academy_id) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Busca alunos e professores em paralelo para ser mais rápido
      const [alunosData, profsData] = await Promise.all([
        getAlunos(),
        getProfessores()
      ]);
      setAlunos(alunosData);
      setProfessores(Array.isArray(profsData) ? profsData : []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id: string, name: string) => {
    setAlunoToDelete({ id, name });
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    if (!alunoToDelete) return;
    
    setAlertVisible(false);
    setDeletingId(alunoToDelete.id);

    try {
      // Usamos o deleteUser genérico do admin.service
      await deleteUser(alunoToDelete.id);
      setAlunos((prev) => prev.filter((aluno) => aluno.id !== alunoToDelete.id));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir aluno.");
    } finally {
      setDeletingId(null);
      setAlunoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setAlertVisible(false);
    setAlunoToDelete(null);
  };

  // Função auxiliar para encontrar o nome do professor do aluno
  const getProfessorName = (professorId: string | null) => {
    if (!professorId) return "Sem Personal";
    const prof = professores.find((p) => p.id === professorId);
    return prof ? `Prof. ${prof.name}` : "Professor não encontrado";
  };

  if (!user || loading) {
    return (
      <Screen>
        <ActivityIndicator color="#FF005E" size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alunos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/admin/criar-aluno")}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={alunos}
        keyExtractor={(item, index) => (item?.id ? item.id : `aluno-${index}`)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.infoContainer}>
                <View style={[styles.avatarPlaceholder, !item.professor_id && styles.avatarPlaceholderNoProf]}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={[styles.role, !item.professor_id && { color: "#FF9F0A" }]}>
                    {getProfessorName(item.professor_id)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => requestDelete(item.id, item.name)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator color="#FF3B30" size="small" />
                ) : (
                  <Text style={styles.deleteText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum aluno encontrado.</Text>
        }
      />

      {/* MODAL DE CONFIRMAÇÃO ESTILIZADO */}
      <Modal visible={alertVisible} transparent animationType="fade" onRequestClose={cancelDelete}>
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 32 }}>⚠️</Text>
            </View>
            <Text style={styles.alertTitle}>Excluir Aluno</Text>
            <Text style={styles.alertMessage}>
              Tem certeza que deseja remover <Text style={styles.alertHighlight}>{alunoToDelete?.name}</Text>? O seu histórico de treinos será apagado.
            </Text>
            <View style={styles.alertButtonGroup}>
              <TouchableOpacity style={[styles.alertBtn, styles.alertBtnCancel]} onPress={cancelDelete}>
                <Text style={styles.alertBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.alertBtn, styles.alertBtnConfirm]} onPress={confirmDelete}>
                <Text style={styles.alertBtnTextConfirm}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800" },
  addButton: {
    backgroundColor: "#FF005E",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  card: { marginBottom: 15, padding: 15 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoContainer: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0, 230, 118, 0.2)",
    justifyContent: "center", alignItems: "center",
  },
  avatarPlaceholderNoProf: { backgroundColor: "rgba(255, 159, 10, 0.2)" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  name: { color: "#fff", fontSize: 16, fontWeight: "700" },
  role: { color: "#aaa", fontSize: 12, marginTop: 2 },
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10,
  },
  deleteText: { color: "#FF3B30", fontWeight: "700" },
  empty: { color: "#888", textAlign: "center", marginTop: 40 },
  
  /* Estilos do Modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  alertBox: { backgroundColor: "#1A1A1A", borderRadius: 24, padding: 24, width: "100%", maxWidth: 340, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  iconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255, 59, 48, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  alertTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  alertMessage: { color: "#aaa", fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22 },
  alertHighlight: { color: "#fff", fontWeight: "bold" },
  alertButtonGroup: { flexDirection: "row", gap: 12, width: "100%" },
  alertBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  alertBtnCancel: { backgroundColor: "rgba(255,255,255,0.08)" },
  alertBtnConfirm: { backgroundColor: "#FF3B30" },
  alertBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  alertBtnTextConfirm: { color: "#fff", fontWeight: "700", fontSize: 15 },
});