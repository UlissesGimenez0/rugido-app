import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const MUSCLE_GROUPS = ["Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen", "Cardio"];

export default function CriarExercicio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    muscle_group: "",
    instructions: "",
  });

  // Selecionar vídeo do dispositivo
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria para selecionar o vídeo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.muscle_group) {
      Alert.alert("Atenção", "O nome e o grupo muscular são obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      let finalVideoUrl = "";

      // 1. Upload para o bucket 'exercicios'
      if (videoUri) {
        const fileExt = videoUri.split('.').pop();
        const fileName = `${Date.now()}-${form.name.replace(/\s/g, "_")}.${fileExt}`;
        
        const response = await fetch(videoUri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("exercicios") // Usando o teu bucket existente
          .upload(fileName, blob, { 
            contentType: `video/${fileExt}`,
            upsert: true 
          });

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from("exercicios")
          .getPublicUrl(fileName);
        
        finalVideoUrl = publicUrlData.publicUrl;
      }

      // 2. Salvar na tabela exercises
      const { error } = await supabase.from("exercises").insert([
        {
          name: form.name,
          muscle_group: form.muscle_group,
          instructions: form.instructions,
          video_url: finalVideoUrl, 
        },
      ]);

      if (error) throw error;

      Alert.alert("Sucesso!", "Exercício guardado com sucesso.");
      router.back();
    } catch (error: any) {
      Alert.alert("Erro ao guardar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Exercício</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Card style={styles.formCard}>
          <Text style={styles.label}>Vídeo de Demonstração</Text>
          <TouchableOpacity 
            style={[styles.videoPicker, videoUri ? styles.videoPickerActive : null]} 
            onPress={pickVideo}
          >
            {videoUri ? (
              <View style={styles.videoSelected}>
                <Feather name="video" size={24} color="#00E676" />
                <Text style={styles.videoText}>Vídeo Selecionado!</Text>
                <TouchableOpacity onPress={() => setVideoUri(null)} style={{ marginLeft: 10 }}>
                  <Feather name="trash-2" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.videoPlaceholder}>
                <Feather name="upload-cloud" size={32} color="#666" />
                <Text style={styles.placeholderText}>Carregar vídeo do dispositivo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Nome do Exercício</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Agachamento"
            placeholderTextColor="#666"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          <Text style={styles.label}>Grupo Muscular</Text>
          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.muscleChip, form.muscle_group === m && styles.muscleChipActive]}
                onPress={() => setForm({ ...form, muscle_group: m })}
              >
                <Text style={[styles.muscleChipText, form.muscle_group === m && styles.muscleChipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Instruções</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Dicas de execução..."
            placeholderTextColor="#666"
            multiline
            value={form.instructions}
            onChangeText={(t) => setForm({ ...form, instructions: t })}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#111" /> : <Text style={styles.saveBtnText}>Salvar Exercício</Text>}
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 25, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  backBtn: { marginRight: 15 },
  formCard: { padding: 20 },
  label: { color: "#aaa", fontSize: 13, fontWeight: "700", marginBottom: 10, marginTop: 20 },
  videoPicker: {
    height: 100,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPickerActive: { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.05)" },
  videoPlaceholder: { alignItems: "center" },
  placeholderText: { color: "#666", marginTop: 8, fontSize: 14 },
  videoSelected: { flexDirection: 'row', alignItems: 'center' },
  videoText: { color: '#00E676', fontWeight: 'bold', marginLeft: 10 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 15, color: "#fff", fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  muscleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  muscleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)" },
  muscleChipActive: { backgroundColor: "rgba(0, 230, 118, 0.2)", borderWidth: 1, borderColor: "#00E676" },
  muscleChipText: { color: "#888", fontSize: 12, fontWeight: "700" },
  muscleChipTextActive: { color: "#00E676" },
  saveBtn: { backgroundColor: "#00E676", padding: 18, borderRadius: 15, marginTop: 35, alignItems: "center" },
  saveBtnText: { color: "#111", fontSize: 16, fontWeight: "800" },
});