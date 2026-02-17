import { Screen } from "@/components/Screen";
import { getProfessores } from "@/services/admin-professores.service";
import { createUser } from "@/services/admin.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CriarAluno() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [professores, setProfessores] = useState<any[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vai buscar os professores da academia para mostrar na lista de vínculo
    const loadProfs = async () => {
      try {
        const data = await getProfessores();
        setProfessores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar professores:", error);
      }
    };
    loadProfs();
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Email inválido";
    if (!form.password || form.password.length < 6) newErrors.password = "A senha deve ter pelo menos 6 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // Aqui o vínculo acontece! Passamos o selectedProfId para o serviço
      await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "student",
        professor_id: selectedProfId, // Pode ser null ou o ID de um professor
      });

      // Volta para a lista de alunos
      router.replace("/admin/alunos");
    } catch (err: any) {
      setErrors({ general: err.message || "Erro ao criar aluno" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Criar Aluno</Text>

        {errors.general && <Text style={styles.errorGeneral}>{errors.general}</Text>}

        <View>
          <TextInput
            placeholder="Nome do Aluno"
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
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>

        <View>
          <TextInput
            placeholder="Senha de Acesso"
            placeholderTextColor="#aaa"
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
          />
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        </View>

        {/* SECÇÃO PARA VINCULAR O PROFESSOR */}
        <View style={styles.profSection}>
          <Text style={styles.profLabel}>Vincular Professor (Opcional):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.chip, selectedProfId === null && styles.chipActive]}
              onPress={() => setSelectedProfId(null)}
            >
              <Text style={[styles.chipText, selectedProfId === null && styles.chipTextActive]}>Nenhum</Text>
            </TouchableOpacity>

            {/* Renderiza a lista de professores disponíveis */}
            {professores.map((prof) => (
              <TouchableOpacity
                key={prof.id}
                style={[styles.chip, selectedProfId === prof.id && styles.chipActive]}
                onPress={() => setSelectedProfId(prof.id)}
              >
                <Text style={[styles.chipText, selectedProfId === prof.id && styles.chipTextActive]}>
                  {prof.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registar Aluno</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40, paddingTop: 20 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 30, textAlign: "center" },
  input: { backgroundColor: "rgba(255,255,255,0.08)", padding: 16, borderRadius: 14, color: "#fff", marginBottom: 5 },
  inputError: { borderWidth: 1, borderColor: "#FF4D4D" },
  error: { color: "#FF4D4D", fontSize: 12, marginBottom: 10, marginLeft: 5 },
  errorGeneral: { color: "#FF4D4D", textAlign: "center", marginBottom: 15 },
  
  profSection: { marginTop: 10, marginBottom: 20 },
  profLabel: { color: "#aaa", fontSize: 14, marginBottom: 10, marginLeft: 5, fontWeight: "600" },
  chipContainer: { gap: 10, paddingRight: 20 },
  chip: { backgroundColor: "rgba(255,255,255,0.08)", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  chipActive: { backgroundColor: "#FF005E" },
  chipText: { color: "#aaa", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  button: { backgroundColor: "#FF005E", padding: 18, borderRadius: 16, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});