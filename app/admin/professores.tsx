import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import {
  deleteProfessor,
  getProfessores,
} from "@/services/admin-professores.service";

import { useAuthStore } from "@/store/auth.store";
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

export default function Professores() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Estados para o nosso alerta customizado
  const [alertVisible, setAlertVisible] = useState(false);
  const [profToDelete, setProfToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProfessores();
      setProfessores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar professores:", err);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id: string, name: string) => {
    setProfToDelete({ id, name });
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    if (!profToDelete) return;

    setAlertVisible(false); // Esconde o modal imediatamente
    setDeletingId(profToDelete.id); // Mostra o loading no botão da lista

    try {
      await deleteProfessor(profToDelete.id);
      setProfessores((prev) => prev.filter((prof) => prof.id !== profToDelete.id));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir.");
    } finally {
      setDeletingId(null);
      setProfToDelete(null);
    }
  };

  const cancelDelete = () => {
    setAlertVisible(false);
    setProfToDelete(null);
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
      {/* CABEÇALHO ATUALIZADO COM O BOTÃO + */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Professores</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/criar-professor")}
        >
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={professores}
        keyExtractor={(item, index) => (item?.id ? item.id : `prof-${index}`)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.infoContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.role}>Professor</Text>
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
          <Text style={styles.empty}>Nenhum professor encontrado.</Text>
        }
      />

      {/* MODAL DE CONFIRMAÇÃO ESTILIZADO */}
      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 32 }}>⚠️</Text>
            </View>

            <Text style={styles.alertTitle}>Excluir Professor</Text>
            <Text style={styles.alertMessage}>
              Tem certeza que deseja remover <Text style={styles.alertHighlight}>{profToDelete?.name}</Text>? Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.alertButtonGroup}>
              <TouchableOpacity style={[styles.alertBtn, styles.alertBtnCancel]} onPress={cancelDelete}>
                <Text style={styles.alertBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.alertBtn, styles.alertBtnConfirm]} onPress={confirmDelete}>
                <Text style={styles.alertBtnTextConfirm}>Sim, Excluir</Text>
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
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  addButton: {
    backgroundColor: "#FF005E",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  // ... o resto dos estilos continua igual
  card: {
    marginBottom: 15,
    padding: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 0, 94, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FF005E",
    fontSize: 18,
    fontWeight: "bold",
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  role: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  deleteText: {
    color: "#FF3B30",
    fontWeight: "700",
  },
  empty: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  alertTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  alertMessage: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  alertHighlight: {
    color: "#fff",
    fontWeight: "bold",
  },
  alertButtonGroup: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  alertBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBtnCancel: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  alertBtnConfirm: {
    backgroundColor: "#FF3B30",
  },
  alertBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  alertBtnTextConfirm: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});