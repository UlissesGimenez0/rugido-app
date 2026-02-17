import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
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

// --- COMPONENTE DO CARTÃO COM VÍDEO (Roda em loop infinito sem som) ---
const ExerciseCard = ({ item, index, onDelete }: any) => {
  // Configura o player do vídeo se existir uma URL
  const player = useVideoPlayer(item.video_url, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {/* Mostra o vídeo se existir, senão mostra o número */}
        {item.video_url ? (
          <VideoView player={player} style={styles.videoThumbnail} contentFit="cover" />
        ) : (
          <View style={styles.indexCircle}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.details}>
            {item.sets} séries • {item.reps} reps {item.rest_seconds ? `• ${item.rest_seconds}s desc.` : ""}
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => onDelete(item.id)} style={{ padding: 10 }}>
          <Feather name="trash-2" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default function ExerciciosDoTreino() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [exercicios, setExercicios] = useState<any[]>([]);
  const [biblioteca, setBiblioteca] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // O formulário agora guarda a seleção do exercício da base
  const [form, setForm] = useState({
    name: "",
    sets: "",
    reps: "",
    rest_seconds: "",
    video_url: "",
  });

  useEffect(() => {
    if (id) {
      loadExercicios();
      loadBiblioteca();
    }
  }, [id]);

  const loadExercicios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setExercicios(data || []);
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBiblioteca = async () => {
    const { data } = await supabase.from("exercise_library").select("*").order("name");
    if (data) setBiblioteca(data);
  };

  const handleSelectFromLibrary = (item: any) => {
    setForm({ ...form, name: item.name, video_url: item.media_url });
  };

  const handleAddExercise = async () => {
    if (!form.name.trim() || !form.sets || !form.reps) {
      alert("Selecione um exercício e preencha as séries e repetições.");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from("exercises").insert({
        workout_id: id,
        name: form.name,
        sets: parseInt(form.sets),
        reps: parseInt(form.reps),
        rest_seconds: form.rest_seconds ? parseInt(form.rest_seconds) : null,
        video_url: form.video_url || null,
      });

      if (error) throw error;

      setModalVisible(false);
      setForm({ name: "", sets: "", reps: "", rest_seconds: "", video_url: "" });
      loadExercicios();
    } catch (error: any) {
      alert("Erro ao salvar exercício: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (exerciseId: string) => {
    Alert.alert("Excluir", "Remover este exercício do treino?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await supabase.from("exercises").delete().eq("id", exerciseId);
          setExercicios((prev) => prev.filter((e) => e.id !== exerciseId));
        },
      },
    ]);
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Ficha de Treino</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={exercicios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <ExerciseCard item={item} index={index} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="list" size={48} color="#333" style={{ marginBottom: 15 }} />
            <Text style={styles.empty}>Nenhum exercício neste treino.</Text>
            <Text style={styles.emptySub}>Clique no + para adicionar da biblioteca.</Text>
          </View>
        }
      />

      {/* MODAL DE ADICIONAR EXERCÍCIO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Exercício</Text>

            {/* SELEÇÃO DA BIBLIOTECA (Seus 5 vídeos aparecem aqui!) */}
            <Text style={styles.label}>1. Escolha o Exercício:</Text>
            <View style={{ height: 60, marginBottom: 20 }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={biblioteca}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.libChip,
                      form.name === item.name && styles.libChipActive,
                    ]}
                    onPress={() => handleSelectFromLibrary(item)}
                  >
                    <Text style={[styles.libChipText, form.name === item.name && styles.libChipTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {form.name ? (
              <Text style={{ color: "#00E676", marginBottom: 15, fontWeight: "bold" }}>
                Selecionado: {form.name}
              </Text>
            ) : null}

            <Text style={styles.label}>2. Defina o Volume:</Text>
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="Séries (Ex: 4)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={form.sets}
                onChangeText={(t) => setForm({ ...form, sets: t })}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Reps (Ex: 12)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={form.reps}
                onChangeText={(t) => setForm({ ...form, reps: t })}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Descanso em segundos (Ex: 60)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={form.rest_seconds}
              onChangeText={(t) => setForm({ ...form, rest_seconds: t })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, saving && { opacity: 0.7 }]} 
                onPress={handleAddExercise}
                disabled={saving || !form.name}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Salvar</Text>}
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
  backButton: { marginRight: 15 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  addButton: { backgroundColor: "#00E676", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  card: { padding: 12, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  videoThumbnail: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#000" },
  indexCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255, 255, 255, 0.1)", justifyContent: "center", alignItems: "center" },
  indexText: { color: "#fff", fontWeight: "bold" },
  name: { color: "#fff", fontSize: 16, fontWeight: "700" },
  details: { color: "#aaa", fontSize: 13, marginTop: 4 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  empty: { color: "#888", textAlign: "center", fontSize: 16, fontWeight: "600" },
  emptySub: { color: "#555", textAlign: "center", fontSize: 14, marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#1A1A1A", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 20, textAlign: "center" },
  label: { color: "#aaa", fontSize: 14, marginBottom: 10, fontWeight: "600" },
  
  libChip: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, justifyContent: "center" },
  libChipActive: { backgroundColor: "rgba(0, 230, 118, 0.2)", borderColor: "#00E676", borderWidth: 1 },
  libChipText: { color: "#aaa", fontWeight: "600" },
  libChipTextActive: { color: "#00E676", fontWeight: "bold" },

  input: { backgroundColor: "rgba(255,255,255,0.08)", padding: 16, borderRadius: 14, color: "#fff", marginBottom: 12 },
  rowInputs: { flexDirection: "row" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  cancelBtnText: { color: "#fff", fontWeight: "600" },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#00E676" },
  confirmBtnText: { color: "#111", fontWeight: "700" },
});