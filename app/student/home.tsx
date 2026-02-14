import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  return (
    <Screen>
      {/* LOGO */}
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* NOME */}
      <Text style={styles.greeting}>Olá, {user?.name}</Text>

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
      <Text style={[styles.sectionTitle, { marginTop: 35 }]}>
        Acesso rápido
      </Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push("/student/financeiro")}
        >
          <Card style={styles.squareCard}>
            <Feather name="dollar-sign" size={24} color="#fff" />
            <Text style={styles.cardTitle}>Financeiro</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push("/student/treino")}
        >
          <Card style={styles.squareCard}>
            <Feather name="activity" size={24} color="#fff" />
            <Text style={styles.cardTitle}>Treinos</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItemFull}
          onPress={() => router.push("/student/frequencia")}
        >
          <Card style={styles.squareCard}>
            <Feather name="calendar" size={24} color="#fff" />
            <Text style={styles.cardTitle}>Frequência</Text>
          </Card>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 10,
  },

  greeting: {
    color: "#FF005E",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "left",
    marginTop: 5,
  },

  sectionTitle: {
    color: "#ddd",
    fontSize: 16,
    marginTop: 20,
  },

  daysContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },

  dayChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  activeDayChip: {
    backgroundColor: "#FF005E",
  },

  dayText: {
    color: "#fff",
    fontWeight: "600",
  },

  activeDayText: {
    fontWeight: "bold",
  },

  grid: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "48%",
    marginBottom: 15,
  },

  gridItemFull: {
    width: "100%",
  },

  squareCard: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 35,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },
  completedDayChip: {
    backgroundColor: "#00E676",
  },

  todayChip: {
    borderWidth: 2,
    borderColor: "#FF005E",
  },
});
