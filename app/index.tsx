import { getProfile } from "@/services/auth.service";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🔎 Verificando sessão...");

        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.log("❌ Sem sessão → login");
          router.replace("/auth/login");
          return;
        }

        console.log("✅ Sessão válida");

        console.log("🔎 Buscando profile...");
        const profile = await getProfile();

        if (!profile) {
          console.log("❌ Profile não encontrado. Quebrando o loop!");
          
          // 🔥 AQUI ESTÁ A MÁGICA PARA QUEBRAR O LOOP FANTASMA:
          await supabase.auth.signOut(); // Desloga a sessão presa
          
          Alert.alert(
            "Erro de Perfil",
            "A sua conta existe, mas o seu perfil não foi encontrado na base de dados. O seu ID (UID) pode estar dessincronizado. Fale com o suporte."
          );
          
          router.replace("/auth/login");
          return;
        }

        console.log("✅ Profile encontrado:", profile);

        setUser(profile);

        // 🔥 Redirecionamento robusto por role
        switch (profile.role) {
          case "admin":
            router.replace("/admin/dashboard");
            break;

          case "professor":
            router.replace("/teacher/dashboard");
            break;

          case "student":
          default:
            router.replace("/student/home");
            break;
        }
      } catch (err) {
        console.log("🔥 Erro inesperado no init:", err);
        await supabase.auth.signOut();
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#161616" }}>
        <ActivityIndicator size="large" color="#FF005E" />
      </View>
    );
  }

  return null;
}