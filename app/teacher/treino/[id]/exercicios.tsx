import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminTreinoExercicios() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [workout, setWorkout] = useState<any>(null);
  const [currentExercises, setCurrentExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Busca e Seleção
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryResults, setLibraryResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null); // Para novos
  const [editingExercise, setEditingExercise] = useState<any>(null); // Para editar existentes

  const [form, setForm] = useState({ sets: "3", reps: "10 a 12", rest_seconds: "60" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadWorkoutData(); }, [id]);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      const { data: wkData } = await supabase.from("workouts").select("*").eq("id", id).single();
      if (wkData) setWorkout(wkData);

      const { data: exData } = await supabase.from("exercises").select("*").eq("workout_id", id).order("created_at", { ascending: true });
      if (exData) setCurrentExercises(exData);
    } finally {
      setLoading(false);
    }
  };

  const getGifUrl = (url?: string) => {
    if (!url) return "";
    const fileName = url.split("/").pop();
    return `https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/${fileName}`;
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    try {
      setSearching(true);
      const { data, error } = await supabase
        .from("exercise_library")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(20);
      
      if (error) throw error;
      setLibraryResults(data || []);
    } catch (error) {
      console.error("Erro ao pesquisar:", error);
    } finally {
      setSearching(false);
    }
  };

  // --- FUNÇÃO PARA SALVAR NOVO ---
  const handleAddExercise = async () => {
    if (!selectedExercise) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("exercises").insert({
        workout_id: id,
        name: selectedExercise.name,
        video_url: selectedExercise.media_url,
        sets: form.sets,
        reps: form.reps,
        rest_seconds: form.rest_seconds,
      });
      if (error) throw error;

      Alert.alert("Sucesso", "Exercício adicionado à ficha!");
      setSelectedExercise(null);
      setModalVisible(false);
      setSearchQuery("");
      setLibraryResults([]);
      loadWorkoutData();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- FUNÇÃO PARA ATUALIZAR EXISTENTE ---
  const handleUpdateExercise = async () => {
    if (!editingExercise) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("exercises")
        .update({
          sets: form.sets,
          reps: form.reps,
          rest_seconds: form.rest_seconds
        })
        .eq("id", editingExercise.id);

      if (error) throw error;
      
      Alert.alert("Sucesso", "Exercício atualizado!");
      setEditModalVisible(false);
      loadWorkoutData();
    } catch (err: any) {
        Alert.alert("Erro", err.message);
    } finally {
      setSaving(false);
      setEditingExercise(null);
    }
  };

  const handleDelete = async (exerciseId: string) => {
    Alert.alert("Remover", "Deseja remover este exercício?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: async () => {
          await supabase.from("exercises").delete().eq("id", exerciseId);
          loadWorkoutData();
      }}
    ]);
  };

  // Abre o modal de edição com os dados atuais
  const openEditModal = (ex: any) => {
    setEditingExercise(ex);
    setForm({ sets: ex.sets, reps: ex.reps, rest_seconds: ex.rest_seconds });
    setEditModalVisible(true);
  };

  if (loading) return <Screen><ActivityIndicator color="#00E676" size="large" style={{ marginTop: 50 }} /></Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Gerir Treino</Text>
            <Text style={styles.headerSub}>{workout?.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => { setForm({sets:"3", reps:"10 a 12", rest_seconds:"60"}); setModalVisible(true); }}>
          <Feather name="plus" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="clipboard" size={40} color="#333" />
            <Text style={styles.emptyText}>Nenhum exercício nesta ficha.</Text>
            <Text style={styles.emptySub}>Clique no "+" para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.exerciseCard}>
            <TouchableOpacity style={styles.cardRow} onPress={() => openEditModal(item)}>
              <View style={styles.gifContainer}>
                <Image source={{ uri: getGifUrl(item.video_url) }} style={styles.gif} resizeMode="cover" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDetails}>{item.sets} x {item.reps} • {item.rest_seconds}s</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Feather name="trash-2" size={18} color="#FF005E" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
        )}
      />

      {/* MODAL PARA EDITAR EXERCÍCIO EXISTENTE (SÉRIES/REPS) */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Execução</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><Feather name="x" size={24} color="#666" /></TouchableOpacity>
            </View>
            
            <Text style={styles.editExName}>{editingExercise?.name}</Text>

            <View style={styles.formGrid}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Séries</Text>
                    <TextInput style={styles.input} value={form.sets} onChangeText={(t) => setForm({...form, sets: t})} keyboardType="numeric" />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Repetições</Text>
                    <TextInput style={styles.input} value={form.reps} onChangeText={(t) => setForm({...form, reps: t})} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Descanso (seg)</Text>
                    <TextInput style={styles.input} value={form.rest_seconds} onChangeText={(t) => setForm({...form, rest_seconds: t})} keyboardType="numeric" />
                </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateExercise} disabled={saving}>
               {saving ? <ActivityIndicator color="#111" /> : <Text style={styles.saveBtnText}>Salvar Alterações</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL GIGANTE PARA ADICIONAR NOVO EXERCÍCIO (PESQUISA NA BIBLIOTECA) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedExercise ? "Configurar Exercício" : "Buscar na Biblioteca"}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSelectedExercise(null); }}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedExercise ? (
              <View style={{ flex: 1 }}>
                <View style={styles.selectedExerciseHeader}>
                  <View style={styles.selectedGifBox}>
                    <Image source={{ uri: getGifUrl(selectedExercise.media_url) }} style={styles.gif} resizeMode="cover" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.selectedTitle}>{selectedExercise.name}</Text>
                    <Text style={styles.selectedGroup}>{selectedExercise.muscle_group}</Text>
                  </View>
                </View>

                <View style={styles.formGrid}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Séries</Text>
                    <TextInput style={styles.input} value={form.sets} onChangeText={(t) => setForm({...form, sets: t})} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Repetições</Text>
                    <TextInput style={styles.input} value={form.reps} onChangeText={(t) => setForm({...form, reps: t})} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Descanso (seg)</Text>
                    <TextInput style={styles.input} value={form.rest_seconds} onChangeText={(t) => setForm({...form, rest_seconds: t})} keyboardType="numeric" />
                  </View>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleAddExercise} disabled={saving}>
                  {saving ? <ActivityIndicator color="#111" /> : <Text style={styles.saveBtnText}>Adicionar à Ficha</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.backSearchBtn} onPress={() => setSelectedExercise(null)}>
                  <Text style={styles.backSearchText}>Voltar à pesquisa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <View style={styles.searchBar}>
                  <Feather name="search" size={20} color="#666" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Ex: Supino, Agachamento..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                  />
                  <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                    <Text style={styles.searchBtnText}>Buscar</Text>
                  </TouchableOpacity>
                </View>

                {searching ? (
                  <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
                ) : (
                  <FlatList
                    data={libraryResults}
                    keyExtractor={(item) => item.id.toString()}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={true}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <Text style={styles.emptySearch}>
                        {searchQuery.length > 0 ? "Nenhum exercício encontrado." : "Digite um nome para buscar."}
                      </Text>
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.libraryItem} onPress={() => setSelectedExercise(item)}>
                        <View style={styles.libraryGifBox}>
                          <Image source={{ uri: getGifUrl(item.media_url) }} style={styles.gif} resizeMode="cover" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                          <Text style={styles.libraryTitle}>{item.name}</Text>
                          <Text style={styles.libraryGroup}>{item.muscle_group}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#555" />
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  headerSub: { color: "#00E676", fontSize: 14, fontWeight: "600" },
  addButton: { backgroundColor: "#00E676", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#fff', marginTop: 15, fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#666', marginTop: 5, fontSize: 14 },

  exerciseCard: { padding: 12, marginBottom: 10, borderRadius: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  gifContainer: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#fff', overflow: 'hidden' },
  gif: { width: '100%', height: '100%' },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardDetails: { color: '#666', fontSize: 13, marginTop: 3 },
  deleteBtn: { padding: 8 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#161616", height: "85%", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },

  editExName: { color: '#00E676', fontSize: 16, fontWeight: '700', marginBottom: 20 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 16, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 15, fontSize: 15 },
  searchBtn: { backgroundColor: 'rgba(0, 230, 118, 0.15)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  searchBtnText: { color: '#00E676', fontWeight: '700', fontSize: 13 },
  emptySearch: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 15 },

  libraryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  libraryGifBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' },
  libraryTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  libraryGroup: { color: '#888', fontSize: 12, marginTop: 2 },

  selectedExerciseHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 16, marginBottom: 25 },
  selectedGifBox: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  selectedTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  selectedGroup: { color: '#00E676', fontSize: 13, fontWeight: '600', marginTop: 4 },
  
  formGrid: { gap: 15, marginBottom: 30 },
  inputGroup: {},
  inputLabel: { color: '#888', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: '#222', borderRadius: 14, padding: 15, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  saveBtn: { backgroundColor: '#00E676', padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#111', fontSize: 16, fontWeight: '800' },
  backSearchBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  backSearchText: { color: '#888', fontSize: 14, fontWeight: '600' }
});