import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TreinoDetalhe() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const completedCount = exercises.filter((e) => e.completed).length;
  const totalCount = exercises.length;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressPercentage = totalCount > 0 ? completedCount / totalCount : 0;
  const user = useAuthStore((state) => state.user);
  const handleFinishWorkout = async () => {
    if (progressPercentage < 1) return;

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("attendance").insert({
      user_id: user?.id,
      date: today,
    });

    if (error && error.code !== "23505") {
      console.log("Erro ao registrar presença:", error);
    }

    router.back();
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  useEffect(() => {
    if (!id) return;

    const fetchWorkout = async () => {
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setWorkout(data);
    };

    const fetchExercises = async () => {
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", id);

      if (data) {
        const formatted = data.map((ex) => ({
          ...ex,
          completed: false,
        }));
        setExercises(formatted);
      }
    };

    fetchWorkout();
    fetchExercises();
  }, [id]);

  const toggleExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex,
      ),
    );
  };
  return (
    <Screen>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(17, 16, 16, 0.58)",
          padding: 20,
          borderRadius: 30,
          opacity: 10,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Treino</Text>
        </View>

        {/* TITULO TREINO */}
        {workout && (
          <>
            <Text style={styles.workoutTitle}>{workout.name}</Text>

            <Text style={styles.workoutDescription}>{workout.description}</Text>
          </>
        )}

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progresso: {completedCount} de {totalCount}
          </Text>

          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor:
                    progressPercentage === 1 ? "#00E676" : "#FF005E",
                },
              ]}
            />
          </View>
        </View>

        {/* EXERCICIOS */}
        <FlatList
          style={{ marginTop: 25 }}
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Card style={styles.exerciseCard}>
              {/* NUMERO */}
              <Text style={styles.exerciseIndex}>{index + 1}.</Text>

              {/* CONTEÚDO */}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => toggleExercise(item.id)}
              >
                <Text
                  style={[
                    styles.exerciseTitle,
                    item.completed && {
                      textDecorationLine: "line-through",
                      color: "#FF005E",
                    },
                  ]}
                >
                  {item.name}
                </Text>

                <Text style={styles.exerciseDetails}>
                  {item.sets} x {item.reps} • Descanso {item.rest_seconds}s
                </Text>
              </TouchableOpacity>

              {/* BOTÃO VIDEO */}
              {item.video_url && (
                <TouchableOpacity
                  onPress={() => setSelectedVideo(item.video_url)}
                >
                  <Feather name="play-circle" size={28} color="#fff" />
                </TouchableOpacity>
              )}
            </Card>
          )}
        />

        {/* BOTÃO FINALIZAR */}

        <TouchableOpacity
          style={[
            styles.finishButton,
            { opacity: progressPercentage === 1 ? 1 : 0.5 },
          ]}
          disabled={progressPercentage < 1}
          onPress={handleFinishWorkout}
        >
          <Text style={styles.finishButtonText}>Finalizar treino</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!selectedVideo} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedVideo(null)}
          >
            <Feather name="x" size={28} color="#fff" />
          </TouchableOpacity>

          {selectedVideo && (
            <Video
              source={{ uri: selectedVideo }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },

  video: {
    width: "100%",
    height: 300,
  },

  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  workoutTitle: {
    color: "#FF005E",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
  },
  workoutDescription: {
    color: "#ccc",
    marginTop: 5,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 18,
  },
  exerciseIndex: {
    color: "#FF005E",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 15,
  },
  exerciseTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseDetails: {
    color: "#aaa",
    marginTop: 3,
  },
  finishButton: {
    backgroundColor: "#FF005E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  progressContainer: {
    marginTop: 15,
  },

  progressText: {
    color: "#ccc",
    marginBottom: 6,
  },

  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBarFill: {
    height: 8,
    borderRadius: 10,
  },
});
