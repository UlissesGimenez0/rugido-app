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

  // Modal de Criação (agora com type_id)
  const [createVisible, setCreateVisible] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type_id: "" });
  const [creating, setCreating] = useState(false);

  const [cloneVisible, setCloneVisible] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [cloning, setCloning] = useState(false);

  useEffect(() => { loadData(); }, []);

const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Tenta buscar só as categorias primeiro
      const typesData = await getWorkoutTypes();
      
      // O detetive avisa-nos o que chegou!
      if (typesData.length === 0) {
        alert("O Supabase respondeu, mas diz que tem 0 categorias gravadas!");
      } else {
        console.log("Categorias encontradas:", typesData.length);
        setTiposTreino(typesData);
      }

      // 2. Depois busca os treinos
      const tData = await getTemplatesTreinoAdmin();
      setTemplates(tData);

    } catch (err: any) { 
      alert("Erro fatal ao carregar: " + err.message);
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
      Alert.alert("Sucesso!", `Treino enviado para ${studentName}!`);
    } catch (error: any) { alert("Erro ao clonar: " + error.message); } 
    finally { setCloning(false); }
  };

  if (!user || loading) return <Screen><ActivityIndicator color="#00E676" size="large" /></Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
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
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                <Feather name="shield" size={24} color="#007AFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                
                {/* Mostra o nome da categoria que está associada */}
                <Text style={styles.categoryTag}>
                  {item.workout_types?.name || "Sem categoria"}
                </Text>
                
                {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(255,255,255,0.08)" }]} onPress={() => router.push(`/admin/treino/${item.id}/exercicios`)}>
                <Feather name="edit-2" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Exercícios</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#FF005E" }]} onPress={() => openCloneModal(item)}>
                <Feather name="users" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Enviar p/ Todos</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* MODAL DE CRIAR TREINO COM CATEGORIAS */}
      <Modal visible={createVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Treino Base</Text>

            <Text style={styles.inputLabel}>Categoria (Tipo de Treino):</Text>
            <View style={{ height: 50, marginBottom: 15 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tiposTreino.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.id}
                    style={[styles.typeChip, form.type_id === tipo.id && styles.typeChipActive]}
                    onPress={() => setForm({ ...form, type_id: tipo.id })}
                  >
                    <Text style={[styles.typeText, form.type_id === tipo.id && styles.typeTextActive]}>
                      {tipo.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput style={styles.input} placeholder="Nome do Treino (Ex: Ficha A)" placeholderTextColor="#888" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} placeholder="Descrição (Opcional)" placeholderTextColor="#888" multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateVisible(false)}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateTemplate}><Text style={styles.confirmBtnText}>Criar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={cloneVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enviar para Aluno</Text>
            {cloning ? <ActivityIndicator color="#FF005E" size="large" /> : (
              <FlatList
                data={alunos}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 300, width: "100%", marginTop: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.studentChip} onPress={() => handleClone(item.id, item.name)}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Feather name="send" size={18} color="#888" style={{ marginLeft: "auto" }} />
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={[styles.cancelBtn, { width: "100%", marginTop: 15 }]} onPress={() => setCloneVisible(false)}><Text style={styles.cancelBtnText}>Fechar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  addButton: { backgroundColor: "#00E676", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  card: { padding: 18, marginBottom: 15 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconContainer: { width: 46, height: 46, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  categoryTag: { color: "#00E676", fontSize: 13, fontWeight: "600", marginTop: 2 },
  cardDescription: { color: "#aaa", fontSize: 13, marginTop: 6 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, gap: 8 },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#1A1A1A", borderRadius: 24, padding: 24, width: "100%", maxWidth: 360, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 15, textAlign: "center" },
  inputLabel: { color: "#aaa", marginBottom: 8, fontSize: 14, fontWeight: "600" },
  
  // Estilos das Categorias
  typeChip: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, justifyContent: "center" },
  typeChipActive: { backgroundColor: "rgba(0, 230, 118, 0.15)", borderWidth: 1, borderColor: "#00E676" },
  typeText: { color: "#aaa", fontWeight: "600" },
  typeTextActive: { color: "#00E676", fontWeight: "bold" },
  
  input: { width: "100%", backgroundColor: "rgba(255,255,255,0.08)", padding: 16, borderRadius: 14, color: "#fff", marginBottom: 12 },
  modalButtons: { flexDirection: "row", gap: 12, width: "100%", marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  cancelBtnText: { color: "#fff", fontWeight: "600" },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#00E676" },
  confirmBtnText: { color: "#111", fontWeight: "700" },
  studentChip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 14, marginBottom: 8 },
  studentName: { color: "#fff", fontSize: 15, fontWeight: "600" }
});