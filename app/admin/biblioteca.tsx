import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import {
  clonarTreinoAdmin,
  createTemplateTreinoAdmin,
  getTemplatesTreinoAdmin,
  getTodosAlunos,
  getWorkoutTypes,
} from "@/services/admin-biblioteca.service";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function BibliotecaAdmin() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [templates, setTemplates] = useState<any[]>([]);
  const [tiposTreino, setTiposTreino] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Criação (Ficha)
  const [createVisible, setCreateVisible] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type_id: "" });
  const [creating, setCreating] = useState(false);

  // Modal de Clone (Atribuir)
  const [cloneVisible, setCloneVisible] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [cloning, setCloning] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const typesData = await getWorkoutTypes();
      if (typesData.length > 0) setTiposTreino(typesData);

      const tData = await getTemplatesTreinoAdmin();
      setTemplates(tData);
    } catch (err: any) { 
      Alert.alert("Erro ao carregar", err.message);
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateTemplate = async () => {
    if (!form.name.trim() || !form.type_id || !user) {
      alert("Preencha o nome e selecione uma categoria.");
      return;
    }
    try {
      setCreating(true);
      await createTemplateTreinoAdmin(form.name, form.description, user.id, form.type_id);
      setCreateVisible(false);
      setForm({ name: "", description: "", type_id: "" });
      loadData();
    } catch (error: any) { alert("Erro: " + error.message); } 
    finally { setCreating(false); }
  };

  const openCloneModal = async (template: any) => {
    setSelectedTemplate(template);
    setCloneVisible(true);
    if (alunos.length === 0) {
      const todosAlunos = await getTodosAlunos();
      setAlunos(todosAlunos);
    }
  };

  const handleClone = async (studentId: string, studentName: string) => {
    if (!selectedTemplate) return;
    try {
      setCloning(true);
      await clonarTreinoAdmin(selectedTemplate.id, studentId);
      setCloneVisible(false);
      Alert.alert("Sucesso!", `Treino atribuído para ${studentName} com sucesso! 💪`);
    } catch (error: any) { alert("Erro ao atribuir: " + error.message); } 
    finally { setCloning(false); }
  };

  if (!user || loading) return <Screen><ActivityIndicator color="#00E676" size="large" style={{ marginTop: 50 }} /></Screen>;

  return (
    <Screen>
      {/* HEADER LIMPO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biblioteca</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* GRID DE AÇÕES RÁPIDAS (Estilo Premium) */}
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => setCreateVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
              <Feather name="file-plus" size={24} color="#007AFF" />
            </View>
            <Text style={styles.gridTitle}>Nova Ficha</Text>
            <Text style={styles.gridSub}>Criar treino base</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => router.push("/admin/criar-exercicio")}
          >
            <View style={[styles.iconBox, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
              <Feather name="video" size={24} color="#00E676" />
            </View>
            <Text style={styles.gridTitle}>Exercícios</Text>
            <Text style={styles.gridSub}>Cadastrar vídeo</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE FICHAS */}
        <Text style={styles.sectionTitle}>Fichas de Treino Base</Text>

        {templates.map((item) => (
          <Card key={item.id} style={styles.templateCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Feather name="clipboard" size={22} color="#fff" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.tagContainer}>
                  <Text style={styles.tagText}>{item.workout_types?.name || "Geral"}</Text>
                </View>
              </View>
            </View>

            {item.description ? (
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}

            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.btnSecondary} 
                onPress={() => router.push(`/admin/treino/${item.id}/exercicios`)}
              >
                <Feather name="list" size={16} color="#aaa" />
                <Text style={styles.btnSecondaryText}>Exercícios</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={() => openCloneModal(item)}
              >
                <Feather name="send" size={16} color="#111" />
                <Text style={styles.btnPrimaryText}>Atribuir</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* MODAL 1: CRIAR FICHA */}
      <Modal visible={createVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalTitle}>Novo Treino Base</Text>
              <Text style={styles.modalSubtitle}>Crie uma ficha para reutilizar depois</Text>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Categoria do Treino:</Text>
              <View style={styles.typeGrid}>
                {tiposTreino.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.id}
                    style={[styles.typeChip, form.type_id === tipo.id && styles.typeChipActive]}
                    onPress={() => setForm({ ...form, type_id: tipo.id })}
                  >
                    <Feather name={form.type_id === tipo.id ? "check-circle" : "circle"} size={14} color={form.type_id === tipo.id ? "#00E676" : "#666"} />
                    <Text style={[styles.typeText, form.type_id === tipo.id && styles.typeTextActive]}>{tipo.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Detalhes:</Text>
              <TextInput style={styles.input} placeholder="Nome (Ex: Ficha Hipertrofia A)" placeholderTextColor="#666" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
              <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} placeholder="Breve descrição (Opcional)" placeholderTextColor="#666" multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />
            </ScrollView>
            
            <View style={styles.modalFooterBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, creating && { opacity: 0.7 }]} onPress={handleCreateTemplate} disabled={creating}>
                {creating ? <ActivityIndicator color="#111" size="small" /> : <Text style={styles.confirmBtnText}>Criar Ficha</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ATRIBUIR (ENVIAR PARA ALUNO) */}
      <Modal visible={cloneVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalTitle}>Atribuir Ficha</Text>
              <Text style={styles.modalSubtitle}>Para quem deseja enviar a ficha "{selectedTemplate?.name}"?</Text>
            </View>

            {cloning ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color="#00E676" size="large" />
                <Text style={{ color: '#aaa', marginTop: 15 }}>A enviar treino...</Text>
              </View>
            ) : (
              <FlatList
                data={alunos}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 350, width: "100%", marginTop: 10 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.studentItem} onPress={() => handleClone(item.id, item.name)}>
                    <View style={styles.studentAvatar}>
                      <Feather name="user" size={20} color="#fff" />
                    </View>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <View style={styles.sendIconBox}>
                      <Feather name="send" size={16} color="#00E676" />
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setCloneVisible(false)}>
              <Text style={styles.closeModalText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 25, marginTop: 10 },
  backBtn: { marginRight: 15, padding: 5 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  
  // Grid de Ações
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, gap: 12 },
  gridCard: { flex: 1, backgroundColor: '#1A1A1A', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  gridTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  gridSub: { color: '#666', fontSize: 12, marginTop: 4 },

  sectionTitle: { color: "#888", fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  
  // Cartão da Ficha de Treino
  templateCard: { padding: 20, marginBottom: 15, borderRadius: 24, backgroundColor: '#161616', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  tagContainer: { alignSelf: 'flex-start', backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#00E676', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardDesc: { color: '#888', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  
  // Botões dentro da Ficha
  cardActions: { flexDirection: 'row', gap: 12, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  btnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', gap: 8 },
  btnSecondaryText: { color: '#aaa', fontWeight: '700', fontSize: 14 },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: '#00E676', gap: 8 },
  btnPrimaryText: { color: '#111', fontWeight: '800', fontSize: 14 },

  // Listagem de Alunos no Modal
  studentItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  studentName: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600", marginLeft: 12 },
  sendIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0, 230, 118, 0.15)', justifyContent: 'center', alignItems: 'center' },

  // Modais (Base)
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#1A1A1A", borderRadius: 32, padding: 24, width: "100%", maxWidth: 400, maxHeight: "85%", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  modalHeaderInfo: { marginBottom: 20, alignItems: 'center' },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { color: "#888", fontSize: 14, fontWeight: "500", textAlign: 'center', paddingHorizontal: 10 },
  
  // Form do Modal
  inputLabel: { color: "#888", marginBottom: 10, fontSize: 12, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(255,255,255,0.03)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", gap: 8 },
  typeChipActive: { backgroundColor: "rgba(0, 230, 118, 0.08)", borderColor: "#00E676" },
  typeText: { color: "#888", fontWeight: "600", fontSize: 13 },
  typeTextActive: { color: "#00E676", fontWeight: '700' },
  input: { width: "100%", backgroundColor: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 16, color: "#fff", marginBottom: 15, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  // Botões de Modal
  modalFooterBtns: { flexDirection: "row", gap: 12, width: "100%", marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)" },
  cancelBtnText: { color: "#aaa", fontWeight: "700", fontSize: 15 },
  confirmBtn: { flex: 1.5, paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: "#00E676" },
  confirmBtnText: { color: "#111", fontWeight: "800", fontSize: 15 },
  
  closeModalBtn: { width: "100%", paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", marginTop: 20 },
  closeModalText: { color: "#aaa", fontWeight: "700", fontSize: 15 }
});