import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { getMeusAlunos } from "@/services/teacher-alunos.service";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
  
export default function MeusAlunos() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMeusAlunos();
      setAlunos(data);
    } catch (err) {
      console.error("Erro ao carregar os meus alunos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <Screen>
        <ActivityIndicator color="#FF005E" size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Alunos</Text>
      </View>

      <FlatList
        data={alunos}
        keyExtractor={(item, index) => (item?.id ? item.id : `aluno-${index}`)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/teacher/aluno/${item.id}/${item.id}`)}
          >
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.infoContainer}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email || "Aluno"}</Text>
                  </View>
                </View>

                <Feather name="chevron-right" size={24} color="#666" />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color="#333" style={{ marginBottom: 15 }} />
            <Text style={styles.empty}>Nenhum aluno vinculado a si no momento.</Text>
            <Text style={styles.emptySub}>Peça ao administrador para vincular alunos.</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25, 
    marginTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  card: {
    marginBottom: 15,
    padding: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0, 230, 118, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#00E676",
    fontSize: 20,
    fontWeight: "bold",
  },
  name: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  email: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 3,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  empty: {
    color: "#888",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySub: {
    color: "#555",
    textAlign: "center",
    fontSize: 14,
    marginTop: 5,
  }
});