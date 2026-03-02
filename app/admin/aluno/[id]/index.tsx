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
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminGerirFichas() {
  const { id } = useLocalSearchParams(); // ID do Aluno
  const router = useRouter();

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para Criação/Edição
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [editingWorkout, setEditingWorkout] = useState<any>(null); // Se tiver algo aqui, é Edição. Se não, é Criação.
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadWorkouts(); }, [id]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: true });
      if (data) setWorkouts(data);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. SALVAR FICHA (CRIAR NOVA OU EDITAR NOME) ---
  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Aviso", "O nome do treino não pode estar vazio.");
      return;
    }
    
    try {
      setSaving(true);
      
      if (editingWorkout) {
        // MODO EDIÇÃO
        const { error } = await supabase
          .from("workouts")
          .update({ name: workoutName })
          .eq("id", editingWorkout.id);
        if (error) throw error;
      } else {
        // MODO CRIAÇÃO (Novo Treino)
        const { error } = await supabase.from("workouts").insert({
          user_id: id,
          name: workoutName,
        });
        if (error) throw error;
      }
      
      setModalVisible(false);
      loadWorkouts();
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- 2. EXCLUIR FICHA INTEIRA ---
  const handleDeleteWorkout = (workoutId: string, name: string) => {
    Alert.alert(
      "Apagar Ficha",
      `Tem a certeza que deseja apagar a ficha "${name}"? Todos os exercícios associados serão perdidos.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive", 
          onPress: async () => {
            // Se tiver configurado ON DELETE CASCADE no Supabase, os exercícios também são apagados.
            await supabase.from("workouts").delete().eq("id", workoutId);
            loadWorkouts();
          } 
        }
      ]
    );
  };

  // Prepara o Modal para CRIAR novo
  const openCreateModal = () => {
    setEditingWorkout(null);
    setWorkoutName("");
    setModalVisible(true);
  };

  // Prepara o Modal para EDITAR existente
  const openEditModal = (workout: any) => {
    setEditingWorkout(workout);
    setWorkoutName(workout.name);
    setModalVisible(true);
  };

  if (loading) return <Screen><ActivityIndicator color="#00E676" size="large" style={{marginTop: 50}} /></Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fichas do Aluno</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Feather name="plus" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Feather name="clipboard" size={40} color="#333" />
            <Text style={{ color: '#fff', marginTop: 15, fontSize: 18, fontWeight: '700' }}>Nenhuma ficha criada.</Text>
            <Text style={{ color: '#666', marginTop: 5, fontSize: 14 }}>Clique no "+" para começar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.workoutCard}>
            <View style={styles.cardContent}>
              
              {/* ÁREA CLICÁVEL PRINCIPAL (Vai para os exercícios) */}
              <TouchableOpacity 
                style={{ flex: 1 }} 
                onPress={() => router.push(`/admin/treino/${item.id}/exercicios`)}
              >
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutDetails}>Gerir exercícios →</Text>
              </TouchableOpacity>

              {/* ÁREA DE ACÇÕES (Editar / Apagar) */}
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                  <Feather name="edit-2" size={20} color="#00E676" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => handleDeleteWorkout(item.id, item.name)} style={styles.actionBtn}>
                  <Feather name="trash-2" size={20} color="#FF005E" />
                </TouchableOpacity>
              </View>

            </View>
          </Card>
        )}
      />

      {/* MODAL MISTO: CRIAR ou EDITAR NOME */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingWorkout ? "Renomear Ficha" : "Nova Ficha de Treino"}
            </Text>
            
            <TextInput 
              style={styles.input}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Ex: Treino A - Superior"
              placeholderTextColor="#666"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.btn, styles.btnCancel]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btn, styles.btnSave]} 
                onPress={handleSaveWorkout}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#111" /> : <Text style={[styles.btnText, {color: '#111'}]}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  addButton: { backgroundColor: "#00E676", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  
  workoutCard: { padding: 18, marginBottom: 15, borderRadius: 20 },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workoutName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  workoutDetails: { color: '#666', fontSize: 13, marginTop: 4 },
  
  actions: { flexDirection: 'row', gap: 10, marginLeft: 15 },
  actionBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#161616', borderRadius: 25, padding: 25, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  input: { backgroundColor: '#222', borderRadius: 15, padding: 18, color: '#fff', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, padding: 16, borderRadius: 15, alignItems: 'center' },
  btnCancel: { backgroundColor: '#333' },
  btnSave: { backgroundColor: '#00E676' },
  btnText: { fontWeight: '700', fontSize: 15, color: '#fff' }
});