import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Treino() {
  const router = useRouter();

  const [types, setTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await supabase.from("workout_types").select("*");

      if (data) {
        setTypes(data);
        if (data.length > 0) {
          setSelectedType(data[0].id);
        }
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    if (!selectedType) return;

    const fetchWorkouts = async () => {
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("workout_type_id", selectedType);

      if (data) setWorkouts(data);
    };

    fetchWorkouts();
  }, [selectedType]);

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Treinos</Text>
      </View>

      <Text style={styles.subtitle}>Escolha o tipo de treino</Text>

      {/* TIPOS */}
      <View style={styles.typesContainer}>
        {types.map((type) => {
          const isSelected = selectedType === type.id;

          return (
            <TouchableOpacity
              key={type.id}
              onPress={() => setSelectedType(type.id)}
              style={[styles.typeChip, isSelected && styles.activeChip]}
            >
              <Text
                style={[styles.typeText, isSelected && styles.activeChipText]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LISTA TREINOS */}
      <FlatList
        style={{ marginTop: 30 }}
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/student/treino/${item.id}`)}
          >
            <Card style={styles.workoutCard}>
              <Text style={styles.workoutTitle}>{item.name}</Text>

              <Text style={styles.workoutDescription}>{item.description}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 15,
  },

  subtitle: {
    color: "#ccc",
    marginTop: 5,
  },
  typesContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  typeChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  activeChip: {
    backgroundColor: "#FF005E",
  },
  typeText: {
    color: "#fff",
    fontWeight: "500",
  },
  activeChipText: {
    fontWeight: "700",
  },
  workoutCard: {
    marginBottom: 20,
    borderRadius: 14,
  },
  workoutTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  workoutDescription: {
    color: "#ccc",
    marginTop: 5,
  },
});
