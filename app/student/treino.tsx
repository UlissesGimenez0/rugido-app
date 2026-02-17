import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Treino() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWorkouts = async () => {
      setLoading(true);
      // Puxa os treinos e o nome da categoria associada
      const { data } = await supabase
        .from("workouts")
        .select(`*, workout_types(id, name)`)
        .eq("user_id", user.id)
        .eq("is_template", false)
        .order("created_at", { ascending: false });

      if (data) {
        setWorkouts(data);

        // Extrai as categorias únicas que este aluno realmente tem
        const uniqueCategories = new Map();
        data.forEach((wk) => {
          if (wk.workout_type_id && wk.workout_types) {
            uniqueCategories.set(wk.workout_type_id, {
              id: wk.workout_type_id,
              name: wk.workout_types.name,
            });
          }
        });
        setCategories(Array.from(uniqueCategories.values()));
      }
      setLoading(false);
    };

    fetchWorkouts();
  }, [user]);

  // Filtra os treinos com base no botão selecionado
  const filteredWorkouts = selectedCategory === "all"
    ? workouts
    : workouts.filter((wk) => wk.workout_type_id === selectedCategory);

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Treinos</Text>
      </View>
      <Text style={styles.subtitle}>Escolha o que vamos treinar hoje</Text>

      {/* BARRA DE CATEGORIAS HORIZONTAL */}
      {!loading && workouts.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.chip, selectedCategory === "all" && styles.activeChip]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text style={[styles.chipText, selectedCategory === "all" && styles.activeChipText]}>
                Todos
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, selectedCategory === cat.id && styles.activeChip]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.chipText, selectedCategory === cat.id && styles.activeChipText]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* LISTA DE TREINOS */}
      {loading ? (
        <ActivityIndicator color="#FF005E" size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          style={{ marginTop: 15 }}
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="frown" size={40} color="#555" />
              <Text style={styles.emptyText}>Nenhum treino encontrado.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/student/treino/${item.id}`)}>
              <Card style={styles.workoutCard}>
                <View style={styles.iconBox}>
                  <Feather name="activity" size={24} color="#FF005E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutTitle}>{item.name}</Text>
                  <Text style={styles.categoryTag}>
                    {item.workout_types?.name || "Sem Categoria"}
                  </Text>
                  {item.description ? (
                    <Text style={styles.workoutDescription} numberOfLines={1}>{item.description}</Text>
                  ) : null}
                </View>
                <Feather name="chevron-right" size={20} color="#555" />
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 5, marginTop: 10 },
  backBtn: { marginRight: 15 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#aaa", fontSize: 15, marginBottom: 15 },
  
  filterContainer: { height: 50, marginBottom: 10 },
  chip: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, justifyContent: "center" },
  activeChip: { backgroundColor: "#FF005E" },
  chipText: { color: "#aaa", fontWeight: "600", fontSize: 14 },
  activeChipText: { color: "#fff", fontWeight: "bold" },

  workoutCard: { flexDirection: "row", alignItems: "center", marginBottom: 15, padding: 18, borderRadius: 20 },
  iconBox: { width: 46, height: 46, borderRadius: 15, backgroundColor: "rgba(255, 0, 94, 0.15)", justifyContent: "center", alignItems: "center", marginRight: 15 },
  workoutTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  categoryTag: { color: "#FF005E", fontSize: 12, fontWeight: "700", marginTop: 2 },
  workoutDescription: { color: "#888", marginTop: 4, fontSize: 13 },
  
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#aaa", fontSize: 18, fontWeight: "600", marginTop: 15 },
});