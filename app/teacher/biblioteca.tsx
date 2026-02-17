import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import {
    clonarTreinoParaAluno,
    createTemplateTreino,
    getMeusAlunos,
    getTemplatesTreino,
} from "@/services/teacher-alunos.service";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function BibliotecaTreinos() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Criação
  const [createVisible, setCreateVisible] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  // Estados do Modal de Clonagem
  const [cloneVisible, setCloneVisible] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplatesTreino();
      setTemplates(data);
    } catch (err) {
      console.error("Erro ao carregar biblioteca:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÕES DE CRIAÇÃO ---
  const handleCreateTemplate = async () => {
    if (!form.name.trim() || !user) return;
    try {
      setCreating(true);
      await createTemplateTreino(form.name, form.description, user.id);
      setCreateVisible(false);
      setForm({ name: "", description: "" });
      loadTemplates(); // Recarrega a lista
    } catch (error: any) {
      alert("Erro ao criar molde: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  // --- FUNÇÕES DE CLONAGEM ---
  const openCloneModal = async (template: any) => {
    setSelectedTemplate(template);
    setCloneVisible(true);
    // Carrega a lista de alunos do professor se ainda estiver vazia
    if (alunos.length === 0) {
      try {
        const meusAlunos = await getMeusAlunos();
        setAlunos(meusAlunos);
      } catch (err) {
        console.error("Erro ao buscar alunos para clonagem", err);
      }
    }
  };

  const handleClone = async (studentId: string, studentName: string) => {
    if (!selectedTemplate) return;
    try {
      setCloning(true);
      await clonarTreinoParaAluno(selectedTemplate.id, studentId);
      setCloneVisible(false);
      
      Alert.alert(
        "Sucesso!",
        `O treino '${selectedTemplate.name}' foi enviado para ${studentName} com sucesso!`
      );
    } catch (error: any) {
      alert("Erro ao clonar: " + error.message);
    } finally {
      setCloning(false);
    }
  };

  if (!user || loading) {
    return (
      <Screen>
        <ActivityIndicator color="#00E676" size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Biblioteca</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setCreateVisible(true)}>
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
                <Feather name="clipboard" size={24} color="#00E676" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.cardDescription}>{item.description}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.actionRow}>
              {/* Botão de Editar Exercícios */}
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.08)" }]}
                onPress={() => router.push(`/teacher/treino/${item.id}/exercicios`)}
              >
                <Feather name="edit-2" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Exercícios</Text>
              </TouchableOpacity>

              {/* Botão de Clonar */}
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: "#FF005E" }]}
                onPress={() => openCloneModal(item)}
              >
                <Feather name="copy" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Enviar p/ Aluno</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="book" size={48} color="#333" style={{ marginBottom: 15 }} />
            <Text style={styles.empty}>Sua biblioteca está vazia.</Text>
            <Text style={styles.emptySub}>Crie um modelo para começar a clonar.</Text>
          </View>
        }
      />

      {/* MODAL 1: CRIAR NOVO TEMPLATE */}
      <Modal visible={createVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Treino Base</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome (Ex: Ficha A - Hipertrofia)"
              placeholderTextColor="#888"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Descrição ou Foco do treino (Opcional)"
              placeholderTextColor="#888"
              multiline
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, creating && { opacity: 0.7 }]} 
                onPress={handleCreateTemplate}
                disabled={creating}
              >
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Criar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CLONAR PARA ALUNO */}
      <Modal visible={cloneVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enviar para Aluno</Text>
            <Text style={styles.modalSubtitle}>
              Selecione o aluno que vai receber o treino: <Text style={{ color: "#fff", fontWeight: "bold" }}>{selectedTemplate?.name}</Text>
            </Text>

            {cloning ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ActivityIndicator color="#FF005E" size="large" />
                <Text style={{ color: "#fff", marginTop: 15 }}>A clonar exercícios...</Text>
              </View>
            ) : (
              <FlatList
                data={alunos}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 300, width: "100%", marginTop: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.studentChip}
                    onPress={() => handleClone(item.id, item.name)}
                  >
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{item.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Feather name="send" size={18} color="#888" style={{ marginLeft: "auto" }} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptySub}>Você não tem alunos vinculados.</Text>}
              />
            )}

            <TouchableOpacity style={[styles.cancelBtn, { width: "100%", marginTop: 15 }]} onPress={() => setCloneVisible(false)}>
              <Text style={styles.cancelBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25, marginTop: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  addButton: { backgroundColor: "#00E676", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  
  card: { padding: 18, marginBottom: 15 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconContainer: { width: 46, height: 46, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardDescription: { color: "#aaa", fontSize: 13, marginTop: 4 },
  
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, gap: 8 },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  empty: { color: "#888", textAlign: "center", fontSize: 16, fontWeight: "600" },
  emptySub: { color: "#555", textAlign: "center", fontSize: 14, marginTop: 5 },

  /* MODALS */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#1A1A1A", borderRadius: 24, padding: 24, width: "100%", maxWidth: 360, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", alignItems: "center" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 15 },
  modalSubtitle: { color: "#aaa", fontSize: 14, textAlign: "center", marginBottom: 10 },
  input: { width: "100%", backgroundColor: "rgba(255,255,255,0.08)", padding: 16, borderRadius: 14, color: "#fff", marginBottom: 12 },
  modalButtons: { flexDirection: "row", gap: 12, width: "100%", marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  cancelBtnText: { color: "#fff", fontWeight: "600" },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#00E676" },
  confirmBtnText: { color: "#111", fontWeight: "700" },
  
  studentChip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 14, marginBottom: 8 },
  avatarMini: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255, 0, 94, 0.2)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarMiniText: { color: "#FF005E", fontWeight: "bold" },
  studentName: { color: "#fff", fontSize: 15, fontWeight: "600" }
});