import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  const days = ["D", "S", "T", "Q", "Q", "S", "S"];
  const todayIndex = new Date().getDay();
  const user = useAuthStore((state) => state.user);
  const [attendanceDays, setAttendanceDays] = useState<number[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAttendance = async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const { data } = await supabase
        .from("attendance")
        .select("date")
        .eq("user_id", user.id)
        .gte("date", startOfWeek.toISOString().split("T")[0]);

      if (data) {
        const days = data.map((item) => new Date(item.date).getDay());
        setAttendanceDays(days);
      }
    };

    fetchAttendance();
  }, [user]);

  const handleLogout = async () => {
    const executeSignOut = async () => {
      await supabase.auth.signOut();
      router.replace("/auth/login");
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Tem certeza que deseja terminar a sessão?")) executeSignOut();
      return;
    }

    Alert.alert("Sair", "Tem certeza que deseja terminar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: executeSignOut },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoMini}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.greetingTitle}>Olá, {user?.name?.split(" ")[0]}</Text>
            <Text style={styles.greetingSub}>Pronto para treinar?</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* SEMANA */}
      <Text style={styles.sectionTitle}>Sua semana</Text>

      <View style={styles.daysContainer}>
        {days.map((day, index) => {
          const isToday = index === todayIndex;
          const isCompleted = attendanceDays.includes(index);

          return (
            <View
              key={index}
              style={[
                styles.dayChip,
                isCompleted && styles.completedDayChip,
                isToday && styles.todayChip,
              ]}
            >
              <Text style={[styles.dayText, isToday && styles.activeDayText]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ACESSO RÁPIDO */}
      <Text style={[styles.sectionTitle, { marginTop: 35 }]}>Acesso rápido</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push("/student/financeiro")}
        >
          <Card style={styles.squareCard}>
            <Feather name="dollar-sign" size={28} color="#00E676" />
            <Text style={styles.cardTitle}>Financeiro</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push("/student/treino")}
        >
          <Card style={styles.squareCard}>
            <Feather name="activity" size={28} color="#FF005E" />
            <Text style={styles.cardTitle}>Treinos</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItemFull}
          onPress={() => router.push("/student/frequencia")}
        >
          <Card style={styles.squareCardRow}>
            <View style={styles.iconCircle}>
              <Feather name="calendar" size={24} color="#007AFF" />
            </View>
            <View>
              <Text style={styles.cardTitleRow}>Minha Frequência</Text>
              <Text style={styles.cardSubRow}>Ver histórico de treinos</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#555" style={{ marginLeft: "auto" }} />
          </Card>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoMini: {
    width: 45,
    height: 45,
  },
  greetingTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  greetingSub: { color: "#FF005E", fontSize: 13, fontWeight: "600" },
  logoutButton: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: { color: "#ddd", fontSize: 16, marginTop: 10 },
  daysContainer: { flexDirection: "row", marginTop: 15, justifyContent: "space-between" },
  dayChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { color: "#fff", fontWeight: "600" },
  activeDayText: { fontWeight: "bold" },
  completedDayChip: { backgroundColor: "#00E676" },
  todayChip: { borderWidth: 2, borderColor: "#FF005E" },
  grid: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "48%", marginBottom: 15 },
  gridItemFull: { width: "100%" },
  squareCard: { borderRadius: 20, alignItems: "center", justifyContent: "center", paddingVertical: 35 },
  cardTitle: { color: "#fff", fontSize: 16, marginTop: 12, fontWeight: "600" },
  squareCardRow: { borderRadius: 20, flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  iconCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(0, 122, 255, 0.15)", justifyContent: "center", alignItems: "center" },
  cardTitleRow: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cardSubRow: { color: "#aaa", fontSize: 13, marginTop: 2 },
});