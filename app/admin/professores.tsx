import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { deleteProfessor, getProfessores } from "@/services/admin-professores.service";

import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Professores() {
  const user = useAuthStore((state) => state.user);
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProfessores();
      setProfessores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Professor",
      "Tem certeza que deseja excluir este professor?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProfessor(id);

              // 🔥 Atualiza lista sem reload
              setProfessores((prev) => prev.filter((prof) => prof.id !== id));
            } catch (err: any) {
              alert(err.message || "Erro ao excluir.");
            }
          },
        },
      ],
    );
  };

  if (!user || loading) {
    return (
      <Screen>
        <ActivityIndicator color="#fff" />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={professores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.index}>Professor #{index + 1}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum professor encontrado.</Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  index: {
    color: "#888",
    fontSize: 12,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
  },
  empty: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },
});
