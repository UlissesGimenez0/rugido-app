import { Screen } from "@/components/Screen";
import { createUser } from "@/services/admin.service";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CriarProfessor() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (form.name.length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (form.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "professor",
      });

      router.replace("/admin/professores");
    } catch (err: any) {
      setErrors({ general: err.message || "Erro ao criar professor" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // limpa erro ao digitar
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Professor</Text>

        {errors.general && (
          <Text style={styles.errorGeneral}>{errors.general}</Text>
        )}

        <View>
          <TextInput
            placeholder="Nome"
            placeholderTextColor="#aaa"
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            style={[styles.input, errors.name && styles.inputError]}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        <View>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            style={[styles.input, errors.email && styles.inputError]}
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>

        <View>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#aaa"
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Criar Professor</Text>
          )}
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
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
    color: "#fff",
    marginBottom: 5,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF4D4D",
  },
  error: {
    color: "#FF4D4D",
    fontSize: 12,
    marginBottom: 10,
  },
  errorGeneral: {
    color: "#FF4D4D",
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#FF005E",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
