import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video"; // <-- Usando a nossa biblioteca rápida
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- COMPONENTE DO CARTÃO DO EXERCÍCIO COM VÍDEO ---
const ExerciseStudentCard = ({ item, index, onToggle }: any) => {
  const isCompleted = item.completed;
  
  // Configura o vídeo em loop silencioso
  const player = useVideoPlayer(item.video_url, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

return (
    <Card style={StyleSheet.flatten([styles.exerciseCard, isCompleted && styles.exerciseCardCompleted])}>
      <View style={styles.cardRow}>
        
        {/* ESQUERDA: VÍDEO OU NÚMERO */}
        {item.video_url ? (
          <View style={[styles.videoContainer, isCompleted && { opacity: 0.4 }]}>
            <VideoView player={player} style={styles.videoThumbnail} contentFit="cover" />
          </View>
        ) : (
          <View style={[styles.indexCircle, isCompleted && { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
            <Text style={[styles.indexText, isCompleted && { color: "#00E676" }]}>{index + 1}</Text>
          </View>
        )}

        {/* MEIO: INFORMAÇÕES */}
        <TouchableOpacity style={{ flex: 1, marginLeft: 15 }} onPress={() => onToggle(item.id)}>
          <Text style={[styles.exerciseTitle, isCompleted && styles.textCompleted]}>
            {item.name}
          </Text>
          <Text style={[styles.exerciseDetails, isCompleted && { color: "#555" }]}>
            {item.sets} séries • {item.reps} reps
            {item.rest_seconds ? `\nDescanso: ${item.rest_seconds}s` : ""}
          </Text>
        </TouchableOpacity>

        {/* DIREITA: BOTÃO DE CONCLUÍDO (CHECK) */}
        <TouchableOpacity
          style={[styles.checkButton, isCompleted && styles.checkButtonCompleted]}
          onPress={() => onToggle(item.id)}
        >
          <Feather name="check" size={20} color={isCompleted ? "#000" : "#fff"} />
        </TouchableOpacity>

      </View>
    </Card>
  );
};


export default function TreinoDetalhe() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  
  // Lógica da Barra de Progresso
  const completedCount = exercises.filter((e) => e.completed).length;
  const totalCount = exercises.length;
  const progressPercentage = totalCount > 0 ? completedCount / totalCount : 0;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: wkData } = await supabase.from("workouts").select("*").eq("id", id).single();
      if (wkData) setWorkout(wkData);

      const { data: exData } = await supabase.from("exercises").select("*").eq("workout_id", id).order("created_at", { ascending: true });
      if (exData) {
        setExercises(exData.map((ex) => ({ ...ex, completed: false })));
      }
    };
    fetchData();
  }, [id]);

  const toggleExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const handleFinishWorkout = async () => {
    if (progressPercentage < 1) return;

    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("attendance").insert({
      user_id: user?.id,
      date: today,
    });

    if (error && error.code !== "23505") console.log("Erro de presença:", error);
    
    alert("Treino Concluído! Excelente trabalho! 💪");
    router.back();
  };

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
          {workout.description ? <Text style={styles.workoutDescription}>{workout.description}</Text> : null}
        </View>
      )}

      {/* BARRA DE PROGRESSO */}
      <View style={styles.progressContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={styles.progressText}>Progresso</Text>
          <Text style={styles.progressText}>{completedCount} de {totalCount}</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                backgroundColor: progressPercentage === 1 ? "#00E676" : "#FF005E",
              },
            ]}
          />
        </View>
      </View>

      {/* LISTA DE EXERCÍCIOS */}
      <FlatList
        style={{ marginTop: 25 }}
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <ExerciseStudentCard item={item} index={index} onToggle={toggleExercise} />
        )}
      />

      {/* BOTÃO FINALIZAR (Fixo na parte inferior) */}
      {totalCount > 0 && (
        <TouchableOpacity
          style={[styles.finishButton, progressPercentage === 1 ? styles.finishButtonReady : styles.finishButtonDisabled]}
          disabled={progressPercentage < 1}
          onPress={handleFinishWorkout}
        >
          <Text style={[styles.finishButtonText, progressPercentage === 1 ? { color: "#111" } : { color: "#fff" }]}>
            {progressPercentage === 1 ? "Finalizar Treino" : "Complete todos os exercícios"}
          </Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, marginTop: 10 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  workoutTitle: { color: "#FF005E", fontSize: 26, fontWeight: "800" },
  workoutDescription: { color: "#aaa", marginTop: 6, fontSize: 15 },
  
  progressContainer: { marginTop: 10 },
  progressText: { color: "#ccc", fontWeight: "600" },
  progressBarBackground: { height: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" },
  progressBarFill: { height: 10, borderRadius: 10 },

  // Estilos do Cartão do Exercício
  exerciseCard: { padding: 15, marginBottom: 15, borderRadius: 20 },
  exerciseCardCompleted: { backgroundColor: "rgba(255,255,255,0.02)", borderColor: "transparent" },
  cardRow: { flexDirection: "row", alignItems: "center" },
  
  videoContainer: { width: 65, height: 65, borderRadius: 14, overflow: "hidden", backgroundColor: "#000" },
  videoThumbnail: { width: "100%", height: "100%" },
  indexCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255, 255, 255, 0.1)", justifyContent: "center", alignItems: "center" },
  indexText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  
  exerciseTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  textCompleted: { textDecorationLine: "line-through", color: "#666" },
  exerciseDetails: { color: "#aaa", marginTop: 4, fontSize: 14, lineHeight: 20 },
  
  checkButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  checkButtonCompleted: { backgroundColor: "#00E676", borderColor: "#00E676" },

  // Botão Fixo
  finishButton: { position: "absolute", bottom: 30, left: 20, right: 20, padding: 18, borderRadius: 16, alignItems: "center", elevation: 5 },
  finishButtonDisabled: { backgroundColor: "rgba(255, 0, 94, 0.4)" },
  finishButtonReady: { backgroundColor: "#00E676" },
  finishButtonText: { fontWeight: "800", fontSize: 16 },
});