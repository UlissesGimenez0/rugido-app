import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // <-- Removemos o TouchableWithoutFeedback daqui

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

      if (isIOS && !isStandalone) {
        setShowIOSPrompt(true);
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.replace("/");
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* O ScrollView agora é o "rei", sem escudos à volta a roubar os cliques! */}
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            
            <View style={styles.header}>
              <Image
                source={require("../../assets/images/logo.png")}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.title}>Acesse sua conta</Text>
              <Text style={styles.subtitle}>Bem-vindo de volta ao Rugido</Text>
            </View>

            <Card style={styles.card}>
              
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  placeholder="Seu email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  placeholder="Sua senha"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>
              
            </Card>

            {showIOSPrompt && (
              <View style={styles.iosPromptContainer}>
                <Text style={styles.iosPromptTitle}>Instale o Rugido App! 🦁</Text>
                <Text style={styles.iosPromptText}>
                  Para uma melhor experiência, instale a nossa app no seu iPhone:
                </Text>
                <View style={styles.iosInstructionRow}>
                  <Text style={styles.iosInstructionText}>1. Toque em Partilhar (</Text>
                  <Feather name="share" size={16} color="#00E676" style={{ marginHorizontal: 2 }} />
                  <Text style={styles.iosInstructionText}>)</Text>
                </View>
                <View style={styles.iosInstructionRow}>
                  <Text style={styles.iosInstructionText}>2. Escolha "Adicionar ao Ecrã Principal"</Text>
                </View>
                <TouchableOpacity onPress={() => setShowIOSPrompt(false)} style={styles.iosCloseBtn}>
                  <Text style={styles.iosCloseText}>Entendi</Text>
                </TouchableOpacity>
              </View>
            )}
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  innerContainer: { paddingVertical: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  logo: { width: 150, height: 150, marginBottom: 20, opacity: 0.95 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 5 },
  subtitle: { color: "#aaa", fontSize: 15 },
  card: { padding: 24, borderRadius: 24 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", borderRadius: 16, marginBottom: 15, paddingHorizontal: 15, height: 56 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 16, height: "100%", outlineStyle: 'none' as any },
  button: { backgroundColor: "#FF005E", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 15, shadowColor: "#FF005E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  iosPromptContainer: { backgroundColor: "rgba(0, 230, 118, 0.15)", borderWidth: 1, borderColor: "#00E676", borderRadius: 16, padding: 18, marginTop: 30, alignItems: "center" },
  iosPromptTitle: { color: "#00E676", fontSize: 16, fontWeight: "800", marginBottom: 6 },
  iosPromptText: { color: "#ccc", fontSize: 13, textAlign: "center", marginBottom: 12 },
  iosInstructionRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  iosInstructionText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  iosCloseBtn: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },
  iosCloseText: { color: "#fff", fontSize: 13, fontWeight: "700" }
});