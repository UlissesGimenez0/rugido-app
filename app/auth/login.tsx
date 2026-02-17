import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

    // O router.replace vai acontecer, por isso não precisamos de desligar o loading aqui
    router.replace("/");
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            
            {/* LOGO E TEXTOS */}
            <View style={styles.header}>
              <Image
                source={require("../../assets/images/logo.png")}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.title}>Acesse sua conta</Text>
              <Text style={styles.subtitle}>Bem-vindo de volta ao Rugido</Text>
            </View>

            {/* FORMULÁRIO */}
            <Card style={styles.card}>
              
              {/* CAMPO DE EMAIL */}
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

              {/* CAMPO DE SENHA */}
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

              {/* BOTÃO DE LOGIN */}
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
            
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.95,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 5,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 15,
  },
  card: {
    padding: 24,
    borderRadius: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 56, // Altura fixa para um toque melhor
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: "100%", // Preenche a altura do container
  },
  button: {
    backgroundColor: "#FF005E",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#FF005E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5, // Sombra no Android
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});