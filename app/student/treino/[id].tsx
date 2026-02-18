import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function TreinoDetalhe() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para o Modal de Detalhes
  const [selectedEx, setSelectedEx] = useState<any>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  // FUNÇÃO MÁGICA PARA O LINK DO GITHUB (A mesma que usamos no Admin)
 const getGifUrl = (url?: string) => {
    if (!url) return "";
    const fileName = url.split("/").pop();
    const finalUrl = `https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/${fileName}`;
    
    // O NOSSO DETETIVE VAI ESCREVER NO TERMINAL DO PC:
    console.log("URL ORIGINAL:", url, "-> URL FINAL:", finalUrl);
    
    return finalUrl;
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: wkData } = await supabase.from("workouts").select("*").eq("id", id).single();
      if (wkData) setWorkout(wkData);

      const { data: exData } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", id)
        .order("created_at", { ascending: true });
 
      if (exData) {
        setExercises(exData.map(item => ({ ...item, completed: false })));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const completedCount = exercises.filter((e) => e.completed).length;
  const progressPercentage = exercises.length > 0 ? completedCount / exercises.length : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  const handleFinishWorkout = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("attendance").insert({
        user_id: user?.id,
        checkin_date: today,
        workout_id: id
      });

      Alert.alert("Missão Cumprida! 🏆", "Treino finalizado com sucesso!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert("Ops!", "Erro ao salvar o treino.");
    }
  };

  if (loading) return <Screen><ActivityIndicator color="#00E676" size="large" style={{marginTop: 50}} /></Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Execução</Text>
      </View>

      {workout && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
        </View>
      )}

      {/* BARRA DE PROGRESSO */}
      <View style={styles.progressContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={styles.progressText}>Seu esforço hoje</Text>
          <Text style={styles.progressText}>{Math.round(progressPercentage * 100)}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                backgroundColor: "#00E676",
              },
            ]}
          />
        </View>
      </View>

      <FlatList
        style={{ marginTop: 25 }}
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
       <Card style={StyleSheet.flatten([styles.exerciseCard, item.completed && styles.exerciseCardCompleted])}>
            <View style={styles.cardRow}>
              
              {/* GIF OU NÚMERO */}
              <TouchableOpacity onPress={() => setSelectedEx(item)}>
                  <View style={styles.gifContainer}>
                    <Image 
                        source={{ uri: getGifUrl(item.video_url) }} 
                        style={styles.gifThumbnail} 
                        resizeMode="cover" 
                    />
                  </View>
              </TouchableOpacity>

              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.exerciseTitle, item.completed && styles.textCompleted]}>
                  {item.name}
                </Text>
                <Text style={styles.exerciseDetails}>
                  {item.sets} x {item.reps} {item.rest_seconds ? `• ${item.rest_seconds}s` : ""}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.checkButton, item.completed && styles.checkButtonCompleted]}
                onPress={() => toggleExercise(item.id)}
              >
                <Feather name="check" size={20} color={item.completed ? "#000" : "#444"} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* MODAL DE DETALHES DO EXERCÍCIO */}
      <Modal visible={!!selectedEx} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalGifBox}>
              <Image source={{ uri: getGifUrl(selectedEx?.video_url) }} style={styles.modalGif} resizeMode="contain" />
            </View>
            <Text style={styles.modalName}>{selectedEx?.name}</Text>
            
            <View style={styles.modalInfoRow}>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>Séries</Text><Text style={styles.infoVal}>{selectedEx?.sets}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>Reps</Text><Text style={styles.infoVal}>{selectedEx?.reps}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>Descanso</Text><Text style={styles.infoVal}>{selectedEx?.rest_seconds}s</Text></View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedEx(null)}>
              <Text style={styles.closeBtnText}>Voltar ao treino</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.finishButton, progressPercentage === 1 ? styles.finishButtonReady : styles.finishButtonDisabled]}
        disabled={progressPercentage < 1}
        onPress={handleFinishWorkout}
      >
        <Text style={[styles.finishButtonText, { color: progressPercentage === 1 ? "#111" : "#fff" }]}>
          {progressPercentage === 1 ? "Finalizar Treino" : "Conclua os exercícios"}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  workoutTitle: { color: "#fff", fontSize: 32, fontWeight: "800" },

  progressContainer: { marginTop: 10 },
  progressText: { color: "#888", fontWeight: "600", fontSize: 13 },
  progressBarBackground: { height: 6, backgroundColor: "#222", borderRadius: 10, overflow: "hidden", marginTop: 8 },
  progressBarFill: { height: 6, borderRadius: 10 },

  exerciseCard: { padding: 12, marginBottom: 15, borderRadius: 20 },
  exerciseCardCompleted: { opacity: 0.5 },
  cardRow: { flexDirection: "row", alignItems: "center" },

  gifContainer: { width: 65, height: 65, borderRadius: 14, overflow: "hidden", backgroundColor: "#fff" },
  gifThumbnail: { width: "100%", height: "100%" },

  exerciseTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  textCompleted: { textDecorationLine: "line-through", color: "#666" },
  exerciseDetails: { color: "#666", marginTop: 4, fontSize: 14 },

  checkButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#333", justifyContent: "center", alignItems: "center" },
  checkButtonCompleted: { backgroundColor: "#00E676", borderColor: "#00E676" },

  finishButton: { position: "absolute", bottom: 30, left: 20, right: 20, padding: 18, borderRadius: 16, alignItems: "center" },
  finishButtonDisabled: { backgroundColor: "#222" },
  finishButtonReady: { backgroundColor: "#00E676" },
  finishButtonText: { fontWeight: "800", fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", padding: 25 },
  modalContent: { backgroundColor: "#161616", borderRadius: 30, padding: 20, alignItems: "center" },
  modalGifBox: { width: "100%", height: 280, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", marginBottom: 20 },
  modalGif: { width: "100%", height: "100%" },
  modalName: { color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "center" },
  modalInfoRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 25, borderTopWidth: 1, borderTopColor: "#222", paddingTop: 20 },
  infoItem: { alignItems: "center" },
  infoLabel: { color: "#555", fontSize: 11, textTransform: "uppercase" },
  infoVal: { color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 4 },
  closeBtn: { marginTop: 30, backgroundColor: "#00E676", paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  closeBtnText: { color: "#000", fontWeight: "700" }
});