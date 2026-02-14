import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CriarTreino() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateWorkout = async () => {
    if (!name) return;

    await supabase.from("workouts").insert({
      user_id: id,
      name,
      description,
    });

    router.back();
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Novo Treino</Text>

        <TextInput
          placeholder="Nome do treino"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Descrição"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateWorkout}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 15,
    borderRadius: 12,
    color: "#fff",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#FF005E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
